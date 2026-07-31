import { cn } from "@/lib/utils";


type Variant = "primary" | "ghost" | "accent";

// Props explícitas em vez de um `Record<string, unknown>` aberto, que desligava
// a checagem de tipos de tudo que fosse passado ao botão. Os `data-*` seguem
// permitidos: as seções os usam para delay de reveal e para os efeitos.
type FlowButtonProps = {
  children: React.ReactNode;
  variant?: Variant;
  href?: string;
  className?: string;
  style?: React.CSSProperties;
  type?: "button" | "submit" | "reset";
  onClick?: React.MouseEventHandler;
  "aria-label"?: string;
} & { [key: `data-${string}`]: string | undefined };

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
