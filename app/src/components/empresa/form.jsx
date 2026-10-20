import { useEmpresaStore } from "../../store/empresa-store";
import {
  ButtonCadastrar,
  ButtonProx,
  ButtonVoltar,
  EmpresaField,
  RevisaoField,
} from "./field";

export function EmpresaEtapa1() {
  const {
    campos,
    changeCnpj,
    changeRazaoSocial,
    changeNomeFantasia,
    changeEmailEmp,
  } = useEmpresaStore();

  return (
    <form className="space-y-4 mx-auto w-full max-w-md">
      <EmpresaField
        label="CNPJ"
        value={campos.cnpj}
        onChange={(e) => changeCnpj(e.target.value)}
        type="text"
      />

      <EmpresaField
        label="Razão Social"
        value={campos.razaoSocial}
        onChange={(e) => changeRazaoSocial(e.target.value)}
        type="text"
      />

      <EmpresaField
        label="Nome Fantasia"
        value={campos.nomeFantasia}
        onChange={(e) => changeNomeFantasia(e.target.value)}
        type="text"
      />

      <EmpresaField
        label="E-mail"
        value={campos.emailEmp}
        onChange={(e) => changeEmailEmp(e.target.value)}
        type="email"
      />
      <ButtonProx />
    </form>
  );
}

export function EmpresaEtapa2() {
  const { campos, changeNome, changeEmailResp, changeSenha } =
    useEmpresaStore();

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mx-auto w-full max-w-md">
      <EmpresaField
        label="Nome"
        value={campos.nome}
        onChange={(e) => changeNome(e.target.value)}
        type="text"
      />

      <EmpresaField
        label="E-mail"
        value={campos.emailResp}
        onChange={(e) => changeEmailResp(e.target.value)}
        type="email"
      />

      <EmpresaField
        label="Senha"
        value={campos.senha}
        onChange={(e) => changeSenha(e.target.value)}
        type="password"
      />

      <div className="flex justify-between">
        <ButtonVoltar />
        <ButtonProx />
      </div>
    </form>
  );
}

export function EmpresaEtapa3() {
  const campos = useEmpresaStore((state) => state.campos);

  return (
    <form className="space-y-4 mx-auto w-full max-w-md">
      <div className="grid grid-cols-2 gap-5">
        <div>
          <div className="space-y-3">
            <RevisaoField label="CNPJ" text={campos.cnpj} />
            <RevisaoField label="Razão Social" text={campos.razaoSocial} />
            <RevisaoField label="Nome Fantasia" text={campos.nomeFantasia} />
            <RevisaoField label="E-mail" text={campos.emailEmp} />
          </div>
        </div>

        <div>
          <div className="space-y-3">
            <RevisaoField label="Nome" text={campos.nome} />
            <RevisaoField label="E-mail" text={campos.emailResp} />
            <RevisaoField label="Senha" text={campos.senha} />
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
