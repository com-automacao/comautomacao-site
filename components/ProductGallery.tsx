"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

type GalleryItem = {
  src: string;
  caption: string;
  portrait?: boolean;
  light?: boolean;
};

export default function ProductGallery({ items }: { items: GalleryItem[] }) {
  const [active, setActive] = useState<number | null>(null);
  const [shown, setShown] = useState(false);

  const openAt = useCallback((i: number) => {
    setActive(i);

    requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
  }, []);

  const close = useCallback(() => {
    setShown(false);

    window.setTimeout(() => setActive(null), 240);
  }, []);

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, close]);

  const item = active !== null ? items[active] : null;

  return (
    <>
      <div className="gallery reveal r-rise" data-d="1">
        {items.map((g, i) => (
          <figure
            key={g.src}
            className={`gallery-tile is-zoomable${g.portrait ? " is-portrait" : ""}${g.light ? " is-light" : ""}`}
            role="button"
            tabIndex={0}
            aria-label={`Ampliar: ${g.caption}`}
            onClick={() => openAt(i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openAt(i);
              }
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={g.src} alt={g.caption} loading="lazy" />
            <figcaption className="mono-label">{g.caption}</figcaption>
          </figure>
        ))}
      </div>

      {/* o portal só existe depois de um clique, então nunca roda no SSR */}
      {item &&
        createPortal(
          <div
            className={`lightbox${shown ? " is-open" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label={item.caption}
            onClick={close}
          >
            <button
              type="button"
              className="lightbox-close"
              aria-label="Fechar"
              onClick={close}
            >
              ×
            </button>
            <figure className="lightbox-fig" onClick={(e) => e.stopPropagation()}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.src} alt={item.caption} />
              <figcaption className="mono-label">{item.caption}</figcaption>
            </figure>
          </div>,
          document.body,
        )}
    </>
  );
}
