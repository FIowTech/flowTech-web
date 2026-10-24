import { CodigosList } from "@/components/equipe/codigos-list";
import { MembroCreateForm } from "@/components/equipe/forms/equipe-convite";
import { MembrosList } from "@/components/equipe/membros-list";
import { Relogio } from "@/components/relogio";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LABELS_NIVEIS_ACESSO } from "@/constants/labels-niveis-acesso";
import { useFetchCodigos } from "@/hooks/useFetchCodigos";
import { useFetchEmpresa } from "@/hooks/useFetchEmpresa";
import { useFetchUsuarios } from "@/hooks/useFetchUsuarios";
import { useAuth } from "@/store/auth-store";
import { SignOutIcon } from "@phosphor-icons/react";

export default function EquipePage() {
  const usuario = useAuth((state) => state.usuario);
  const cargo = LABELS_NIVEIS_ACESSO[usuario.nivel_acesso ?? 2];

  const { codigos, isLoadingCodigo } = useFetchCodigos();
  const { usuarios, isLoadingUsuarios } = useFetchUsuarios();
  const { empresa, isLoadingEmpresa } = useFetchEmpresa();

  return (
    <div className="w-full flex flex-col space-y-6">
      <Card className="bg-background flex-row items-center justify-between px-4">
        <div>
          <h2 className="block text-xs text-muted-foreground">Logado como</h2>
          <h1 className="font-heading text-xl font-semibold">
            <span className="text-primary-hover">
              {usuario?.nome} • {cargo}
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
        <div className="bg-background p-4 flex flex-col space-y-6 rounded-md border-2 border-border">
          <div className="w-full flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">
              Membros de{" "}
              <span className="text-primary-hover font-heading font-semibold">
                {empresa && empresa.razao_social}
              </span>
            </h2>

            <MembroCreateForm />
          </div>
          {isLoadingUsuarios || isLoadingEmpresa ? (
            <p className="text-sm text-muted-foreground">
              Carregando membros...
            </p>
          ) : (
            <MembrosList membros={usuarios} empresa={empresa} />
          )}
        </div>

        <div className="bg-background p-4 flex flex-col space-y-6 rounded-md border-2 border-border">
          <h2 className="text-center text-xl font-semibold">
            Convites Criados
          </h2>
          {isLoadingCodigo ? (
            <p className="text-sm text-muted-foreground">
              Carregando códigos...
            </p>
          ) : (
            <CodigosList codigos={codigos} />
          )}
        </div>
      </div>
    </div>
  );
}
