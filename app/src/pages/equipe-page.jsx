import { Relogio } from "@/components/relogio";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  PencilSimpleIcon,
  PlusIcon,
  ProhibitIcon,
  SignOutIcon,
} from "@phosphor-icons/react";
import { useAuth } from "@/store/auth-store";
import { useFetchEmpresa } from "@/hooks/useFetchEmpresa";
import { useFetchUsuarios } from "@/hooks/useFetchUsuarios";

const nomesNivelAcesso = {
  0: "Desenvolvedor",
  1: "Administrador",
  2: "Usuário",
};

function ListaMembros({ empresa, usuarioLogado }) {
  const { usuarios, isLoading, error } = useFetchUsuarios(empresa.id);

  return (
    <div className="bg-background p-4 flex flex-col space-y-6 rounded-md border-2 border-border">
      <div className="w-full flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">
          Membros de{" "}
          <span className="text-primary-hover font-heading font-semibold">
            {empresa.nome}
          </span>
        </h2>

        <Button
          type="button"
          className="flex items-center gap-2 cursor-pointer"
        >
          Convidar Membro
          <PlusIcon />
        </Button>
      </div>

      <div className="space-y-3">
        {isLoading && (
          <p className="text-sm text-muted-foreground">
            Carregando membros...
          </p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {!isLoading && !error && !usuarios?.length && (
          <p className="text-sm text-muted-foreground">
            Nenhum membro encontrado.
          </p>
        )}

        {usuarios?.map((membro) => (
          <article
            key={membro.id}
            className="flex items-center gap-3 rounded-md border-2 border-border bg-background p-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-border bg-muted text-sm font-semibold text-primary-hover">
              {membro.nome?.[0]}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="truncate font-medium">{membro.nome}</h3>
              <p className="mt-1 wrap-break-word text-sm text-muted-foreground">
                {nomesNivelAcesso[membro.nivel_acesso]} • {membro.email}
              </p>
            </div>

            {membro.email !== usuarioLogado?.email && (
              <Button
                type="button"
                variant="outline"
                aria-label={`Editar ${membro.nome}`}
                className="shrink-0 cursor-pointer"
              >
                <PencilSimpleIcon />
              </Button>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

export default function EquipePage() {
  const usuario = useAuth((state) => state.usuario);
  const cargo = nomesNivelAcesso[usuario?.nivel_acesso] ?? usuario?.email;

  const { empresa } = useFetchEmpresa();

  return (
    <div className="w-full flex flex-col space-y-6">
      <Card className="bg-background flex-row items-center justify-between px-4">
        <div>
          <h2 className="block text-xs text-muted-foreground">Logado como</h2>
          <h1 className="font-heading text-xl font-semibold">
            <span className="text-primary-hover">
            {usuario?.nome}
              {" • "}
              {cargo}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Relogio />
          <Button
            type="button"
            variant="outline"
            aria-label="Sair"
            className="cursor-pointer text-destructive hover:text-destructive"
          >
            <SignOutIcon />
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        {/* Lista de Membros */}
        {empresa && <ListaMembros empresa={empresa} usuarioLogado={usuario} />}

        <div className="bg-background p-4 flex flex-col space-y-6 rounded-md border-2 border-border">
          <h2 className="text-center text-xl font-semibold">
            Convites Criados
          </h2>

          <article className="rounded-md border-2 border-border bg-muted p-4">
            <div className="flex flex-wrap gap-2">
              {[
                "cod: XPTO1234ABCD",
                "usos: 2/5",
                "criado em: 14/02/2026 12:45",
                "expira em: 16/02/2026 12:45",
              ].map((info) => (
                <span
                  key={info}
                  className="rounded-full border-2 border-border bg-background px-3 py-1 text-xs text-muted-foreground"
                >
                  {info}
                </span>
              ))}
            </div>

            <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <p className="text-sm text-muted-foreground">
                Criado por{" "}
                <span className="font-medium text-foreground">
                  {usuario?.nome}
                </span>{" "}
                • <span className="text-primary-hover">Encontra-se Ativo</span>
              </p>

              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2 cursor-pointer self-start text-destructive hover:text-destructive sm:self-auto"
              >
                Revogar
                <ProhibitIcon />
              </Button>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
