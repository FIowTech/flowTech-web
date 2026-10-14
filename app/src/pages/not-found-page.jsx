import { Link } from "react-router";

export default function NotFoundPage() {
  return (
    <div className="w-full min-h-dvh flex flex-col space-y-4 items-center justify-center">
      <h1 className="font-heading font-bold text-4xl">
        404 - Página Não Encontrada :(
      </h1>
      <p>
        Parece que você se perdeu 😅. Que tal clicar{" "}
        <Link to="/" className="text-primary underline">
          aqui
        </Link>{" "}
        e voltar para o início?
      </p>
    </div>
  );
}
