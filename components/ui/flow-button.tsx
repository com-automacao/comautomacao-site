import { cn } from "@/lib/utils";

/**
 * Botão com efeito "flow" no hover (círculo que preenche a partir do canto,
 * invertendo a cor) — porte do componente flow-hover-button (vaib215),
 * adaptado ao design system: pill, monocromático + variante de acento, e
 * polimórfico (vira <a> quando recebe href, senão <button>).
 *
 * Usado em TODOS os botões do site, exceto os do header.
 */
type Variant = "primary" | "ghost" | "accent";

type FlowButtonProps = {
  children: React.ReactNode;
  variant?: Variant;
  href?: string;
  className?: string;
  style?: React.CSSProperties;
} & Record<string, unknown>;

const variantClass: Record<Variant, string> = {
  primary: "is-primary",
  ghost: "is-ghost",
  accent: "is-accent",
};

export function FlowButton({
  children,
  variant = "primary",
  href,
  className,
  style,
  ...rest
}: FlowButtonProps) {
  const cls = cn("flow-btn", variantClass[variant], className);

  if (href) {
    const external = /^https?:/i.test(href);
    return (
      <a
        href={href}
        className={cls}
        style={style}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <button className={cls} style={style} {...rest}>
      {children}
    </button>
  );
}
