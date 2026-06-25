"use client";

import { useEffect, useRef } from "react";

const POSTER =
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2400&q=80";

/**
 * Fundo de vídeo do hero da home — autoplay, loop, mudo, sem controles.
 * Fica EM CORES (única exceção colorida do shell). Garante o play e marca
 * `.playing` no pai quando o vídeo realmente toca (cross-fade do poster).
 * Cliente vai plugar a footage real da estratosfera/Terra.
 */
export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const hero = v.closest(".hero");
    const onPlaying = () => hero?.classList.add("playing");
    v.addEventListener("playing", onPlaying);
    const tryPlay = () => v.play().catch(() => {});
    tryPlay();
    const onVis = () => {
      if (!document.hidden) tryPlay();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      v.removeEventListener("playing", onPlaying);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="hero-bg poster" alt="Terra vista da estratosfera" src={POSTER} />
      <video
        ref={videoRef}
        className="hero-bg vid"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster={POSTER}
      >
        <source
          src="https://videos.pexels.com/video-files/18124738/18124738-hd_1920_1080_24fps.mp4"
          type="video/mp4"
        />
        <source
          src="https://upload.wikimedia.org/wikipedia/commons/9/99/Animation_of_Rotating_Earth_at_Night.webm"
          type="video/webm"
        />
      </video>
    </>
  );
}
