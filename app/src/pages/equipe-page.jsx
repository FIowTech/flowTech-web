import { Relogio } from "@/components/relogio";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    PencilSimpleIcon,
    PlusIcon,
    ProhibitIcon,
    SignOutIcon,
} from "@phosphor-icons/react";

const tempEmpresaRazaoSocial = "Vias do Brasil S.A.";
const tempUsuarioLogado = { nome: "Kevin Augusto", cargo: "Supervisor" };
const membros = [
  {
    nome: "Kevin Augusto",
    iniciais: "KA",
    cargo: "Supervisor",
    email: "kevin.augusto595@gmail.com",
    atual: true,
  },
  {
    nome: "Vitória Nogueira",
    iniciais: "VN",
    cargo: "Analista",
    email: "vivinogueira@gmail.com",
    atual: false,
  },
  {
    nome: "Marcio Eduardo",
    iniciais: "ME",
    cargo: "Técnico",
    email: "marcio.eduardo@gmail.com",
    atual: false,
  },
  {
    nome: "Jorge Paulo",
    iniciais: "JP",
    cargo: "Supervisor",
    email: "jppaulo@gmail.com",
    atual: false,
  },
];

export default function EquipePage() {
  return (
    <div className="w-full flex flex-col space-y-6">
      <Card className="bg-background flex-row items-center justify-between px-4">
        <div>
          <h2 className="block text-xs text-muted-foreground">Logado como</h2>
          <h1 className="font-heading text-xl font-semibold">
            {tempUsuarioLogado.nome}
            <span className="text-primary-hover">
              {" "}
              • {tempUsuarioLogado.cargo}
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
        <div className="bg-background p-4 flex flex-col space-y-6 rounded-md border-2 border-border">
          <div className="w-full flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">
              Membros de{" "}
              <span className="text-primary-hover font-heading font-semibold">
                {tempEmpresaRazaoSocial}
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
            {membros.map((membro) => (
              <article
                key={membro.email}
                className="flex items-center gap-3 rounded-md border-2 border-border bg-background p-3 "
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-border bg-muted text-sm font-semibold text-primary-hover">
                  {membro.iniciais}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-medium">{membro.nome}</h3>
                  <p className="mt-1 wrap-break-word text-sm text-muted-foreground">
                    {membro.cargo} • {membro.email}
                  </p>
                </div>

                {!membro.atual && (
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
                  Kevin Augusto
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
