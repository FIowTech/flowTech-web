import { EmpresaField } from "./field";
import { RevisaoField } from "./field";
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
        <form className="space-y-4 mx-auto w-full max-w-md">
            <h1 className="relative top-1 font-black text-2xl">Registro de Empresas</h1>
            <p className="mb-10 text-sm text-slate-600">Cadastro de empresas parceiras.</p>

            <div className="grid grid-cols-2 gap-5">
                <div>

                    <div className="space-y-3">

                        <RevisaoField
                        label="CNPJ"
                        value=""
                        text=""
                        />

                        <RevisaoField
                        label="Razão Social"
                        value=""
                        text=""
                        />

                        <RevisaoField
                        label="Nome Fantasia"
                        value=""
                        text=""
                        />

                        <RevisaoField
                        label="E-mail"
                        value=""
                        text=""
                        />
                    </div>
                </div>

                <div>

                    <div className="space-y-3">

                        <RevisaoField
                        label="Nome"
                        value=""
                        text=""
                        />

                        <RevisaoField
                        label="Telefone"
                        value=""
                        text=""
                        />

                        <RevisaoField
                        label="E-mail"
                        value=""
                        text=""
                        />

                        <RevisaoField
                        label="Senha"
                        value=""
                        text=""
                        />
                    </div>
                </div>
            </div>

            <div className="mt-5 flex justify-between">
                <ButtonVoltar />
                <ButtonCadastrar />
            </div>
        </form>
    );
}