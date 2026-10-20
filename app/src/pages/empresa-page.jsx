import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  EmpresaEtapa1,
  EmpresaEtapa2,
  EmpresaEtapa3,
} from "../components/empresa/form";
import { useEmpresaStore } from "../store/empresa-store";

export default function EmpresaPage() {
  const etapaAtual = useEmpresaStore((state) => state.etapa);

  return (
    <Card className="max-w-xl w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Registro de Empresas
        </CardTitle>
        <CardDescription>Cadastro de empresas parceiras.</CardDescription>
      </CardHeader>
      <CardContent>
        {etapaAtual === 1 && <EmpresaEtapa1 />}
        {etapaAtual === 2 && <EmpresaEtapa2 />}
        {etapaAtual === 3 && <EmpresaEtapa3 />}
      </CardContent>
    </Card>
  );
}
