"use client";

import type * as T from "three";
import { useEffect, useRef } from "react";

// Mascote astronauta 3D (desktop). A cabeça segue o mouse; ao passar o mouse no
// botão [data-mascot-cheer] ("Vamos decolar") ele levanta as mãos.
// Só roda em desktop (ponteiro fino, tela larga, sem prefers-reduced-motion) e
// carrega o three.js sob demanda quando entra na viewport — mobile não baixa a
// lib nem paga o custo de render.
export default function MascotAstronaut() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const okDesktop =
      window.matchMedia("(min-width: 980px)").matches &&
      window.matchMedia("(pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!okDesktop) return;

    let dispose = () => {};
    let started = false;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          started = true;
          io.disconnect();
          start().then((d) => {
            if (d) dispose = d;
          });
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(host);

    async function start(): Promise<(() => void) | void> {
      const THREE: typeof T = await import("three");
      const { RoomEnvironment } = await import(
        "three/examples/jsm/environments/RoomEnvironment.js"
      );
      if (!host) return;

      const w = host.clientWidth || 340;
      const h = host.clientHeight || 380;

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(30, w / h, 0.1, 100);
      camera.position.set(0.35, 0.42, 7.4);
      camera.lookAt(0, 0.3, 0);

      // ambiente de estúdio -> reflexos suaves no plástico branco e no visor
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

      // luzes
      const hemi = new THREE.HemisphereLight(0xdfe8ff, 0x0b0e14, 0.75);
      scene.add(hemi);
      const key = new THREE.DirectionalLight(0xffffff, 2.1);
      key.position.set(3, 4.5, 4);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0x5b8cff, 1.5);
      rim.position.set(-4, 2.5, -3);
      scene.add(rim);
      const fill = new THREE.DirectionalLight(0xffffff, 0.5);
      fill.position.set(-2, -1, 3);
      scene.add(fill);

      // ---- paleta / materiais ----
      const matWhite = new THREE.MeshStandardMaterial({
        color: 0xeef2f9,
        roughness: 0.4,
        metalness: 0.02,
        envMapIntensity: 0.9,
      });
      const matWhiteSoft = new THREE.MeshStandardMaterial({
        color: 0xd8dfec,
        roughness: 0.55,
        metalness: 0.02,
        envMapIntensity: 0.7,
      });
      const matAccent = new THREE.MeshStandardMaterial({
        color: 0x2f6bff,
        roughness: 0.35,
        metalness: 0.1,
        envMapIntensity: 1,
      });
      const matVisor = new THREE.MeshStandardMaterial({
        color: 0x0a1428,
        roughness: 0.08,
        metalness: 0.2,
        envMapIntensity: 1.4,
      });
      const matRed = new THREE.MeshStandardMaterial({
        color: 0xe0342f,
        roughness: 0.3,
        metalness: 0.05,
        emissive: 0x300000,
      });
      const matDark = new THREE.MeshStandardMaterial({
        color: 0x1b2130,
        roughness: 0.6,
        metalness: 0.1,
      });

      // ---- helpers ----
      const capsule = (
        r: number,
        len: number,
        mat: T.Material,
      ): T.Mesh => new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 8, 20), mat);
      const sphere = (r: number, mat: T.Material): T.Mesh =>
        new THREE.Mesh(new THREE.SphereGeometry(r, 40, 40), mat);
      const ring = (R: number, r: number, mat: T.Material): T.Mesh =>
        new THREE.Mesh(new THREE.TorusGeometry(R, r, 16, 40), mat);

      const model = new THREE.Group();
      scene.add(model);

      // ---- TRONCO (lathe revolvido) ----
      const profile: T.Vector2[] = [
        new THREE.Vector2(0.02, 0.92),
        new THREE.Vector2(0.34, 0.9),
        new THREE.Vector2(0.52, 0.78),
        new THREE.Vector2(0.58, 0.5),
        new THREE.Vector2(0.55, 0.2),
        new THREE.Vector2(0.47, -0.05),
        new THREE.Vector2(0.34, -0.2),
        new THREE.Vector2(0.02, -0.24),
      ];
      const torso = new THREE.Mesh(
        new THREE.LatheGeometry(profile, 48),
        matWhite,
      );
      model.add(torso);

      // mochila
      const pack = new THREE.Mesh(
        new THREE.BoxGeometry(0.74, 0.82, 0.34),
        matWhiteSoft,
      );
      pack.position.set(0, 0.42, -0.42);
      model.add(pack);

      // botão vermelho no peito
      const chest = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.09, 0.06, 28),
        matRed,
      );
      chest.rotation.x = Math.PI / 2;
      chest.position.set(0, 0.42, 0.52);
      model.add(chest);

      // cinto
      const belt = ring(0.47, 0.06, matAccent);
      belt.rotation.x = Math.PI / 2;
      belt.position.y = 0.0;
      belt.scale.z = 0.8;
      model.add(belt);

      // ---- CABEÇA (pivô no pescoço) ----
      const head = new THREE.Group();
      head.position.set(0, 1.05, 0);
      model.add(head);
      const neck = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.28, 0.16, 28),
        matAccent,
      );
      neck.position.y = 0.02;
      head.add(neck);
      const helmet = sphere(0.6, matWhite);
      helmet.position.y = 0.42;
      head.add(helmet);
      // visor
      const visor = sphere(0.5, matVisor);
      visor.scale.set(0.92, 0.74, 0.7);
      visor.position.set(0, 0.44, 0.26);
      head.add(visor);
      const visorRing = ring(0.42, 0.05, matAccent);
      visorRing.position.set(0, 0.44, 0.28);
      visorRing.scale.set(1, 0.82, 1);
      head.add(visorRing);
      // antena
      const antenna = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.22, 8),
        matWhiteSoft,
      );
      antenna.position.set(0.42, 0.92, 0);
      antenna.rotation.z = -0.3;
      head.add(antenna);
      const antennaTip = sphere(0.06, matRed);
      antennaTip.position.set(0.36, 1.04, 0);
      head.add(antennaTip);

      // ---- BRAÇOS (pivô no ombro) ----
      const makeArm = (side: number) => {
        const shoulder = new THREE.Group();
        shoulder.position.set(side * 0.5, 0.74, 0);
        const shoulderBall = sphere(0.2, matWhite);
        shoulder.add(shoulderBall);
        const upper = capsule(0.16, 0.42, matWhite);
        upper.position.y = -0.34;
        shoulder.add(upper);
        const elbow = ring(0.16, 0.045, matAccent);
        elbow.position.y = -0.6;
        elbow.rotation.x = Math.PI / 2;
        shoulder.add(elbow);
        const fore = capsule(0.14, 0.38, matWhite);
        fore.position.y = -0.86;
        shoulder.add(fore);
        const glove = sphere(0.17, matAccent);
        glove.position.y = -1.16;
        shoulder.add(glove);
        model.add(shoulder);
        return shoulder;
      };
      const leftArm = makeArm(-1);
      const rightArm = makeArm(1);
      // rotações de repouso (braços levemente abertos)
      const restL = new THREE.Euler(0, 0, 0.2);
      const restR = new THREE.Euler(0, 0, -0.2);
      // rotações "comemorando" (mãos para o alto, abertas em V)
      const cheerL = new THREE.Euler(0, 0, -2.35);
      const cheerR = new THREE.Euler(0, 0, 2.35);
      leftArm.rotation.copy(restL);
      rightArm.rotation.copy(restR);

      // ---- PERNAS ----
      const makeLeg = (side: number) => {
        const hip = new THREE.Group();
        hip.position.set(side * 0.22, -0.2, 0);
        const thigh = capsule(0.18, 0.34, matWhite);
        thigh.position.y = -0.28;
        hip.add(thigh);
        const knee = ring(0.17, 0.045, matAccent);
        knee.position.y = -0.54;
        knee.rotation.x = Math.PI / 2;
        hip.add(knee);
        const shin = capsule(0.16, 0.32, matWhite);
        shin.position.y = -0.78;
        hip.add(shin);
        const boot = new THREE.Mesh(
          new THREE.SphereGeometry(0.2, 28, 28),
          matWhite,
        );
        boot.scale.set(1, 0.8, 1.35);
        boot.position.set(0, -1.05, 0.12);
        hip.add(boot);
        const sole = ring(0.17, 0.05, matAccent);
        sole.rotation.x = Math.PI / 2;
        sole.position.set(0, -1.14, 0.12);
        sole.scale.z = 1.3;
        hip.add(sole);
        model.add(hip);
        return hip;
      };
      makeLeg(-1);
      makeLeg(1);

      // recentra verticalmente
      model.position.y = 0.05;

      // ---- interação ----
      const pointer = { x: 0, y: 0 };
      const onPointerMove = (e: PointerEvent) => {
        pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
      };
      window.addEventListener("pointermove", onPointerMove, { passive: true });

      let cheerTarget = 0;
      let cheer = 0;
      const cheerBtn = document.querySelector<HTMLElement>(
        "[data-mascot-cheer]",
      );
      const onEnter = () => (cheerTarget = 1);
      const onLeave = () => (cheerTarget = 0);
      cheerBtn?.addEventListener("pointerenter", onEnter);
      cheerBtn?.addEventListener("pointerleave", onLeave);

      // ---- loop ----
      let paused = false;
      const visIO = new IntersectionObserver(
        (en) => (paused = !en[0].isIntersecting),
        { threshold: 0 },
      );
      visIO.observe(host);

      let raf = 0;
      let alive = true;
      const tmpL = new THREE.Euler();
      const tmpR = new THREE.Euler();
      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

      const tick = () => {
        if (!alive) return;
        raf = requestAnimationFrame(tick);
        if (paused) return;

        // cabeça segue o mouse (com limites suaves)
        const ty = THREE.MathUtils.clamp(pointer.x * 0.6, -0.7, 0.7);
        const tx = THREE.MathUtils.clamp(pointer.y * 0.4, -0.4, 0.45);
        head.rotation.y = lerp(head.rotation.y, ty, 0.1);
        head.rotation.x = lerp(head.rotation.x, tx, 0.1);
        // corpo acompanha de leve
        model.rotation.y = lerp(model.rotation.y, ty * 0.25, 0.08);

        // mãos para o alto no hover do botão
        cheer = lerp(cheer, cheerTarget, 0.12);
        tmpL.set(
          lerp(restL.x, cheerL.x, cheer),
          lerp(restL.y, cheerL.y, cheer),
          lerp(restL.z, cheerL.z, cheer),
        );
        tmpR.set(
          lerp(restR.x, cheerR.x, cheer),
          lerp(restR.y, cheerR.y, cheer),
          lerp(restR.z, cheerR.z, cheer),
        );
        leftArm.rotation.copy(tmpL);
        rightArm.rotation.copy(tmpR);

        // leve flutuação
        model.position.y = 0.05 + Math.sin(performance.now() * 0.0012) * 0.04;

        renderer.render(scene, camera);
      };
      tick();

      // resize
      const onResize = () => {
        const nw = host.clientWidth || w;
        const nh = host.clientHeight || h;
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
      };
      const ro = new ResizeObserver(onResize);
      ro.observe(host);

      return () => {
        alive = false;
        cancelAnimationFrame(raf);
        window.removeEventListener("pointermove", onPointerMove);
        cheerBtn?.removeEventListener("pointerenter", onEnter);
        cheerBtn?.removeEventListener("pointerleave", onLeave);
        visIO.disconnect();
        ro.disconnect();
        scene.traverse((o) => {
          const m = o as T.Mesh;
          if (m.geometry) m.geometry.dispose();
        });
        [
          matWhite,
          matWhiteSoft,
          matAccent,
          matVisor,
          matRed,
          matDark,
        ].forEach((m) => m.dispose());
        scene.environment?.dispose();
        pmrem.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    }

    return () => {
      io.disconnect();
      dispose();
    };
  }, []);

  return <div ref={hostRef} className="mascot3d" aria-hidden />;
}
