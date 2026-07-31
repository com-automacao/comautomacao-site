'use client';
import { useEffect, useState } from 'react';

type TextScrambleProps = {
  children: string;
  duration?: number;
  speed?: number;
  characterSet?: string;
  /** tags de texto; a lista é fechada para o TS conseguir tipar os filhos */
  as?: "p" | "span" | "div" | "h2" | "h3";
  className?: string;
  trigger?: boolean;
  onScrambleComplete?: () => void;
};

const defaultChars =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function TextScramble({
  children,
  duration = 0.8,
  speed = 0.04,
  characterSet = defaultChars,
  className,
  as: Component = 'p',
  trigger = true,
  onScrambleComplete,
}: TextScrambleProps) {
  // null = sem embaralhamento em curso; renderiza o texto final.
  const [scrambled, setScrambled] = useState<string | null>(null);
  const text = children;

  useEffect(() => {
    if (!trigger) return;

    const steps = duration / speed;
    let step = 0;

    const interval = setInterval(() => {
      let out = '';
      const progress = step / steps;

      for (let i = 0; i < text.length; i++) {
        if (text[i] === ' ') {
          out += ' ';
          continue;
        }
        out +=
          progress * text.length > i
            ? text[i]
            : characterSet[Math.floor(Math.random() * characterSet.length)];
      }

      step++;

      if (step > steps) {
        clearInterval(interval);
        setScrambled(null);
        onScrambleComplete?.();
        return;
      }

      setScrambled(out);
    }, speed * 1000);

    // o componente é desmontado no mouse-leave da faixa de produto: sem este
    // clear o intervalo seguiria rodando e escrevendo estado no vazio.
    return () => clearInterval(interval);
  }, [trigger, text, duration, speed, characterSet, onScrambleComplete]);

  return <Component className={className}>{scrambled ?? text}</Component>;
}
