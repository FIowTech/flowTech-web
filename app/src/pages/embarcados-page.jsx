import { EmbarcadosList } from "@/components/embarcados/embarcados-list";
import { Relogio } from "@/components/relogio";
import { useAuth } from "@/store/auth-store";

// Variáveis mockadas e temporárias
const tempEmpresaRazaoSocial = "%Razao_Social%";
const tempEmbarcados = [];

export default function EmbarcadosPage() {
  const usuario = useAuth((state) => state.usuario);

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Topbar */}
      <div className="bg-background border border-border p-4 rounded-md w-full flex items-center justify-between">
        <div>
          <p>Embarcados de</p>
          <h2 className="text-xl">{tempEmpresaRazaoSocial}</h2>
        </div>

        <Relogio />
      </div>

      {/* Lista de Embarcados */}
      <EmbarcadosList embarcados={tempEmbarcados} />
    </div>
  );
}
