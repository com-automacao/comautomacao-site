// template.tsx é remontado a cada navegação (diferente de layout.tsx), então o
// DOM é recriado e a animação CSS toca sempre que se entra numa página de
// produto — dando o fade-in ao selecionar um produto.
export default function ProductTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="page-fade">{children}</div>;
}
