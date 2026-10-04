import {
  EmpresaEtapa1,
  EmpresaEtapa2,
  EmpresaEtapa3,
} from "../components/empresa/form";
import { useEmpresaStore } from "../store/empresa-store";

export default function EmpresaPage() {
  const etapaAtual = useEmpresaStore((state) => state.etapa);

  return (
    <>
      <main className="flex min-h-screen bg-white items-center justify-center px-4 py-8">
        {etapaAtual === 1 && <EmpresaEtapa1 />}
        {etapaAtual === 2 && <EmpresaEtapa2 />}
        {etapaAtual === 3 && <EmpresaEtapa3  />}
      </main>
    </>
  );
}
