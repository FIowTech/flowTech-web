import { EmpresaField } from "./field";
import { ButtonCadastrar } from "./field";
import { ButtonProx } from "./field";
import { ButtonVoltar } from "./field";

export function EmpresaEtapa1() {
    return (
        <form className="space-y-4 mx-auto w-full max-w-md">
            <h1 className="relative top-1 font-black text-2xl">Registro de Empresas</h1>
            <p className="mb-10 text-sm text-slate-600">Cadastro de empresas parceiras.</p>


            <EmpresaField
                label="CNPJ"
                value="cnpj"
                type="text"
                placeholder="00.000.000/0000-00"
            />

            <EmpresaField
                label="Razão Social"
                value="razaosocial"
                type="text"
                placeholder="Ex.: Bobao Dog Ltda."
            />

            <EmpresaField
                label="Nome Fantasia"
                value="nomefantasia"
                type="text"
                placeholder="Ex.: Dogão do Bobão"
            />

            <EmpresaField
                label="E-mail"
                value="emailEmp"
                type="email"
                placeholder="email@exemplo.com"
            />
            <ButtonProx />
        </form>
    )
}

export function EmpresaEtapa2() {
    return (
        <form className="space-y-4 mx-auto w-full max-w-md">
            <h1 className="relative top-1 font-black text-2xl">Registro de Empresas</h1>
            <p className="mb-10 text-sm text-slate-600">Cadastro de empresas parceiras.</p>

            <EmpresaField
                label="Nome"
                value="nomeResp"
                type="text"
                placeholder="Ex.: João da Silva"
            />

            <EmpresaField
                label="Telefone"
                value="telefone"
                type="text"
                placeholder="(00) 0000-00000"
            />

            <EmpresaField
                label="E-mail"
                value="emailResp"
                type="email"
                placeholder="email@exemplo.com"
            />

            <EmpresaField
                label="Senha Provisória"
                value="senha"
                type="password"
                placeholder="••••••••"
            />

            <div className="flex justify-between">
                <ButtonVoltar />
                <ButtonProx />
            </div>
        </form>
    )
}

export function EmpresaEtapa3() {
    return (
        <form className="mx-auto w-full max-w-md">
            <h1 className="relative top-1 text-center font-black text-2xl">
                Cadastro de empresas
            </h1>

            <div className="mt-8 mb-5 flex items-center justify-center text-sm font-bold">
                <span className="flex items-center">
                    <span className="mr-1 text-lg">✓</span>
                    empresa
                </span>

                <span className="mx-2 h-px w-8 bg-black" />

                <span className="flex items-center">
                    <span className="mr-1 text-lg">✓</span>
                    responsável
                </span>

                <span className="mx-2 h-px w-8 bg-black" />

                <span className="text-lg">●</span>
                <span className="ml-1">revisão</span>
            </div>

            <div className="border border-black p-4">
                <div className="grid grid-cols-2 gap-y-1 text-sm">
                    <div className="font-semibold">Empresa</div>
                    <div className="font-semibold">Responsável</div>

                    <div className="mt-3">cnpj</div>
                    <div className="mt-3">nome</div>

                    <div>razão social</div>
                    <div>telefone</div>

                    <div>nome fantasia</div>
                    <div>email</div>

                    <div>email</div>
                    <div>senha provisória</div>
                </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
                <ButtonVoltar />
                <ButtonCadastrar />
            </div>
        </form>
    );
}