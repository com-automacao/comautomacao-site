"use client";

import { useEffect, useRef } from "react";

type Acquirer = { src: string; name: string };

export default function AcquirersCarousel({ items }: { items: Acquirer[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const loop = [...items, ...items];

  useEffect(() => {
    const scroller = scrollerRef.current;
    const track = trackRef.current;
    if (!scroller || !track) return;

    let half = 0; // largura de uma cópia (metade da faixa)
    const measure = () => {
      half = track.scrollWidth / 2;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);

    let interacting = false; // hover/toque pausa o auto-scroll
    let mouseDrag = false;
    let startX = 0;
    let startScroll = 0;
    let rafId = 0;

    // wrap infinito (só pra frente): ao passar de uma cópia, volta uma cópia
    const wrap = () => {
      if (half > 0 && scroller.scrollLeft >= half) scroller.scrollLeft -= half;
    };

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const tick = () => {
      if (!interacting && !mouseDrag && half > 0) {
        scroller.scrollLeft += half / 3200;
      }
      rafId = requestAnimationFrame(tick);
    };

    // O laço só roda com o carrossel à vista e a aba ativa — antes ele girava
    // para sempre, mesmo com a seção fora da tela.
    let onScreen = false;
    const sync = () => {
      const shouldRun = onScreen && !reduce && !document.hidden;
      if (shouldRun && !rafId) rafId = requestAnimationFrame(tick);
      else if (!shouldRun && rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { rootMargin: "120px" },
    );
    io.observe(scroller);
    document.addEventListener("visibilitychange", sync);

    const onEnter = () => {
      interacting = true;
    };
    const onLeave = () => {
      interacting = false;
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return; // touch usa scroll nativo
      mouseDrag = true;
      startX = e.clientX;
      startScroll = scroller.scrollLeft;
      scroller.setPointerCapture(e.pointerId);
      scroller.classList.add("is-dragging");
      e.preventDefault();
    };
    const onMove = (e: PointerEvent) => {
      if (!mouseDrag) return;
      scroller.scrollLeft = startScroll - (e.clientX - startX);
    };
    const endDrag = (e: PointerEvent) => {
      if (!mouseDrag) return;
      mouseDrag = false;
      scroller.classList.remove("is-dragging");
      try {
        scroller.releasePointerCapture(e.pointerId);
      } catch {}
    };

    scroller.addEventListener("pointerenter", onEnter);
    scroller.addEventListener("pointerleave", onLeave);
    scroller.addEventListener("pointerdown", onDown);
    scroller.addEventListener("pointermove", onMove);
    scroller.addEventListener("pointerup", endDrag);
    scroller.addEventListener("pointercancel", endDrag);
    scroller.addEventListener("scroll", wrap, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      ro.disconnect();
      scroller.removeEventListener("pointerenter", onEnter);
      scroller.removeEventListener("pointerleave", onLeave);
      scroller.removeEventListener("pointerdown", onDown);
      scroller.removeEventListener("pointermove", onMove);
      scroller.removeEventListener("pointerup", endDrag);
      scroller.removeEventListener("pointercancel", endDrag);
      scroller.removeEventListener("scroll", wrap);
    };
  }, [items]);

  return (
    <div
      className="acq-carousel"
      ref={scrollerRef}
      role="region"
      aria-label="Maquininhas compatíveis"
    >
      <div className="acq-track" ref={trackRef}>
        {loop.map((it, i) => (
          <figure
            key={i}
            className="acq-item"
            aria-hidden={i >= items.length ? true : undefined}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="acq-photo"
              src={it.src}
              alt={`PDV+ rodando na ${it.name}`}
              loading="lazy"
              draggable={false}
            />
            <figcaption className="acq-name">{it.name}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
