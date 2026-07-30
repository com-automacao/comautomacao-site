"use client";

import {
  ComponentPropsWithoutRef,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, useGLTF } from "@react-three/drei";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import * as THREE from "three";

type RobotQuality = "auto" | "high" | "low";

export interface InteractiveRobotProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onClick"> {
  modelUrl?: string;
  posterUrl?: string;
  quality?: RobotQuality;
  scale?: number;
  position?: [number, number, number];
  followPointer?: boolean;
  autoWave?: boolean;
  autoWaveInterval?: number;
  waveOnHover?: boolean;
  reactOnClick?: boolean;
  shadows?: boolean;
  accentColor?: string;
  statusColor?: string;
  ariaLabel?: string;
  onRobotClick?: () => void;
  onLoaded?: () => void;
}

interface RobotModelProps {
  modelUrl: string;
  scale: number;
  position: [number, number, number];
  followPointer: boolean;
  autoWave: boolean;
  autoWaveInterval: number;
  waveOnHover: boolean;
  reactOnClick: boolean;
  accentColor: string;
  statusColor: string;
  active: boolean;
  onRobotClick?: () => void;
  onLoaded?: () => void;
}

interface MotionSnapshot {
  bodyY: number;
  bodyRotationY: number;
  headRotationX: number;
  headRotationY: number;
  headRotationZ: number;
  wristRotationZ: number;
  statusIntensity: number;
}

const DEFAULT_MODEL = "/models/com-automation-robot.glb";
const DEFAULT_POSTER = "/images/com-automation-robot-poster.webp";

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}

function useInViewport<T extends HTMLElement>(rootMargin = "220px") {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, visible };
}

function RobotModel({
  modelUrl,
  scale,
  position,
  followPointer,
  autoWave,
  autoWaveInterval,
  waveOnHover,
  reactOnClick,
  accentColor,
  statusColor,
  active,
  onRobotClick,
  onLoaded,
}: RobotModelProps) {
  const gltf = useGLTF(modelUrl);
  const hoveredRef = useRef(false);
  const waveStartedAtRef = useRef(-100);
  const clickStartedAtRef = useRef(-100);
  const nextAutoWaveRef = useRef(
    Date.now() / 1000 + Math.max(2, autoWaveInterval / 1000),
  );
  const snapshotRef = useRef<MotionSnapshot | null>(null);

  const model = useMemo(() => {
    const clone = gltf.scene.clone(true);

    clone.traverse((object) => {
      if (object.name === "HIT_Robot") {
        object.visible = false;
        return;
      }

      if (!(object instanceof THREE.Mesh)) return;

      object.castShadow = false;
      object.receiveShadow = false;

      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];

      const clonedMaterials = materials.map((material) => {
        const cloned = material.clone();

        if (cloned.name === "MAT_BlueAccent") {
          cloned.color.set(accentColor);
        }

        if (cloned.name === "MAT_RedStatus") {
          cloned.color.set(statusColor);
          if ("emissive" in cloned) {
            (cloned as THREE.MeshStandardMaterial).emissive.set(statusColor);
          }
        }

        if (cloned.name === "MAT_VisorBlack") {
          const visor = cloned as THREE.MeshStandardMaterial;
          // visor "molhado": bem liso e reflexivo, puxando o reflexo do estúdio
          visor.roughness = 0.03;
          visor.metalness = 0.35;
          visor.envMapIntensity = 1.9;
        }

        // reflexos suaves do ambiente no plástico branco e nos demais materiais
        if ("envMapIntensity" in cloned && cloned.name !== "MAT_VisorBlack") {
          const std = cloned as THREE.MeshStandardMaterial;
          std.envMapIntensity = 0.95;
        }

        return cloned;
      });

      object.material = Array.isArray(object.material)
        ? clonedMaterials
        : clonedMaterials[0];
    });

    return clone;
  }, [accentColor, gltf.scene, statusColor]);

  const body = useMemo(
    () => model.getObjectByName("BodyPivot") as THREE.Object3D | null,
    [model],
  );
  const head = useMemo(
    () => model.getObjectByName("HeadPivot") as THREE.Object3D | null,
    [model],
  );
  const wrist = useMemo(
    () => model.getObjectByName("WaveWristPivot") as THREE.Object3D | null,
    [model],
  );
  const statusLight = useMemo(
    () => model.getObjectByName("StatusLight") as THREE.Mesh | null,
    [model],
  );

  useEffect(() => {
    if (!body || !head || !wrist) return;

    const statusMaterial = statusLight?.material as
      | THREE.MeshStandardMaterial
      | undefined;

    snapshotRef.current = {
      bodyY: body.position.y,
      bodyRotationY: body.rotation.y,
      headRotationX: head.rotation.x,
      headRotationY: head.rotation.y,
      headRotationZ: head.rotation.z,
      wristRotationZ: wrist.rotation.z,
      statusIntensity: statusMaterial?.emissiveIntensity ?? 1,
    };

    onLoaded?.();
  }, [body, head, onLoaded, statusLight, wrist]);

  useEffect(() => {
    return () => {
      model.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];
        materials.forEach((material) => material.dispose());
      });
    };
  }, [model]);

  useEffect(() => {
    return () => {
      document.body.style.cursor = "";
    };
  }, []);

  useFrame((state, delta) => {
    if (!active || !body || !head || !wrist || !snapshotRef.current) return;

    const now = performance.now() / 1000;
    const elapsed = state.clock.elapsedTime;
    const initial = snapshotRef.current;

    if (autoWave && now >= nextAutoWaveRef.current) {
      waveStartedAtRef.current = now;
      nextAutoWaveRef.current =
        now + Math.max(4, autoWaveInterval / 1000) + Math.random() * 2.5;
    }

    const waveElapsed = now - waveStartedAtRef.current;
    const waveDuration = 2.1;
    const waveProgress = THREE.MathUtils.clamp(waveElapsed / waveDuration, 0, 1);
    const waveEnvelope =
      waveElapsed >= 0 && waveElapsed <= waveDuration
        ? Math.sin(Math.PI * waveProgress)
        : 0;
    const waveRotation =
      Math.sin(waveProgress * Math.PI * 6) * 0.32 * waveEnvelope;

    const clickElapsed = now - clickStartedAtRef.current;
    const clickDuration = 0.95;
    const clickProgress = THREE.MathUtils.clamp(
      clickElapsed / clickDuration,
      0,
      1,
    );
    const clickEnvelope =
      clickElapsed >= 0 && clickElapsed <= clickDuration
        ? Math.sin(Math.PI * clickProgress)
        : 0;

    const idleY = Math.sin(elapsed * 1.45) * 0.008;
    body.position.y = initial.bodyY + idleY + clickEnvelope * 0.035;

    const pointerX = followPointer ? state.pointer.x : 0;
    const pointerY = followPointer ? state.pointer.y : 0;
    const hoverMultiplier = hoveredRef.current ? 1 : 0.72;

    head.rotation.y = THREE.MathUtils.damp(
      head.rotation.y,
      initial.headRotationY + pointerX * 0.28 * hoverMultiplier,
      8,
      delta,
    );
    head.rotation.x = THREE.MathUtils.damp(
      head.rotation.x,
      initial.headRotationX - pointerY * 0.12 * hoverMultiplier,
      8,
      delta,
    );
    head.rotation.z = THREE.MathUtils.damp(
      head.rotation.z,
      initial.headRotationZ - pointerX * 0.025 + waveEnvelope * 0.035,
      7,
      delta,
    );

    body.rotation.y = THREE.MathUtils.damp(
      body.rotation.y,
      initial.bodyRotationY + pointerX * 0.055,
      5,
      delta,
    );

    wrist.rotation.z = THREE.MathUtils.damp(
      wrist.rotation.z,
      initial.wristRotationZ + waveRotation,
      13,
      delta,
    );

    const statusMaterial = statusLight?.material as
      | THREE.MeshStandardMaterial
      | undefined;

    if (statusMaterial) {
      statusMaterial.emissiveIntensity =
        initial.statusIntensity +
        Math.sin(elapsed * 2.2) * 0.12 +
        waveEnvelope * 0.3 +
        clickEnvelope * 0.7;
    }
  });

  const triggerWave = () => {
    waveStartedAtRef.current = performance.now() / 1000;
  };

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    hoveredRef.current = true;
    document.body.style.cursor = "pointer";
    if (waveOnHover) triggerWave();
  };

  const handlePointerOut = () => {
    hoveredRef.current = false;
    document.body.style.cursor = "";
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (!reactOnClick) return;
    clickStartedAtRef.current = performance.now() / 1000;
    triggerWave();
    onRobotClick?.();
  };

  return (
    <group
      position={position}
      scale={scale}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <primitive object={model} />
    </group>
  );
}

// ambiente de estúdio (PMREM + RoomEnvironment) -> reflexos reais no plástico
// branco e no visor, sem HDRI externo/CDN. Faz o maior salto de fidelidade.
function StudioEnvironment() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = env.texture;
    return () => {
      scene.environment = null;
      env.texture.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

function StudioLights({ lowQuality }: { lowQuality: boolean }) {
  return (
    <>
      {/* com o environment dando preenchimento, as luzes diretas ficam mais
         contidas para não estourar o branco */}
      <hemisphereLight intensity={0.5} color="#ffffff" groundColor="#c8d4e2" />
      <directionalLight
        position={[-3.5, 5, 4]}
        intensity={2.0}
        color="#ffffff"
      />
      <directionalLight
        position={[4, 2.5, 3]}
        intensity={lowQuality ? 0.5 : 0.7}
        color="#dcecff"
      />
      {!lowQuality && (
        <pointLight position={[-2, 1.4, 3.5]} intensity={0.6} color="#eaf2ff" />
      )}
    </>
  );
}

export function InteractiveRobot({
  modelUrl = DEFAULT_MODEL,
  posterUrl = DEFAULT_POSTER,
  quality = "auto",
  scale = 0.92,
  position = [0, -0.88, 0],
  followPointer = true,
  autoWave = true,
  autoWaveInterval = 8500,
  waveOnHover = true,
  reactOnClick = true,
  shadows = true,
  accentColor = "#176fd1",
  statusColor = "#d62f27",
  ariaLabel = "Mascote robô interativo da Com Automação",
  onRobotClick,
  onLoaded,
  className,
  style,
  ...props
}: InteractiveRobotProps) {
  const prefersReducedMotion = useMediaQuery(
    "(prefers-reduced-motion: reduce)",
  );
  const coarsePointer = useMediaQuery("(pointer: coarse)");
  const { ref, visible } = useInViewport<HTMLDivElement>();
  const [loaded, setLoaded] = useState(false);

  const lowQuality = quality === "low" || (quality === "auto" && coarsePointer);
  const useStaticPoster = prefersReducedMotion;

  const handleLoaded = () => {
    setLoaded(true);
    onLoaded?.();
  };

  return (
    <div
      ref={ref}
      role="img"
      aria-label={ariaLabel}
      className={className}
      style={{
        position: "relative",
        minHeight: 320,
        overflow: "hidden",
        touchAction: "pan-y",
        ...style,
      }}
      {...props}
    >
      <img
        src={posterUrl}
        alt=""
        aria-hidden="true"
        draggable={false}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          opacity: loaded && !useStaticPoster ? 0 : 1,
          transition: "opacity 260ms ease",
          pointerEvents: "none",
          userSelect: "none",
        }}
      />

      {!useStaticPoster && visible && (
        <Canvas
          frameloop={visible ? "always" : "never"}
          dpr={lowQuality ? 1 : [1, 2]}
          camera={{ position: [0, 0.95, 4.25], fov: 30, near: 0.1, far: 50 }}
          gl={{
            alpha: true,
            antialias: !lowQuality,
            powerPreference: "high-performance",
          }}
          onCreated={({ gl }) => {
            gl.outputColorSpace = THREE.SRGBColorSpace;
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.08;
          }}
          fallback={
            <img
              src={posterUrl}
              alt=""
              aria-hidden="true"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          }
          style={{
            position: "absolute",
            inset: 0,
            opacity: loaded ? 1 : 0,
            transition: "opacity 260ms ease",
          }}
        >
          <Suspense fallback={null}>
            <StudioEnvironment />
            <StudioLights lowQuality={lowQuality} />
            <RobotModel
              modelUrl={modelUrl}
              scale={scale}
              position={position}
              followPointer={followPointer && !coarsePointer}
              autoWave={autoWave}
              autoWaveInterval={autoWaveInterval}
              waveOnHover={waveOnHover}
              reactOnClick={reactOnClick}
              accentColor={accentColor}
              statusColor={statusColor}
              active={visible}
              onRobotClick={onRobotClick}
              onLoaded={handleLoaded}
            />
            {shadows && !lowQuality && (
              <ContactShadows
                position={[0, -0.84, 0]}
                opacity={0.22}
                scale={2.5}
                blur={2.8}
                far={2.2}
                resolution={256}
                frames={1}
              />
            )}
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}

