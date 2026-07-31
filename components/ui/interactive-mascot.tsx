"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, PerformanceMonitor, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export type MascotPose = "relaxed" | "celebrate";
export type MascotQuality = "auto" | "desktop" | "mobile";

export interface InteractiveMascotProps {
  className?: string;
  pose?: MascotPose;
  /** muda a cada disparo para reexecutar a pose mesmo sem trocar de estado */
  animationTrigger?: number;
  desktopModelUrl?: string;
  mobileModelUrl?: string;
  quality?: MascotQuality;
  followPointer?: boolean;
  gyro?: boolean;
  pointerStrength?: number;
  breathing?: boolean;
  shadows?: boolean;
  onMascotClick?: () => void;
  onLoaded?: () => void;
  ariaLabel?: string;
}

const DEG = THREE.MathUtils.degToRad;

/* ------------------------------------------------------------------ *
 * O rig do Meshy vem em T-pose: os braços saem retos para os lados e
 * cada bone aponta pelo seu +Y local, com rotações de bind irregulares.
 * Em vez de tentar adivinhar o eixo local de cada osso, as poses abaixo
 * são escritas em ÂNGULOS DE MUNDO (Z = levantar/baixar o braço,
 * X = trazer para frente/trás, Y = girar) e convertidas para o espaço do
 * pai em tempo de execução. Assim os números continuam legíveis: "-72 em
 * Z" é literalmente "braço 72° abaixo da horizontal".
 * ------------------------------------------------------------------ */
type WorldAngles = { x?: number; y?: number; z?: number };
type PoseMap = Record<string, WorldAngles>;

const POSE_RELAXED: PoseMap = {
  LeftArm: { z: -74, x: 6 },
  RightArm: { z: 74, x: 6 },
  LeftForeArm: { z: -8, x: 4 },
  RightForeArm: { z: 8, x: 4 },
  LeftShoulder: { z: -4 },
  RightShoulder: { z: 4 },
  Spine01: {},
  Hips: {},
};

// Braços em "V": o úmero sobe pouco e para FORA (senão os cotovelos colam na
// cabeça) e o antebraço faz o resto do caminho para cima.
const POSE_CELEBRATE: PoseMap = {
  LeftArm: { z: 30, x: 12 },
  RightArm: { z: -30, x: 12 },
  LeftForeArm: { z: 54, x: 6 },
  RightForeArm: { z: -54, x: 6 },
  LeftShoulder: { z: 12 },
  RightShoulder: { z: -12 },
  Spine01: { x: -5 },
  Hips: {},
};

const POSE_BONES = Object.keys(POSE_RELAXED);

const HEAD_MAX_YAW = 24;
const HEAD_MAX_PITCH = 13;
const HEAD_MAX_ROLL = 3;
/** o pescoço puxa uma fração do giro; o resto vai para a cabeça */
const NECK_SHARE = 0.35;
const POINTER_DEAD_ZONE = 0.04;
/** comemorando, o astronauta também olha um pouco para cima */
const CELEBRATE_HEAD_PITCH = 7;

type BoneRig = {
  bone: THREE.Object3D;
  bind: THREE.Quaternion;
  bindY: number;
  parentWorld: THREE.Quaternion;
  parentWorldInv: THREE.Quaternion;
};

function getMediaMatch(query: string): boolean {
  return typeof window !== "undefined" && window.matchMedia(query).matches;
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => getMediaMatch(query));

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}

function usePageVisible(): boolean {
  const [visible, setVisible] = useState(
    () => typeof document === "undefined" || document.visibilityState === "visible",
  );

  useEffect(() => {
    const update = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  return visible;
}

function useViewportActivity<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  // sem IntersectionObserver não há como adiar nada: já começa ativo
  const noObserver = () => typeof IntersectionObserver === "undefined";
  const [hasEntered, setHasEntered] = useState(noObserver);
  const [intersecting, setIntersecting] = useState(noObserver);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIntersecting(entry.isIntersecting);
        if (entry.isIntersecting) setHasEntered(true);
      },
      { rootMargin: "260px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, hasEntered, intersecting };
}

function applyDeadZone(value: number, deadZone = POINTER_DEAD_ZONE): number {
  const absolute = Math.abs(value);
  if (absolute <= deadZone) return 0;
  return Math.sign(value) * ((absolute - deadZone) / (1 - deadZone));
}

function StudioEnvironment({ intensity = 1 }: { intensity?: number }) {
  const { gl, scene } = useThree();

  useEffect(() => {
    const previousEnvironment = scene.environment;
    const pmrem = new THREE.PMREMGenerator(gl);
    pmrem.compileCubemapShader();
    const room = new RoomEnvironment();
    const renderTarget = pmrem.fromScene(room, 0.04);

    // Mutar a cena é a própria API do three.js — o objeto vem do renderer, não
    // do estado do React. A regra de imutabilidade não se aplica aqui.
    /* eslint-disable react-hooks/immutability */
    scene.environment = renderTarget.texture;
    if ("environmentIntensity" in scene) {
      (scene as THREE.Scene & { environmentIntensity: number }).environmentIntensity =
        intensity;
    }

    return () => {
      scene.environment = previousEnvironment;
      /* eslint-enable react-hooks/immutability */
      renderTarget.dispose();
      room.dispose();
      pmrem.dispose();
    };
  }, [gl, intensity, scene]);

  return null;
}

function AdaptiveQuality({ mobile }: { mobile: boolean }) {
  const { setDpr } = useThree();
  const highDpr = mobile ? 1.1 : 1.5;

  return (
    <PerformanceMonitor
      flipflops={3}
      onIncline={() => setDpr(highDpr)}
      onDecline={() => setDpr(1)}
      onFallback={() => setDpr(1)}
    />
  );
}

interface MascotSceneProps {
  modelUrl: string;
  pose: MascotPose;
  animationTrigger: number;
  followPointer: boolean;
  mobileGyro: boolean;
  pointerStrength: number;
  breathing: boolean;
  reducedMotion: boolean;
  active: boolean;
  onMascotClick?: () => void;
  onLoaded?: () => void;
}

function MascotScene({
  modelUrl,
  pose,
  animationTrigger,
  followPointer,
  mobileGyro,
  pointerStrength,
  breathing,
  reducedMotion,
  active,
  onMascotClick,
  onLoaded,
}: MascotSceneProps) {
  // draco desligado de propósito: o modelo usa meshopt (decoder empacotado
  // localmente), então nada é buscado em CDN de terceiros.
  const gltf = useGLTF(modelUrl, false, true);
  const model = useMemo(() => clone(gltf.scene) as THREE.Group, [gltf.scene]);
  const { gl, invalidate } = useThree();

  const initializedRef = useRef<THREE.Group | null>(null);
  const rigRef = useRef<Map<string, BoneRig>>(new Map());
  const neckRef = useRef<BoneRig | null>(null);
  const headRef = useRef<BoneRig | null>(null);

  const pointerRef = useRef(new THREE.Vector2());
  const pointerInsideRef = useRef(false);
  const hoveredRef = useRef(false);

  // estado contínuo da animação (fora do React: nada disso deve re-renderizar)
  const blendRef = useRef(pose === "celebrate" ? 1 : 0);
  const blendVelRef = useRef(0);
  const headYawRef = useRef(0);
  const headPitchRef = useRef(0);
  const clockRef = useRef(0);

  const targetBlend = pose === "celebrate" ? 1 : 0;

  // escratches reutilizados: alocar dentro do useFrame vira pico de GC
  const scratch = useMemo(
    () => ({
      q: new THREE.Quaternion(),
      qOut: new THREE.Quaternion(),
      e: new THREE.Euler(0, 0, 0, "ZXY"),
    }),
    [],
  );

  const bindRig = useCallback(() => {
    const rig = new Map<string, BoneRig>();
    model.updateWorldMatrix(true, true);

    const register = (name: string) => {
      const bone = model.getObjectByName(name);
      if (!bone) return null;
      const parentWorld = new THREE.Quaternion();
      bone.parent?.getWorldQuaternion(parentWorld);
      const entry: BoneRig = {
        bone,
        bind: bone.quaternion.clone(),
        bindY: bone.position.y,
        parentWorld,
        parentWorldInv: parentWorld.clone().invert(),
      };
      rig.set(name, entry);
      return entry;
    };

    for (const name of POSE_BONES) register(name);
    neckRef.current = register("neck");
    headRef.current = register("Head");
    rigRef.current = rig;
  }, [model]);

  /**
   * Aplica uma rotação expressa em EIXOS DE MUNDO a um bone.
   * Orientação de mundo desejada: R * (P * bind)  →  local = P⁻¹ · R · P · bind
   */
  const applyWorldRotation = useCallback(
    (rig: BoneRig, x: number, y: number, z: number) => {
      const { q, qOut, e } = scratch;
      e.set(DEG(x), DEG(y), DEG(z), "ZXY");
      q.setFromEuler(e);
      qOut
        .copy(rig.parentWorldInv)
        .multiply(q)
        .multiply(rig.parentWorld)
        .multiply(rig.bind);
      rig.bone.quaternion.copy(qOut);
    },
    [scratch],
  );

  const applyBlendedPose = useCallback(
    (blend: number) => {
      const rig = rigRef.current;
      for (const name of POSE_BONES) {
        const entry = rig.get(name);
        if (!entry) continue;
        const a = POSE_RELAXED[name];
        const b = POSE_CELEBRATE[name];
        applyWorldRotation(
          entry,
          THREE.MathUtils.lerp(a.x ?? 0, b.x ?? 0, blend),
          THREE.MathUtils.lerp(a.y ?? 0, b.y ?? 0, blend),
          THREE.MathUtils.lerp(a.z ?? 0, b.z ?? 0, blend),
        );
      }
    },
    [applyWorldRotation],
  );

  // preparo do modelo: materiais, anisotropia e pose inicial
  useEffect(() => {
    if (initializedRef.current === model) return;
    initializedRef.current = model;

    const maxAnisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());

    model.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.frustumCulled = false; // malha com skin: o bounding box do bind mente
      // o ponteiro é testado contra uma caixa invisível, não contra a malha
      object.raycast = () => undefined;

      const materials = Array.isArray(object.material)
        ? object.material.map((m) => m.clone())
        : [object.material.clone()];

      for (const material of materials) {
        const pbr = material as THREE.MeshStandardMaterial;
        if ("envMapIntensity" in pbr) pbr.envMapIntensity = 1.15;
        for (const texture of [pbr.map, pbr.roughnessMap, pbr.normalMap]) {
          if (!texture) continue;
          texture.anisotropy = maxAnisotropy;
          texture.needsUpdate = true;
        }
      }

      object.material = Array.isArray(object.material) ? materials : materials[0];
    });

    bindRig();
    blendRef.current = pose === "celebrate" ? 1 : 0;
    blendVelRef.current = 0;
    applyBlendedPose(blendRef.current);
    onLoaded?.();
    invalidate();
  }, [applyBlendedPose, bindRig, gl, invalidate, model, onLoaded, pose]);

  // um novo trigger reacende o laço mesmo se a pose repetir
  useEffect(() => {
    invalidate();
  }, [animationTrigger, pose, invalidate]);

  useEffect(() => {
    const canvas = gl.domElement;

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      if (bounds.width === 0 || bounds.height === 0) return;
      pointerRef.current.set(
        applyDeadZone(((event.clientX - bounds.left) / bounds.width) * 2 - 1),
        applyDeadZone(-(((event.clientY - bounds.top) / bounds.height) * 2 - 1)),
      );
      pointerInsideRef.current = true;
      invalidate();
    };

    const handlePointerLeave = () => {
      pointerInsideRef.current = false;
      invalidate();
    };

    canvas.addEventListener("pointermove", handlePointerMove, { passive: true });
    canvas.addEventListener("pointerleave", handlePointerLeave, { passive: true });
    return () => {
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [gl, invalidate]);

  // No desktop a cabeça segue o cursor sobre a página inteira, não só sobre o
  // canvas: o mascote fica na lateral da CTA e precisa "acompanhar" quem lê o
  // texto ao lado — é o que dá a sensação de presença.
  useEffect(() => {
    if (!followPointer || mobileGyro) return;
    const canvas = gl.domElement;

    const handleWindowMove = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      if (bounds.width === 0) return;
      const cx = bounds.left + bounds.width / 2;
      const cy = bounds.top + bounds.height * 0.34; // altura aproximada da cabeça
      const reach = Math.max(window.innerWidth * 0.42, 420);
      pointerRef.current.set(
        applyDeadZone(THREE.MathUtils.clamp((event.clientX - cx) / reach, -1, 1)),
        applyDeadZone(THREE.MathUtils.clamp(-(event.clientY - cy) / (reach * 0.7), -1, 1)),
      );
      pointerInsideRef.current = true;
      invalidate();
    };

    window.addEventListener("pointermove", handleWindowMove, { passive: true });
    return () => window.removeEventListener("pointermove", handleWindowMove);
  }, [followPointer, gl, invalidate, mobileGyro]);

  // Mobile não tem ponteiro: a cabeça segue a inclinação do aparelho. No iOS
  // 13+ o acesso ao sensor exige um gesto do usuário.
  useEffect(() => {
    if (!mobileGyro || typeof window === "undefined") return;

    let lastGamma = 0;
    let lastBeta = 42;
    const onOrient = (event: DeviceOrientationEvent) => {
      const gamma = event.gamma ?? 0;
      const beta = event.beta ?? 42;
      if (Math.abs(gamma - lastGamma) < 0.4 && Math.abs(beta - lastBeta) < 0.4) return;
      lastGamma = gamma;
      lastBeta = beta;
      pointerRef.current.set(
        applyDeadZone(THREE.MathUtils.clamp(gamma / 28, -1, 1)),
        applyDeadZone(THREE.MathUtils.clamp((beta - 42) / 26, -1, 1)),
      );
      pointerInsideRef.current = true;
      invalidate();
    };

    let attached = false;
    const attach = () => {
      if (attached) return;
      attached = true;
      window.addEventListener("deviceorientation", onOrient);
    };

    const DOE = (
      typeof DeviceOrientationEvent !== "undefined" ? DeviceOrientationEvent : null
    ) as
      | (typeof DeviceOrientationEvent & {
          requestPermission?: () => Promise<"granted" | "denied">;
        })
      | null;

    let grant: (() => void) | null = null;
    if (DOE && typeof DOE.requestPermission === "function") {
      grant = () => {
        DOE.requestPermission?.()
          .then((state) => {
            if (state === "granted") attach();
          })
          .catch(() => {});
        if (grant) {
          window.removeEventListener("touchend", grant);
          window.removeEventListener("click", grant);
        }
      };
      window.addEventListener("touchend", grant, { once: true });
      window.addEventListener("click", grant, { once: true });
    } else {
      attach();
    }

    return () => {
      window.removeEventListener("deviceorientation", onOrient);
      if (grant) {
        window.removeEventListener("touchend", grant);
        window.removeEventListener("click", grant);
      }
    };
  }, [mobileGyro, invalidate]);

  useEffect(() => {
    return () => {
      document.body.style.cursor = "";
    };
  }, []);

  useFrame((_, rawDelta) => {
    if (!active) return;
    const delta = Math.min(rawDelta, 1 / 30); // aba que volta do background
    clockRef.current += delta;

    /* --- braços: mola. Subida levemente subamortecida (ζ≈0,62) para o gesto
       ter vida; descida criticamente amortecida e mais curta, porque saída
       sempre é mais discreta que entrada. --- */
    let blend = blendRef.current;
    if (reducedMotion) {
      blend = targetBlend;
      blendVelRef.current = 0;
    } else {
      const rising = targetBlend > blend;
      const stiffness = rising ? 400 : 256;
      const damping = rising ? 24.8 : 32;
      // subpassos: mantém a mola estável mesmo com quadro longo
      const steps = Math.max(1, Math.ceil(delta / (1 / 120)));
      const h = delta / steps;
      let velocity = blendVelRef.current;
      for (let i = 0; i < steps; i++) {
        velocity += (-stiffness * (blend - targetBlend) - damping * velocity) * h;
        blend += velocity * h;
      }
      blendVelRef.current = velocity;
    }
    blendRef.current = blend;

    applyBlendedPose(blend);

    /* --- respiração: o peito sobe e desce de leve. É o que separa "modelo
       parado" de "personagem esperando". --- */
    if (breathing && !reducedMotion) {
      const spine = rigRef.current.get("Spine01");
      const hips = rigRef.current.get("Hips");
      const wave = Math.sin(clockRef.current * 1.15);
      if (spine) {
        const base = THREE.MathUtils.lerp(
          POSE_RELAXED.Spine01.x ?? 0,
          POSE_CELEBRATE.Spine01.x ?? 0,
          blend,
        );
        applyWorldRotation(spine, base + wave * 0.9, 0, 0);
      }
      // o esqueleto está em centímetros (a raiz reescala para metros)
      if (hips) hips.bone.position.y = hips.bindY + wave * 0.5 + blend * 1.4;
    }

    /* --- cabeça: amortecimento exponencial, independente de framerate --- */
    const pointerActive =
      followPointer && !reducedMotion && pointerInsideRef.current;
    const gain = hoveredRef.current ? 1.12 : 1;

    const targetYaw = pointerActive
      ? pointerRef.current.x * HEAD_MAX_YAW * pointerStrength * gain
      : 0;
    const targetPitch =
      (pointerActive
        ? pointerRef.current.y * HEAD_MAX_PITCH * pointerStrength * gain
        : 0) + blend * CELEBRATE_HEAD_PITCH;

    const alpha = 1 - Math.exp(-8.5 * delta);
    headYawRef.current += (targetYaw - headYawRef.current) * alpha;
    headPitchRef.current += (targetPitch - headPitchRef.current) * alpha;

    const yaw = headYawRef.current;
    const pitch = headPitchRef.current;
    const roll = (-yaw / HEAD_MAX_YAW) * HEAD_MAX_ROLL;

    const neck = neckRef.current;
    const head = headRef.current;
    if (neck) applyWorldRotation(neck, pitch * NECK_SHARE, yaw * NECK_SHARE, 0);
    if (head) {
      applyWorldRotation(
        head,
        pitch * (1 - NECK_SHARE),
        yaw * (1 - NECK_SHARE),
        roll,
      );
    }

    const settled =
      Math.abs(blend - targetBlend) < 0.001 &&
      Math.abs(blendVelRef.current) < 0.001 &&
      Math.abs(targetYaw - yaw) < 0.02 &&
      Math.abs(targetPitch - pitch) < 0.02;

    // com respiração o laço segue vivo enquanto o mascote está à vista; sem
    // ela, o frameloop "demand" volta a dormir assim que tudo assenta.
    if (!settled || (breathing && !reducedMotion)) invalidate();
  });

  return (
    // O personagem tem 1,59 unidade e fica deslocado para baixo no quadro: a
    // cabeça precisa passar por baixo do título da CTA, e os punhos erguidos
    // não podem estourar o topo do canvas.
    <group position={[0, -1.34, 0]}>
      <primitive object={model} dispose={null} />

      {/* alvo de ponteiro: uma caixa simples no lugar de 58k triângulos */}
      <mesh
        position={[0, 0.8, 0]}
        onPointerOver={(event) => {
          event.stopPropagation();
          hoveredRef.current = true;
          document.body.style.cursor = onMascotClick ? "pointer" : "";
          invalidate();
        }}
        onPointerOut={(event) => {
          event.stopPropagation();
          hoveredRef.current = false;
          document.body.style.cursor = "";
          invalidate();
        }}
        onClick={(event) => {
          event.stopPropagation();
          onMascotClick?.();
        }}
      >
        <boxGeometry args={[0.72, 1.66, 0.6]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>
    </group>
  );
}

export function InteractiveMascot({
  className,
  pose = "relaxed",
  animationTrigger = 0,
  desktopModelUrl = "/models/com-automation-astronaut.glb",
  mobileModelUrl = "/models/com-automation-astronaut-mobile.glb",
  quality = "auto",
  followPointer = true,
  gyro = true,
  pointerStrength = 1,
  breathing = true,
  shadows = true,
  onMascotClick,
  onLoaded,
  ariaLabel = "Mascote astronauta interativo da Com Automação",
}: InteractiveMascotProps) {
  const mobileDevice = useMediaQuery("(max-width: 768px), (pointer: coarse)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const pageVisible = usePageVisible();
  const { ref, hasEntered, intersecting } = useViewportActivity<HTMLDivElement>();
  const [loaded, setLoaded] = useState(false);

  const useMobileModel =
    quality === "mobile" || (quality === "auto" && mobileDevice);
  const modelUrl = useMobileModel ? mobileModelUrl : desktopModelUrl;
  const active = intersecting && pageVisible;
  const mobileGyro = mobileDevice && gyro && !reducedMotion;

  const handleLoaded = useCallback(() => {
    requestAnimationFrame(() => setLoaded(true));
    onLoaded?.();
  }, [onLoaded]);

  return (
    <div
      ref={ref}
      className={className}
      role="img"
      aria-label={ariaLabel}
      style={{ position: "relative", minHeight: 300 }}
    >
      {hasEntered && (
        <Canvas
          frameloop="demand"
          dpr={useMobileModel ? 1 : 1.25}
          camera={{ position: [0, 0, 5.2], fov: 30, near: 0.1, far: 20 }}
          gl={{
            alpha: true,
            antialias: !useMobileModel,
            powerPreference: "high-performance",
            stencil: false,
          }}
          style={{
            position: "absolute",
            inset: 0,
            opacity: loaded ? 1 : 0,
            transition: "opacity 420ms var(--ease-out, ease-out)",
          }}
          onCreated={({ gl }) => {
            gl.outputColorSpace = THREE.SRGBColorSpace;
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.05;
            gl.setClearColor(0x000000, 0);
          }}
        >
          <AdaptiveQuality mobile={useMobileModel} />
          <StudioEnvironment intensity={1} />

          <ambientLight intensity={0.4} />
          <directionalLight position={[-3.4, 5, 4.4]} intensity={2.3} />
          <directionalLight position={[3.2, 2.2, 3]} intensity={0.7} />
          <directionalLight position={[0, 3, -4.2]} intensity={1.1} />

          <Suspense fallback={null}>
            <MascotScene
              key={modelUrl}
              modelUrl={modelUrl}
              pose={pose}
              animationTrigger={animationTrigger}
              followPointer={followPointer && (!mobileDevice || mobileGyro)}
              mobileGyro={mobileGyro}
              pointerStrength={pointerStrength}
              breathing={breathing}
              reducedMotion={reducedMotion}
              active={active}
              onMascotClick={onMascotClick}
              onLoaded={handleLoaded}
            />

            {shadows && (
              <ContactShadows
                position={[0, -1.34, 0]}
                opacity={0.3}
                scale={2.4}
                blur={2.8}
                far={1.2}
                resolution={useMobileModel ? 256 : 512}
                frames={1}
              />
            )}
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}

export function preloadInteractiveMascot(
  url = "/models/com-automation-astronaut.glb",
) {
  useGLTF.preload(url, false, true);
}
