import { CodigoCard } from "./codigos-card";

export function CodigosList({ codigos }) {
  return (
    <ul className="w-full flex flex-col space-y-2 overflow-y-auto">
      {codigos.length > 0 ? (
        codigos.map((cod) => (
          <li key={cod.cod}>
            <CodigoCard codigo={cod} />
          </li>
        ))
      ) : (
        <p className="text-sm text-muted-foreground">
          Nenhum código encontrado.
        </p>
      )}
    </ul>
  );
}
