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
  /** arrastar sobre o mascote gira o corpo; volta à frente sozinho após 2s */
  dragToSpin?: boolean;
  pointerStrength?: number;
  breathing?: boolean;
  shadows?: boolean;
  /** cor da luz de contorno; use o acento do produto para amarrar à seção */
  accent?: string;
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
 *
 * `t` é a exceção e é aplicado no espaço LOCAL: é a torção em torno do
 * próprio osso. Sem ela a T-pose (que tem as palmas viradas para BAIXO)
 * termina com as palmas para fora quando o braço sobe.
 * ------------------------------------------------------------------ */
type WorldAngles = { x?: number; y?: number; z?: number; t?: number };
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

/*
 * Braços RETOS, erguidos a partir do ombro — a silhueta em "V" de quem comemora
 * de braços abertos.
 *
 * ATENÇÃO, é aqui que é fácil errar: as rotações ACUMULAM ao longo da cadeia.
 * O antebraço é filho do úmero, que é filho do ombro, então ele já herda as
 * rotações dos dois. O ângulo real de cada segmento é a SOMA:
 *
 *   úmero    = ombro + braço          = 10 + 38 = 48° acima da horizontal
 *   antebraço = ombro + braço + antebraço
 *
 * Logo, braço reto NÃO é repetir o ângulo do úmero no antebraço (isso dobra o
 * cotovelo pelo dobro do ângulo) — é deixar a rotação própria do antebraço em
 * ZERO. Para mudar a altura do gesto, mexa só em CELEBRATE_ARM_Z.
 *
 * `t` é a exceção e pode ficar: é torção no eixo do próprio osso, que só gira a
 * mão para a palma ficar de frente, sem tirar o braço da linha.
 */
const CELEBRATE_SHOULDER_Z = 10;
const CELEBRATE_ARM_Z = 38;
const CELEBRATE_ARM_X = 10;

const POSE_CELEBRATE: PoseMap = {
  LeftShoulder: { z: CELEBRATE_SHOULDER_Z },
  RightShoulder: { z: -CELEBRATE_SHOULDER_Z },
  LeftArm: { z: CELEBRATE_ARM_Z, x: CELEBRATE_ARM_X },
  RightArm: { z: -CELEBRATE_ARM_Z, x: CELEBRATE_ARM_X },
  // rotação própria zero = alinhado ao úmero = braço reto
  LeftForeArm: { t: -90 },
  RightForeArm: { t: 90 },
  Spine01: { x: -5 },
  Hips: {},
};

const POSE_BONES = Object.keys(POSE_RELAXED);

const HEAD_MAX_YAW = 40;
const HEAD_MAX_ROLL = 6;
/*
 * Vertical é ASSIMÉTRICO de propósito. Olhar para cima é o gesto expressivo —
 * abre o peito, o queixo sobe, a silhueta muda. Olhar para baixo esbarra no
 * peito e não tem para onde ir, então passa de 20° só piora. Um valor único
 * para os dois lados deixava a subida discreta demais.
 */
const HEAD_PITCH_UP = 34;
const HEAD_PITCH_DOWN = 18;
/** o pescoço puxa uma fração do giro; o resto vai para a cabeça */
const NECK_SHARE = 0.35;
/** o tronco acompanha de leve — é o que faz o movimento ser lido de longe */
const BODY_MAX_YAW = 7;
const BODY_MAX_PITCH = 6;
const POINTER_DEAD_ZONE = 0.04;
/** comemorando, o astronauta também olha para cima */
const CELEBRATE_HEAD_PITCH = 14;

/* ---- girar arrastando (só onde existe ponteiro) ---- */
/** graus de giro por pixel arrastado: ~340° ao atravessar a caixa do mascote */
const SPIN_PER_PX = 0.9;
/** segundos parado antes de voltar sozinho para a frente */
const SPIN_IDLE_BEFORE_RETURN = 2;
/** acima disto o gesto é arrasto, não clique */
const DRAG_THRESHOLD_PX = 4;

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

/** níveis de luz em repouso e comemorando (escopo de módulo: são constantes) */
const LIGHT_BASE = { key: 3.4, rimAccent: 3.4, rimCool: 2.1, exposure: 1.12 };
const LIGHT_LIT = { key: 4.1, rimAccent: 7.2, rimCool: 3.6, exposure: 1.22 };

/**
 * O "palco" acende quando o mascote comemora: as luzes de contorno sobem, a
 * chave dá uma clareada e a exposição acompanha. É o mesmo gesto lido pela
 * iluminação — sem isso a comemoração acontece no escuro, com a mesma luz de
 * quando ele está parado.
 *
 * A rampa é própria (não a mola da pose) porque luz que dá overshoot pisca.
 */
function CelebrationLighting({
  celebrating,
  accent,
  reducedMotion,
}: {
  celebrating: boolean;
  accent: string;
  reducedMotion: boolean;
}) {
  const { gl, invalidate } = useThree();
  const keyRef = useRef<THREE.DirectionalLight>(null);
  const rimAccentRef = useRef<THREE.DirectionalLight>(null);
  const rimCoolRef = useRef<THREE.DirectionalLight>(null);
  const levelRef = useRef(celebrating ? 1 : 0);

  useEffect(() => {
    invalidate();
  }, [celebrating, invalidate]);

  // As luzes e o renderer são objetos do three: mutá-los é a API da biblioteca,
  // não estado de React. A regra de imutabilidade não se aplica ao laço abaixo.
  /* eslint-disable react-hooks/immutability */
  useFrame((_, rawDelta) => {
    const target = celebrating ? 1 : 0;
    const level = levelRef.current;
    if (Math.abs(target - level) < 0.001) {
      if (level !== target) levelRef.current = target;
      return;
    }

    const delta = Math.min(rawDelta, 1 / 30);
    // acende mais rápido do que apaga: o gesto entra, a luz baixa devagar
    const speed = target > level ? 9 : 5.5;
    levelRef.current = reducedMotion
      ? target
      : level + (target - level) * (1 - Math.exp(-speed * delta));

    const t = levelRef.current;
    const mix = (a: number, b: number) => a + (b - a) * t;

    if (keyRef.current) keyRef.current.intensity = mix(LIGHT_BASE.key, LIGHT_LIT.key);
    if (rimAccentRef.current)
      rimAccentRef.current.intensity = mix(LIGHT_BASE.rimAccent, LIGHT_LIT.rimAccent);
    if (rimCoolRef.current)
      rimCoolRef.current.intensity = mix(LIGHT_BASE.rimCool, LIGHT_LIT.rimCool);
    gl.toneMappingExposure = mix(LIGHT_BASE.exposure, LIGHT_LIT.exposure);

    invalidate();
  });
  /* eslint-enable react-hooks/immutability */

  return (
    <>
      {/* chave — morna, alta, à esquerda de quem olha */}
      <directionalLight
        ref={keyRef}
        position={[-3.6, 4.4, 3.8]}
        intensity={LIGHT_BASE.key}
        color="#fff4e8"
      />
      {/* preenchimento — frio e discreto, abre a sombra do lado direito */}
      <directionalLight position={[3.8, 1.4, 2.6]} intensity={0.75} color="#cfe0ff" />
      {/* contorno na cor do produto — amarra o mascote ao halo da seção */}
      <directionalLight
        ref={rimAccentRef}
        position={[-2.8, 2.6, -3.6]}
        intensity={LIGHT_BASE.rimAccent}
        color={accent}
      />
      {/* contorno frio do outro lado — dá o "brilho de estúdio" na borda */}
      <directionalLight
        ref={rimCoolRef}
        position={[3.2, 2, -3.2]}
        intensity={LIGHT_BASE.rimCool}
        color="#bcd6ff"
      />
      {/* rebote de baixo, quase imperceptível: tira o preto morto dos pés */}
      <directionalLight position={[0, -2.6, 1.8]} intensity={0.28} color="#4a5b7a" />
    </>
  );
}

function AdaptiveQuality({ mobile }: { mobile: boolean }) {
  const { setDpr } = useThree();
  // No celular a tela é 2x–3x: renderizar a 1x deixava o mascote visivelmente
  // serrilhado. O piso de queda também sobe — 1x num aparelho denso não é
  // "modo econômico", é borrão.
  const high = mobile ? 2 : 1.5;
  const low = mobile ? 1.5 : 1;

  return (
    <PerformanceMonitor
      flipflops={3}
      onIncline={() => setDpr(high)}
      onDecline={() => setDpr(low)}
      onFallback={() => setDpr(low)}
    />
  );
}

interface MascotSceneProps {
  modelUrl: string;
  pose: MascotPose;
  animationTrigger: number;
  followPointer: boolean;
  /** arrastar para girar — só onde existe ponteiro */
  spinnable: boolean;
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
  spinnable,
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

  // girar arrastando
  const spinGroupRef = useRef<THREE.Group>(null);
  const spinRef = useRef(0);
  const idleAfterDragRef = useRef(0);
  const dragRef = useRef({ active: false, lastX: 0, moved: 0, pointerId: -1 });

  const targetBlend = pose === "celebrate" ? 1 : 0;

  // escratches reutilizados: alocar dentro do useFrame vira pico de GC
  const scratch = useMemo(
    () => ({
      q: new THREE.Quaternion(),
      qTwist: new THREE.Quaternion(),
      qOut: new THREE.Quaternion(),
      e: new THREE.Euler(0, 0, 0, "ZXY"),
      // +Y local = direção do osso; girar em torno dele é torcer o braço
      boneAxis: new THREE.Vector3(0, 1, 0),
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
   * Aplica uma rotação expressa em EIXOS DE MUNDO a um bone, mais uma torção
   * opcional em torno do próprio osso.
   *
   *   orientação de mundo desejada: R · (P · bind)
   *   → local = P⁻¹ · R · P · bind · T
   *
   * A torção entra PÓS-multiplicada porque assim ela age no referencial do
   * próprio osso (depois do bind), e não no do pai.
   */
  const applyWorldRotation = useCallback(
    (rig: BoneRig, x: number, y: number, z: number, twist = 0) => {
      const { q, qTwist, qOut, e, boneAxis } = scratch;
      e.set(DEG(x), DEG(y), DEG(z), "ZXY");
      q.setFromEuler(e);
      qOut
        .copy(rig.parentWorldInv)
        .multiply(q)
        .multiply(rig.parentWorld)
        .multiply(rig.bind);
      if (twist !== 0) {
        qTwist.setFromAxisAngle(boneAxis, DEG(twist));
        qOut.multiply(qTwist);
      }
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
          THREE.MathUtils.lerp(a.t ?? 0, b.t ?? 0, blend),
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

        if ("envMapIntensity" in pbr) pbr.envMapIntensity = 1.05;
        pbr.side = THREE.FrontSide;

        /*
         * Rede de segurança para um GLB que não tenha passado pelo
         * scripts/build-mascot.mjs. O que sai do Meshy cru vem com
         * `emissiveFactor: [1,1,1]` usando a própria textura como mapa
         * emissivo (o modelo se auto-ilumina e nenhuma luz tem efeito) e sem
         * metallic/roughness — que no glTF NÃO é zero: o default é 1.0 nos
         * dois, ou seja, metal totalmente fosco, sem albedo difuso.
         *
         * Com o modelo processado nada disto roda: o mapa de acabamento já
         * existe, e mexer nos escalares aqui ATRAPALHARIA — em three.js eles
         * multiplicam o mapa, então `roughness = 0.52` deixaria tudo brilhante
         * demais em vez de respeitar visor, traje e anéis.
         */
        if (!pbr.roughnessMap) {
          pbr.metalness = 0;
          pbr.roughness = 0.55;
          pbr.emissiveIntensity = 0.05;
        }

        for (const texture of [pbr.map, pbr.emissiveMap, pbr.roughnessMap, pbr.normalMap]) {
          if (!texture) continue;
          texture.anisotropy = maxAnisotropy;
          texture.needsUpdate = true;
        }

        pbr.needsUpdate = true;
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
    if (!followPointer) return;
    const canvas = gl.domElement;

    const handleWindowMove = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      if (bounds.width === 0) return;
      const cx = bounds.left + bounds.width / 2;
      const cy = bounds.top + bounds.height * 0.4; // altura aproximada da cabeça
      /*
       * Alcances separados por eixo, cada um na medida da tela que existe
       * naquela direção. O vertical saía da LARGURA da janela e ficava grande
       * demais: acima da cabeça do mascote sobram ~300px de página, então o
       * cursor nunca chegava perto do limite e a subida do olhar parecia
       * tímida. Amarrado à altura, o gesto usa a faixa inteira.
       */
      const reachX = Math.max(window.innerWidth * 0.42, 420);
      const reachY = Math.max(window.innerHeight * 0.32, 220);
      pointerRef.current.set(
        applyDeadZone(THREE.MathUtils.clamp((event.clientX - cx) / reachX, -1, 1)),
        applyDeadZone(THREE.MathUtils.clamp(-(event.clientY - cy) / reachY, -1, 1)),
      );
      pointerInsideRef.current = true;
      invalidate();
    };

    window.addEventListener("pointermove", handleWindowMove, { passive: true });
    return () => window.removeEventListener("pointermove", handleWindowMove);
  }, [followPointer, gl, invalidate]);

  /* Arrastar sobre o mascote gira o corpo no próprio eixo, sem limite (dá a
     volta inteira). Os listeners ficam na janela, não no canvas: quem arrasta
     costuma sair da caixa do mascote no meio do gesto, e sem isso o giro
     travaria ali. */
  useEffect(() => {
    if (!spinnable) return;

    const onMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag.active) return;
      const dx = event.clientX - drag.lastX;
      drag.lastX = event.clientX;
      drag.moved += Math.abs(dx);
      spinRef.current += DEG(dx * SPIN_PER_PX);
      idleAfterDragRef.current = 0;
      invalidate();
    };

    const onUp = () => {
      const drag = dragRef.current;
      if (!drag.active) return;
      drag.active = false;
      idleAfterDragRef.current = 0;
      document.body.style.cursor = hoveredRef.current ? "grab" : "";
      invalidate();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [invalidate, spinnable]);

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
    /* --- giro por arrasto + volta ao centro ---
       O alvo do retorno é a volta INTEIRA mais próxima, não zero: se a pessoa
       deu três voltas, ele não desenrola as três — só completa a que está. --- */
    const drag = dragRef.current;
    if (spinnable) {
      if (!drag.active && spinRef.current !== 0) {
        idleAfterDragRef.current += delta;
        if (idleAfterDragRef.current >= SPIN_IDLE_BEFORE_RETURN) {
          const target = Math.round(spinRef.current / (Math.PI * 2)) * Math.PI * 2;
          if (reducedMotion) {
            spinRef.current = 0;
          } else {
            const k = 1 - Math.exp(-5.5 * delta);
            spinRef.current += (target - spinRef.current) * k;
            // chegou: zera de vez. Um múltiplo de 2π é visualmente idêntico a
            // zero, então o "snap" não aparece e o estado não fica acumulando.
            if (Math.abs(target - spinRef.current) < 0.0015) spinRef.current = 0;
          }
        }
      }
      if (spinGroupRef.current) spinGroupRef.current.rotation.y = spinRef.current;
    }


    /* --- cabeça: amortecimento exponencial, independente de framerate --- */
    const pointerActive =
      followPointer && !reducedMotion && pointerInsideRef.current;
    // de costas, a cabeça não deve tentar procurar o cursor: o ganho cai com o
    // cosseno do giro e volta sozinho quando o corpo encara a frente de novo
    const facing = Math.max(0, Math.cos(spinRef.current));
    // Comemorando, o mascote encara a frente: o rastreamento some na mesma
    // curva em que os braços sobem, então a cabeça centraliza junto com o
    // gesto em vez de dar um solavanco.
    const tracking = 1 - blend;
    const gain = (hoveredRef.current ? 1.12 : 1) * facing * tracking;

    const targetYaw = pointerActive
      ? pointerRef.current.x * HEAD_MAX_YAW * pointerStrength * gain
      : 0;
    const py = pointerRef.current.y;
    const targetPitch =
      (pointerActive
        ? py * (py > 0 ? HEAD_PITCH_UP : HEAD_PITCH_DOWN) * pointerStrength * gain
        : 0) + blend * CELEBRATE_HEAD_PITCH;

    const alpha = 1 - Math.exp(-8.5 * delta);
    headYawRef.current += (targetYaw - headYawRef.current) * alpha;
    headPitchRef.current += (targetPitch - headPitchRef.current) * alpha;

    const yaw = headYawRef.current;
    // Girar positivo em torno do X de MUNDO inclina o rosto para BAIXO (regra
    // da mão direita). Como `pitch` guarda a intenção ("cursor acima = olhar
    // para cima"), o sinal é invertido aqui, na hora de virar rotação.
    const pitch = -headPitchRef.current;
    const roll = (-yaw / HEAD_MAX_YAW) * HEAD_MAX_ROLL;
    // fração normalizada do giro, para o tronco acompanhar na mesma proporção
    const yawRatio = yaw / HEAD_MAX_YAW;
    // normalizado pelo maior dos dois lados, para o tronco não estourar quando
    // o olhar sobe (que é a faixa maior)
    const pitchRatio = pitch / HEAD_PITCH_UP;

    /* --- tronco: respiração + um giro sutil atrás da cabeça. Só a cabeça
       virando quase não se percebe de longe; o ombro acompanhando é o que
       vende o movimento. --- */
    const spine = rigRef.current.get("Spine01");
    const hips = rigRef.current.get("Hips");
    const wave = breathing && !reducedMotion ? Math.sin(clockRef.current * 1.15) : 0;

    if (spine) {
      const base = THREE.MathUtils.lerp(
        POSE_RELAXED.Spine01.x ?? 0,
        POSE_CELEBRATE.Spine01.x ?? 0,
        blend,
      );
      applyWorldRotation(
        spine,
        base + wave * 0.9 + pitchRatio * BODY_MAX_PITCH,
        yawRatio * BODY_MAX_YAW,
        0,
      );
    }
    // o esqueleto está em centímetros (a raiz reescala para metros)
    if (hips) hips.bone.position.y = hips.bindY + wave * 0.5 + blend * 1.4;

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

    // comparado contra o ref (intenção), não contra `pitch`, que já está com o
    // sinal invertido para virar rotação de mundo
    // enquanto o giro não voltou ao zero o laço precisa seguir vivo, inclusive
    // durante os 2s de espera — é ele que conta o tempo
    const spinSettled = !spinnable || (!drag.active && spinRef.current === 0);

    const settled =
      spinSettled &&
      Math.abs(blend - targetBlend) < 0.001 &&
      Math.abs(blendVelRef.current) < 0.001 &&
      Math.abs(targetYaw - yaw) < 0.02 &&
      Math.abs(targetPitch - headPitchRef.current) < 0.02;

    // com respiração o laço segue vivo enquanto o mascote está à vista; sem
    // ela, o frameloop "demand" volta a dormir assim que tudo assenta.
    if (!settled || (breathing && !reducedMotion)) invalidate();
  });

  return (
    // O personagem tem 1,59 unidade e fica deslocado para baixo no quadro: a
    // cabeça precisa passar por baixo do título da CTA, e os punhos erguidos
    // não podem estourar o topo do canvas.
    <group position={[0, -1.34, 0]}>
      {/* o giro por arrasto vive aqui, envolvendo modelo e alvo de ponteiro,
          para que a área clicável acompanhe o corpo */}
      <group ref={spinGroupRef}>
        <primitive object={model} dispose={null} />

        {/* alvo de ponteiro: uma caixa simples no lugar de 58k triângulos */}
        <mesh
          position={[0, 0.8, 0]}
          onPointerOver={(event) => {
            event.stopPropagation();
            hoveredRef.current = true;
            // cursor só faz sentido onde existe ponteiro
            if (event.pointerType === "mouse") {
              document.body.style.cursor = spinnable
                ? "grab"
                : onMascotClick
                  ? "pointer"
                  : "";
            }
            invalidate();
          }}
          onPointerOut={(event) => {
            event.stopPropagation();
            hoveredRef.current = false;
            if (!dragRef.current.active) document.body.style.cursor = "";
            invalidate();
          }}
          onPointerDown={(event) => {
            if (!spinnable) return;
            event.stopPropagation();
            dragRef.current = {
              active: true,
              lastX: event.clientX,
              moved: 0,
              pointerId: event.pointerId,
            };
            idleAfterDragRef.current = 0;
            if (event.pointerType === "mouse") {
              document.body.style.cursor = "grabbing";
            }
            invalidate();
          }}
          onClick={(event) => {
            event.stopPropagation();
            // um arrasto não é um clique: sem isto, girar o mascote também
            // disparava a comemoração ao soltar
            if (dragRef.current.moved > DRAG_THRESHOLD_PX) return;
            onMascotClick?.();
          }}
        >
          <boxGeometry args={[0.72, 1.66, 0.6]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
        </mesh>
      </group>
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
  dragToSpin = true,
  pointerStrength = 1,
  breathing = true,
  shadows = true,
  accent = "#7fb2ff",
  onMascotClick,
  onLoaded,
  ariaLabel = "Mascote astronauta interativo da Com Automação",
}: InteractiveMascotProps) {
  // Duas perguntas diferentes, dois media queries diferentes:
  // "é tela pequena?" decide QUAL MODELO baixar (banda/GPU);
  // "não tem hover?" decide COMO se interage (giroscópio no lugar do ponteiro).
  // Misturar as duas fazia uma janela de desktop estreita perder o
  // rastreamento da cabeça sem ganhar giroscópio em troca.
  const smallScreen = useMediaQuery("(max-width: 768px), (pointer: coarse)");
  const hoverless = useMediaQuery("(hover: none), (pointer: coarse)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const pageVisible = usePageVisible();
  const { ref, hasEntered, intersecting } = useViewportActivity<HTMLDivElement>();
  const [loaded, setLoaded] = useState(false);

  const useMobileModel =
    quality === "mobile" || (quality === "auto" && smallScreen);
  const modelUrl = useMobileModel ? mobileModelUrl : desktopModelUrl;
  const active = intersecting && pageVisible;

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
      /* o palco em CSS (.mascot3d::before) acende junto, via :has() */
      data-cheering={pose === "celebrate" ? "" : undefined}
      style={{ position: "relative", minHeight: 300 }}
    >
      {hasEntered && (
        <Canvas
          frameloop="demand"
          /* faixa, não valor fixo: o R3F usa o devicePixelRatio do aparelho
             limitado a ela. O teto 2 no celular é o que tira o serrilhado. */
          dpr={useMobileModel ? [1.5, 2] : [1, 1.5]}
          camera={{ position: [0, 0, 5.2], fov: 30, near: 0.1, far: 20 }}
          gl={{
            alpha: true,
            // 17k triângulos: dá para manter antialias em todo lugar
            antialias: true,
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
            gl.toneMappingExposure = 1.12;
            gl.setClearColor(0x000000, 0);
          }}
        >
          <AdaptiveQuality mobile={useMobileModel} />
          {/* ambiente só como base macia: o desenho vem das luzes abaixo */}
          <StudioEnvironment intensity={0.62} />

          {/*
            Esquema de 4 pontos, montado para um traje BRANCO sobre fundo PRETO.
            O problema aqui não é iluminar — é separar o personagem do fundo sem
            estourar o branco. Daí a chave morna e generosa na frente-esquerda,
            um preenchimento frio bem baixo (mantém a sombra viva em vez de
            cinza chapado) e DUAS luzes de contorno por trás, que desenham a
            silhueta. A ambiente fica quase zerada de propósito: subi-la achata
            tudo de novo.
          */}
          <ambientLight intensity={0.2} />

          <CelebrationLighting
            celebrating={pose === "celebrate"}
            accent={accent}
            reducedMotion={reducedMotion}
          />

          <Suspense fallback={null}>
            <MascotScene
              key={modelUrl}
              modelUrl={modelUrl}
              pose={pose}
              animationTrigger={animationTrigger}
              followPointer={followPointer && !hoverless}
              spinnable={dragToSpin}
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
                opacity={0.55}
                scale={2.2}
                blur={2.4}
                far={1.1}
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
