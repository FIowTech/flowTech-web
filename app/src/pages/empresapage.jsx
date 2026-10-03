import { EmpresaEtapa1 } from "../components/empresa/form";
import { EmpresaEtapa2} from "../components/empresa/form";
import { EmpresaEtapa3} from "../components/empresa/form";

export default function EmpresaPage() {
    return (
        <>
            <main className="flex min-h-screen bg-white items-center justify-center px-4 py-8">
                <EmpresaEtapa2 />
            </main>
        </>
    )
}