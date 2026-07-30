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
import { ContactShadows, useAnimations, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

export type RobotPose = "relaxed" | "celebrate";
export type RobotQuality = "auto" | "desktop" | "mobile";

export interface InteractiveRobotProps {
  className?: string;
  pose?: RobotPose;
  animationTrigger?: number;
  desktopModelUrl?: string;
  mobileModelUrl?: string;
  posterUrl?: string;
  quality?: RobotQuality;
  followPointer?: boolean;
  pointerStrength?: number;
  shadows?: boolean;
  scale?: number;
  position?: [number, number, number];
  onRobotClick?: () => void;
  onLoaded?: () => void;
  onAnimationFinished?: (pose: RobotPose) => void;
  ariaLabel?: string;
}

interface RobotSceneProps {
  modelUrl: string;
  pose: RobotPose;
  animationTrigger: number;
  followPointer: boolean;
  pointerStrength: number;
  reducedMotion: boolean;
  scale: number;
  position: [number, number, number];
  onRobotClick?: () => void;
  onLoaded?: () => void;
  onAnimationFinished?: (pose: RobotPose) => void;
}

const DEG = THREE.MathUtils.degToRad;

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
} satisfies Record<RobotPose, Record<string, readonly [number, number, number]>>;

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

function useNearViewport<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [nearViewport, setNearViewport] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (typeof IntersectionObserver === "undefined") {
      setNearViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: "320px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, nearViewport };
}

function RobotScene({
  modelUrl,
  pose,
  animationTrigger,
  followPointer,
  pointerStrength,
  reducedMotion,
  scale,
  position,
  onRobotClick,
  onLoaded,
  onAnimationFinished,
}: RobotSceneProps) {
  const gltf = useGLTF(modelUrl);
  const model = useMemo(() => clone(gltf.scene) as THREE.Group, [gltf.scene]);
  const { actions, mixer } = useAnimations(gltf.animations, model);
  const { gl } = useThree();

  const head = useMemo(
    () => model.getObjectByName("HeadPivot") as THREE.Object3D | undefined,
    [model],
  );

  const initializedRef = useRef(false);
  const initializedModelRef = useRef<THREE.Group | null>(null);
  const previousCommandRef = useRef("");
  const activePoseRef = useRef<RobotPose>(pose);
  const pointerRef = useRef(new THREE.Vector2());
  const pointerInsideRef = useRef(false);
  const hoveredRef = useRef(false);

  const applyFinalPose = useCallback(
    (targetPose: RobotPose) => {
      const definition = FINAL_POSES[targetPose];

      for (const [nodeName, degrees] of Object.entries(definition)) {
        const node = model.getObjectByName(nodeName);
        if (!node) continue;
        node.rotation.set(DEG(degrees[0]), DEG(degrees[1]), DEG(degrees[2]), "XYZ");
      }
    },
    [model],
  );

  const playClip = useCallback(
    (targetPose: RobotPose) => {
      activePoseRef.current = targetPose;
      const clipName =
        targetPose === "celebrate" ? "ArmsUp_Celebrate" : "ArmsDown_Relax";
      const nextAction = actions[clipName];

      if (!nextAction) {
        applyFinalPose(targetPose);
        onAnimationFinished?.(targetPose);
        return;
      }

      for (const action of Object.values(actions)) {
        if (action && action !== nextAction) action.fadeOut(0.1);
      }

      nextAction.reset();
      nextAction.enabled = true;
      nextAction.setEffectiveTimeScale(1);
      nextAction.setEffectiveWeight(1);
      nextAction.setLoop(THREE.LoopOnce, 1);
      nextAction.clampWhenFinished = true;
      nextAction.fadeIn(0.1).play();
    },
    [actions, applyFinalPose, onAnimationFinished],
  );

  useLayoutEffect(() => {
    if (initializedModelRef.current === model) return;
    initializedModelRef.current = model;

    model.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.frustumCulled = true;
      }
    });

    applyFinalPose("relaxed");
    initializedRef.current = true;
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
    model,
    onLoaded,
    playClip,
    pose,
    reducedMotion,
  ]);

  useEffect(() => {
    if (!initializedRef.current) return;

    const command = `${pose}:${animationTrigger}`;
    if (command === previousCommandRef.current) return;
    previousCommandRef.current = command;
    activePoseRef.current = pose;

    if (reducedMotion) {
      for (const action of Object.values(actions)) action?.stop();
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
    const handleFinished = () => onAnimationFinished?.(activePoseRef.current);
    mixer.addEventListener("finished", handleFinished);
    return () => mixer.removeEventListener("finished", handleFinished);
  }, [mixer, onAnimationFinished]);

  useEffect(() => {
    const canvas = gl.domElement;

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      if (bounds.width === 0 || bounds.height === 0) return;

      pointerRef.current.set(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        -(((event.clientY - bounds.top) / bounds.height) * 2 - 1),
      );
      pointerInsideRef.current = true;
    };

    const handlePointerLeave = () => {
      pointerInsideRef.current = false;
    };

    canvas.addEventListener("pointermove", handlePointerMove, { passive: true });
    canvas.addEventListener("pointerleave", handlePointerLeave, { passive: true });

    return () => {
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [gl]);

  useEffect(() => {
    return () => {
      document.body.style.cursor = "";
      for (const action of Object.values(actions)) action?.stop();
    };
  }, [actions]);

  useFrame((_, delta) => {
    if (!head) return;

    const enabled = followPointer && !reducedMotion && pointerInsideRef.current;
    const hoverMultiplier = hoveredRef.current ? 1 : 0.82;
    const targetYaw = enabled
      ? pointerRef.current.x * 0.28 * pointerStrength * hoverMultiplier
      : 0;
    const targetPitch = enabled
      ? pointerRef.current.y * 0.12 * pointerStrength * hoverMultiplier
      : 0;
    const targetRoll = enabled
      ? -pointerRef.current.x * 0.018 * pointerStrength
      : 0;

    head.rotation.y = THREE.MathUtils.damp(head.rotation.y, targetYaw, 7.5, delta);
    head.rotation.x = THREE.MathUtils.damp(head.rotation.x, targetPitch, 7.5, delta);
    head.rotation.z = THREE.MathUtils.damp(head.rotation.z, targetRoll, 7.5, delta);
  });

  return (
    <group
      position={position}
      scale={scale}
      onPointerOver={(event) => {
        event.stopPropagation();
        hoveredRef.current = true;
        document.body.style.cursor = onRobotClick ? "pointer" : "default";
      }}
      onPointerOut={() => {
        hoveredRef.current = false;
        document.body.style.cursor = "";
      }}
      onClick={(event) => {
        event.stopPropagation();
        onRobotClick?.();
      }}
    >
      <primitive object={model} dispose={null} />
    </group>
  );
}

export function InteractiveRobot({
  className,
  pose = "relaxed",
  animationTrigger = 0,
  desktopModelUrl = "/models/com-automation-robot-hq.glb",
  mobileModelUrl = "/models/com-automation-robot-hq-mobile.glb",
  posterUrl = "/images/com-automation-robot-poster.webp",
  quality = "auto",
  followPointer = true,
  pointerStrength = 1,
  shadows = true,
  scale = 1,
  position = [0, 0, 0],
  onRobotClick,
  onLoaded,
  onAnimationFinished,
  ariaLabel = "Mascote robô interativo da Com Automação",
}: InteractiveRobotProps) {
  const mobileDevice = useMediaQuery("(max-width: 768px), (pointer: coarse)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const { ref, nearViewport } = useNearViewport<HTMLDivElement>();
  const [loaded, setLoaded] = useState(false);

  const useMobileModel =
    quality === "mobile" || (quality === "auto" && mobileDevice);
  const modelUrl = useMobileModel ? mobileModelUrl : desktopModelUrl;

  useEffect(() => setLoaded(false), [modelUrl]);

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
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            opacity: loaded ? 0 : 1,
            transition: "opacity 240ms ease",
            pointerEvents: "none",
            userSelect: "none",
          }}
        />
      )}

      {nearViewport && (
        <Canvas
          frameloop="always"
          dpr={useMobileModel ? [1, 1.15] : [1, 1.5]}
          camera={{ position: [0, 0.84, 3.15], fov: 31, near: 0.1, far: 20 }}
          gl={{
            alpha: true,
            antialias: !useMobileModel,
            powerPreference: "high-performance",
          }}
          onCreated={({ gl: renderer }) => {
            renderer.outputColorSpace = THREE.SRGBColorSpace;
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.04;
            renderer.setClearColor(0x000000, 0);
          }}
        >
          <ambientLight intensity={1.45} />
          <directionalLight position={[-3.5, 5, 4]} intensity={3.1} />
          <directionalLight position={[3, 2.2, 2.5]} intensity={1.15} />
          <directionalLight position={[0, 3, -4]} intensity={0.8} />

          <Suspense fallback={null}>
            <RobotScene
              key={modelUrl}
              modelUrl={modelUrl}
              pose={pose}
              animationTrigger={animationTrigger}
              followPointer={followPointer && !mobileDevice}
              pointerStrength={pointerStrength}
              reducedMotion={reducedMotion}
              scale={scale}
              position={position}
              onRobotClick={onRobotClick}
              onLoaded={() => {
                setLoaded(true);
                onLoaded?.();
              }}
              onAnimationFinished={onAnimationFinished}
            />
          </Suspense>

          {shadows && (
            <ContactShadows
              position={[0, 0.008, 0]}
              opacity={0.24}
              scale={2.25}
              blur={2.7}
              far={1.2}
              resolution={useMobileModel ? 256 : 512}
              frames={1}
            />
          )}
        </Canvas>
      )}
    </div>
  );
}
