import { EmpresaField } from "./field";
import { Button2 } from "./field";
import { Button } from "./field";

export function EmpresaForm() {
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
                value="email"
                type="email"
                placeholder="email@exemplo.com"
            />

            <EmpresaField
                label="Senha Provisória"
                value="senha"
                type="password"
                placeholder="••••••••"
            />

            <Button/>
        </form>
    )
}

export function EmpresaForm2() {
        return (
        <form className="space-y-4 mx-auto w-full max-w-md bg-gray-100 p-10 rounded-[9px]">
            <p className="mb-10 mt-2 text-sm text-center text-slate-600 text-[18px]">Preencha as informações da empresa</p>


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
                value="email"
                type="email"
                placeholder="email@exemplo.com"
            />

            <EmpresaField
                label="Senha Provisória"
                value="senha"
                type="password"
                placeholder="••••••••"
            />

            <Button2/>
        </form>
    )
}
