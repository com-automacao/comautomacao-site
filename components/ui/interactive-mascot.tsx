"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  PerformanceMonitor,
  Preload,
  useAnimations,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export type MascotPose = "relaxed" | "celebrate";
export type MascotQuality = "auto" | "desktop" | "mobile";

export interface InteractiveMascotProps {
  className?: string;
  pose?: MascotPose;
  animationTrigger?: number;
  desktopModelUrl?: string;
  mobileModelUrl?: string;
  posterUrl?: string;
  quality?: MascotQuality;
  followPointer?: boolean;
  gyro?: boolean;
  pointerStrength?: number;
  bodyParallax?: boolean;
  microIdle?: boolean;
  shadows?: boolean;
  scale?: number;
  position?: [number, number, number];
  onMascotClick?: () => void;
  onLoaded?: () => void;
  onAnimationFinished?: (pose: MascotPose) => void;
  ariaLabel?: string;
}

interface MascotSceneProps {
  modelUrl: string;
  pose: MascotPose;
  animationTrigger: number;
  followPointer: boolean;
  mobileGyro: boolean;
  pointerStrength: number;
  bodyParallax: boolean;
  microIdle: boolean;
  reducedMotion: boolean;
  active: boolean;
  scale: number;
  position: [number, number, number];
  onMascotClick?: () => void;
  onLoaded?: () => void;
  onAnimationFinished?: (pose: MascotPose) => void;
}

const DEG = THREE.MathUtils.degToRad;
const HEAD_MAX_YAW = DEG(16);
const HEAD_MAX_PITCH = DEG(7);
const HEAD_MAX_ROLL = DEG(1.2);
const BODY_MAX_YAW = DEG(2.4);
const BODY_MAX_PITCH = DEG(0.8);
const POINTER_DEAD_ZONE = 0.035;
const SETTLE_EPSILON = 0.00012;

const FINAL_POSES = {
  relaxed: {
    ShoulderPivot_Wave: [0, -4, 78] as const,
    ElbowPivot_Wave: [0, 0, 8] as const,
    WaveWristPivot: [0, 0, -4] as const,
    ShoulderPivot_Hip: [0, 4, -78] as const,
    ElbowPivot_Hip: [0, 0, -8] as const,
    WristPivot_Hip: [0, 0, 4] as const,
  },
  celebrate: {
    ShoulderPivot_Wave: [0, 4, -50] as const,
    ElbowPivot_Wave: [0, 0, -48] as const,
    WaveWristPivot: [0, 0, 8] as const,
    ShoulderPivot_Hip: [0, -4, 50] as const,
    ElbowPivot_Hip: [0, 0, 48] as const,
    WristPivot_Hip: [0, 0, -8] as const,
  },
} satisfies Record<MascotPose, Record<string, readonly [number, number, number]>>;

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
  const [hasEntered, setHasEntered] = useState(false);
  const [intersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (typeof IntersectionObserver === "undefined") {
      setHasEntered(true);
      setIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIntersecting(entry.isIntersecting);
        if (entry.isIntersecting) setHasEntered(true);
      },
      { rootMargin: "240px" },
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

function StudioEnvironment({ intensity = 1.05 }: { intensity?: number }) {
  const { gl, scene } = useThree();

  useEffect(() => {
    const previousEnvironment = scene.environment;
    const previousIntensity = (scene as THREE.Scene & { environmentIntensity?: number })
      .environmentIntensity;

    const pmrem = new THREE.PMREMGenerator(gl);
    pmrem.compileCubemapShader();
    const room = new RoomEnvironment();
    const renderTarget = pmrem.fromScene(room, 0.035);

    scene.environment = renderTarget.texture;
    if ("environmentIntensity" in scene) {
      (scene as THREE.Scene & { environmentIntensity: number }).environmentIntensity =
        intensity;
    }

    return () => {
      scene.environment = previousEnvironment;
      if (previousIntensity !== undefined && "environmentIntensity" in scene) {
        (scene as THREE.Scene & { environmentIntensity: number }).environmentIntensity =
          previousIntensity;
      }
      renderTarget.dispose();
      room.dispose();
      pmrem.dispose();
    };
  }, [gl, intensity, scene]);

  return null;
}

function AdaptiveQuality({ mobile }: { mobile: boolean }) {
  const { setDpr } = useThree();
  const highDpr = mobile ? 1.1 : 1.45;

  return (
    <PerformanceMonitor
      flipflops={3}
      onIncline={() => setDpr(highDpr)}
      onDecline={() => setDpr(1)}
      onFallback={() => setDpr(1)}
    />
  );
}

function MascotScene({
  modelUrl,
  pose,
  animationTrigger,
  followPointer,
  mobileGyro,
  pointerStrength,
  bodyParallax,
  microIdle,
  reducedMotion,
  active,
  scale,
  position,
  onMascotClick,
  onLoaded,
  onAnimationFinished,
}: MascotSceneProps) {
  const gltf = useGLTF(modelUrl);
  const model = useMemo(() => clone(gltf.scene) as THREE.Group, [gltf.scene]);
  const { actions, mixer } = useAnimations(gltf.animations, model);
  const { gl, invalidate } = useThree();

  const head = useMemo(
    () => model.getObjectByName("HeadPivot") as THREE.Object3D | undefined,
    [model],
  );
  const body = useMemo(
    () => model.getObjectByName("BodyPivot") as THREE.Object3D | undefined,
    [model],
  );

  const initializedModelRef = useRef<THREE.Group | null>(null);
  const previousCommandRef = useRef("");
  const activePoseRef = useRef<MascotPose>(pose);
  const activeActionRef = useRef<THREE.AnimationAction | null>(null);
  const pointerRef = useRef(new THREE.Vector2());
  const pointerInsideRef = useRef(false);
  const hoveredRef = useRef(false);
  const idlePulseRef = useRef({ active: false, elapsed: 0, duration: 1.35 });
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const headBaseQuaternion = useMemo(
    () => head?.quaternion.clone() ?? new THREE.Quaternion(),
    [head],
  );
  const bodyBaseQuaternion = useMemo(
    () => body?.quaternion.clone() ?? new THREE.Quaternion(),
    [body],
  );
  const targetHeadQuaternion = useMemo(() => new THREE.Quaternion(), []);
  const targetBodyQuaternion = useMemo(() => new THREE.Quaternion(), []);
  const offsetQuaternion = useMemo(() => new THREE.Quaternion(), []);
  const offsetEuler = useMemo(() => new THREE.Euler(0, 0, 0, "YXZ"), []);

  const applyFinalPose = useCallback(
    (targetPose: MascotPose) => {
      const definition = FINAL_POSES[targetPose];

      for (const [nodeName, degrees] of Object.entries(definition)) {
        const node = model.getObjectByName(nodeName);
        if (!node) continue;
        node.rotation.set(DEG(degrees[0]), DEG(degrees[1]), DEG(degrees[2]), "XYZ");
      }
      invalidate();
    },
    [invalidate, model],
  );

  const playClip = useCallback(
    (targetPose: MascotPose) => {
      activePoseRef.current = targetPose;
      const clipName =
        targetPose === "celebrate" ? "ArmsUp_Celebrate" : "ArmsDown_Relax";
      const nextAction = actions[clipName];

      if (!nextAction) {
        applyFinalPose(targetPose);
        onAnimationFinished?.(targetPose);
        return;
      }

      const previousAction = activeActionRef.current;
      nextAction.reset();
      nextAction.enabled = true;
      nextAction.setEffectiveTimeScale(1);
      nextAction.setEffectiveWeight(1);
      nextAction.setLoop(THREE.LoopOnce, 1);
      nextAction.clampWhenFinished = true;
      nextAction.play();

      if (previousAction && previousAction !== nextAction) {
        nextAction.crossFadeFrom(previousAction, 0.22, true);
      } else {
        nextAction.fadeIn(0.16);
      }

      activeActionRef.current = nextAction;
      invalidate();
    },
    [actions, applyFinalPose, invalidate, onAnimationFinished],
  );

  useLayoutEffect(() => {
    if (initializedModelRef.current === model) return;
    initializedModelRef.current = model;

    const maxAnisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());

    model.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;

      object.frustumCulled = true;
      // O modelo visível não participa de raycasting. A interação usa uma caixa
      // simples, evitando testes de ponteiro contra centenas de milhares de triângulos.
      object.raycast = () => undefined;

      const materials = Array.isArray(object.material)
        ? object.material.map((material) => material.clone())
        : [object.material.clone()];

      for (const material of materials) {
        if ("envMapIntensity" in material) {
          (material as THREE.MeshStandardMaterial).envMapIntensity = 1.12;
        }

        const pbrMaterial = material as THREE.MeshStandardMaterial;
        for (const texture of [
          pbrMaterial.map,
          pbrMaterial.normalMap,
          pbrMaterial.roughnessMap,
          pbrMaterial.metalnessMap,
          pbrMaterial.aoMap,
        ]) {
          if (!texture) continue;
          texture.anisotropy = maxAnisotropy;
          texture.needsUpdate = true;
        }
      }

      object.material = Array.isArray(object.material) ? materials : materials[0];
    });

    applyFinalPose("relaxed");
    activePoseRef.current = pose;
    previousCommandRef.current = `${pose}:${animationTrigger}`;
    onLoaded?.();

    if (pose === "celebrate") {
      if (reducedMotion) applyFinalPose("celebrate");
      else playClip("celebrate");
    }
  }, [
    animationTrigger,
    applyFinalPose,
    gl,
    model,
    onLoaded,
    playClip,
    pose,
    reducedMotion,
  ]);

  useEffect(() => {
    const command = `${pose}:${animationTrigger}`;
    if (command === previousCommandRef.current) return;
    previousCommandRef.current = command;

    if (reducedMotion) {
      for (const action of Object.values(actions)) action?.stop();
      activeActionRef.current = null;
      applyFinalPose(pose);
      onAnimationFinished?.(pose);
      return;
    }

    playClip(pose);
  }, [
    actions,
    animationTrigger,
    applyFinalPose,
    onAnimationFinished,
    playClip,
    pose,
    reducedMotion,
  ]);

  useEffect(() => {
    const handleFinished = (event: { action: THREE.AnimationAction }) => {
      if (event.action !== activeActionRef.current) return;
      onAnimationFinished?.(activePoseRef.current);
      invalidate();
    };

    mixer.addEventListener("finished", handleFinished);
    return () => mixer.removeEventListener("finished", handleFinished);
  }, [invalidate, mixer, onAnimationFinished]);

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

  // Mobile sem ponteiro: o giroscópio conduz a cabeça pela inclinação do
  // aparelho. Só re-renderiza (invalidate) quando a inclinação muda o bastante,
  // preservando o frameloop "demand". No iOS 13+ pede permissão num gesto.
  useEffect(() => {
    if (!mobileGyro || typeof window === "undefined") return;

    let lastGamma = 0;
    let lastBeta = 42;
    const onOrient = (event: DeviceOrientationEvent) => {
      const gamma = event.gamma ?? 0; // esquerda/direita (-90..90)
      const beta = event.beta ?? 42; // frente/trás
      if (Math.abs(gamma - lastGamma) < 0.4 && Math.abs(beta - lastBeta) < 0.4)
        return;
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
    if (!microIdle || reducedMotion || !active) return;

    const schedule = () => {
      const delay = 4200 + Math.random() * 2800;
      idleTimerRef.current = setTimeout(() => {
        idlePulseRef.current.active = true;
        idlePulseRef.current.elapsed = 0;
        invalidate();
        schedule();
      }, delay);
    };

    schedule();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
      idlePulseRef.current.active = false;
    };
  }, [active, invalidate, microIdle, reducedMotion]);

  useEffect(() => {
    return () => {
      document.body.style.cursor = "";
      for (const action of Object.values(actions)) action?.stop();
    };
  }, [actions]);

  useFrame((_, delta) => {
    if (!active || !head) return;

    const pointerEnabled =
      followPointer && !reducedMotion && pointerInsideRef.current;
    const hoverMultiplier = hoveredRef.current ? 1 : 0.86;

    let idleYaw = 0;
    let idlePitch = 0;
    const idlePulse = idlePulseRef.current;

    if (idlePulse.active && !pointerEnabled) {
      idlePulse.elapsed += delta;
      const progress = Math.min(idlePulse.elapsed / idlePulse.duration, 1);
      const envelope = Math.sin(progress * Math.PI);
      idleYaw = Math.sin(progress * Math.PI * 2) * DEG(1.25) * envelope;
      idlePitch = -Math.sin(progress * Math.PI) * DEG(0.55);
      if (progress >= 1) idlePulse.active = false;
    }

    const targetYaw = pointerEnabled
      ? pointerRef.current.x * HEAD_MAX_YAW * pointerStrength * hoverMultiplier
      : idleYaw;
    const targetPitch = pointerEnabled
      ? pointerRef.current.y * HEAD_MAX_PITCH * pointerStrength * hoverMultiplier
      : idlePitch;
    const targetRoll = pointerEnabled
      ? -pointerRef.current.x * HEAD_MAX_ROLL * pointerStrength
      : 0;

    offsetEuler.set(targetPitch, targetYaw, targetRoll, "YXZ");
    offsetQuaternion.setFromEuler(offsetEuler);
    targetHeadQuaternion.copy(headBaseQuaternion).multiply(offsetQuaternion);

    const headAlpha = 1 - Math.exp(-8.2 * delta);
    head.quaternion.slerp(targetHeadQuaternion, headAlpha);

    let bodyMoving = false;
    if (body && bodyParallax) {
      const bodyYaw = pointerEnabled
        ? pointerRef.current.x * BODY_MAX_YAW * pointerStrength
        : idleYaw * 0.22;
      const bodyPitch = pointerEnabled
        ? pointerRef.current.y * BODY_MAX_PITCH * pointerStrength
        : 0;

      offsetEuler.set(bodyPitch, bodyYaw, 0, "YXZ");
      offsetQuaternion.setFromEuler(offsetEuler);
      targetBodyQuaternion.copy(bodyBaseQuaternion).multiply(offsetQuaternion);

      const bodyAlpha = 1 - Math.exp(-4.4 * delta);
      body.quaternion.slerp(targetBodyQuaternion, bodyAlpha);
      bodyMoving = 1 - Math.abs(body.quaternion.dot(targetBodyQuaternion)) > SETTLE_EPSILON;
    }

    const headMoving =
      1 - Math.abs(head.quaternion.dot(targetHeadQuaternion)) > SETTLE_EPSILON;
    const animationRunning = Object.values(actions).some(
      (action) => action?.isRunning() === true,
    );

    if (headMoving || bodyMoving || animationRunning || idlePulse.active) {
      invalidate();
    }
  });

  return (
    <group position={position} scale={scale}>
      <primitive object={model} dispose={null} />

      <mesh
        position={[0, 0.83, 0]}
        onPointerOver={(event) => {
          event.stopPropagation();
          hoveredRef.current = true;
          document.body.style.cursor = onMascotClick ? "pointer" : "default";
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
          invalidate();
        }}
      >
        <boxGeometry args={[1.34, 1.76, 0.72]} />
        <meshBasicMaterial
          transparent
          opacity={0}
          depthWrite={false}
          colorWrite={false}
        />
      </mesh>
    </group>
  );
}

export function InteractiveMascot({
  className,
  pose = "relaxed",
  animationTrigger = 0,
  desktopModelUrl = "/models/com-automation-robot-hq.glb",
  mobileModelUrl = "/models/com-automation-robot-hq-mobile.glb",
  posterUrl = "/images/com-automation-robot-poster.webp",
  quality = "auto",
  followPointer = true,
  gyro = true,
  pointerStrength = 1,
  bodyParallax = true,
  microIdle = true,
  shadows = true,
  scale = 1,
  position = [0, 0, 0],
  onMascotClick,
  onLoaded,
  onAnimationFinished,
  ariaLabel = "Mascote robô interativo da Com Automação",
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

  useEffect(() => {
    setLoaded(false);
    useGLTF.preload(modelUrl);
  }, [modelUrl]);

  return (
    <div
      ref={ref}
      className={className}
      role="img"
      aria-label={ariaLabel}
      style={{ position: "relative", minHeight: 320, overflow: "hidden" }}
    >
      {posterUrl && (
        <img
          src={posterUrl}
          alt=""
          aria-hidden="true"
          draggable={false}
          decoding="async"
          fetchPriority="high"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            opacity: loaded ? 0 : 1,
            transition: "opacity 320ms ease",
            pointerEvents: "none",
            userSelect: "none",
          }}
        />
      )}

      {hasEntered && (
        <Canvas
          frameloop="demand"
          dpr={useMobileModel ? 1 : 1.25}
          camera={{ position: [0, 0.84, 3.15], fov: 30, near: 0.1, far: 20 }}
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
            transition: "opacity 320ms ease",
          }}
          onCreated={({ gl: renderer }) => {
            renderer.outputColorSpace = THREE.SRGBColorSpace;
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.02;
            renderer.setClearColor(0x000000, 0);
          }}
        >
          <AdaptiveQuality mobile={useMobileModel} />
          <StudioEnvironment intensity={1.05} />

          <ambientLight intensity={0.42} />
          <directionalLight position={[-3.6, 5.2, 4.5]} intensity={2.45} />
          <directionalLight position={[3.3, 2.4, 3.2]} intensity={0.72} />
          <directionalLight position={[0.2, 3.4, -4]} intensity={1.0} />

          <Suspense fallback={null}>
            <MascotScene
              key={modelUrl}
              modelUrl={modelUrl}
              pose={pose}
              animationTrigger={animationTrigger}
              followPointer={followPointer && (!mobileDevice || mobileGyro)}
              mobileGyro={mobileGyro}
              pointerStrength={pointerStrength}
              bodyParallax={bodyParallax}
              microIdle={microIdle}
              reducedMotion={reducedMotion}
              active={active}
              scale={scale}
              position={position}
              onMascotClick={onMascotClick}
              onLoaded={() => {
                requestAnimationFrame(() => {
                  setLoaded(true);
                  onLoaded?.();
                });
              }}
              onAnimationFinished={onAnimationFinished}
            />

            {shadows && (
              <ContactShadows
                position={[0, position[1] + 0.008, 0]}
                opacity={0.26}
                scale={2.2 * scale}
                blur={3}
                far={1.15}
                resolution={useMobileModel ? 256 : 512}
                frames={1}
              />
            )}

            <Preload all />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}

export function preloadInteractiveMascot(
  desktopModelUrl = "/models/com-automation-robot-hq.glb",
  mobileModelUrl = "/models/com-automation-robot-hq-mobile.glb",
) {
  useGLTF.preload(desktopModelUrl);
  useGLTF.preload(mobileModelUrl);
}
