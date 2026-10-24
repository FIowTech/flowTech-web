import { MembrosCard } from "./membros-card";

export function MembrosList({ membros }) {
  return (
    <ul className="w-full flex flex-col space-y-2 overflow-y-auto">
      {membros.length > 0 ? (
        membros.map((membro) => (
          <li key={membro.id_usuario}>
            <MembrosCard membro={membro} />
          </li>
        ))
      ) : (
        <p className="text-sm text-muted-foreground">
          Nenhum membro encontrado.
        </p>
      )}
    </ul>
  );
}
