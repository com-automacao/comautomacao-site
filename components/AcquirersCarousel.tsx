"use client";

export default function AcquirersCarousel({ images }: { images: string[] }) {

  const loop = [...images, ...images];

  return (
    <div className="acq-carousel" role="region" aria-label="Maquininhas compatíveis">
      <div className="acq-track">
        {loop.map((src, i) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={i}
            className="acq-item"
            src={src}
            alt="PDV Plus rodando na maquininha"
            loading="lazy"
            draggable={false}
            aria-hidden={i >= images.length ? true : undefined}
          />
        ))}
      </div>
    </div>
  );
}
