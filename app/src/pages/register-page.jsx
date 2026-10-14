import logoFlowtech from "@/assets/flow-icon-light.png";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/store/auth-store";
import { EyeClosedIcon, EyeIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

export default function RegisterPage() {
  const navigate = useNavigate();
  const cadastrar = useAuth((state) => state.cadastrar);
  const isPending = useAuth((state) => state.isPending);
  const isLoggedIn = useAuth((state) => state.isLoggedIn);

  const [credentials, setCredentials] = useState({
    codigoAcesso: "",
    nome: "",
    email: "",
    senha: "",
  });

  const [senhaVisible, setSenhaVisible] = useState(false);

  const handleCodigoChange = (value) =>
    setCredentials((prev) => ({ ...prev, codigoAcesso: value }));

  const handleNomeChange = (e) =>
    setCredentials((prev) => ({ ...prev, nome: e.target.value }));

  const handleEmailChange = (e) =>
    setCredentials((prev) => ({ ...prev, email: e.target.value }));

  const handleSenhaChange = (e) =>
    setCredentials((prev) => ({ ...prev, senha: e.target.value }));

  const isCodigoValid = credentials.codigoAcesso.length === 12;
  const isNomeValid = credentials.nome.trim().length >= 3;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(credentials.email);

  const senhaRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const isSenhaValid = senhaRegex.test(credentials.senha);

  const isFormValid =
    isCodigoValid && isNomeValid && isEmailValid && isSenhaValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid && isLoggedIn) return;

    const result = await cadastrar(credentials);

    if (!result.success) {
      toast.add({
        description: result.error,
        type: "error",
      });

      return;
    }

    toast.add({
      description: "Cadastro efetuado, redirecionando para Login",
      type: "success",
    });

    navigate({ pathname: "/login", replace: true });
  };

  const toggleSenhaVisible = () => setSenhaVisible((prev) => !prev);

  useEffect(() => {
    if (isLoggedIn) navigate("/", { replace: true });
  }, [isLoggedIn, navigate]);

  return (
    <div className="min-w-lg flex flex-col items-center space-y-12">
      <div className="flex items-center space-x-2">
        <img src={logoFlowtech} alt="FlowTech Logo" className="w-12" />
        <h2 className="text-4xl font-heading font-bold -ml-4 pt-2">lowTech</h2>
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        <Card className="bg-background">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Crie uma conta para entrar
            </CardTitle>
            <CardDescription>
              Providencie credenciais para acessar o Vision Center da sua
              Empresa. Você deve possuir um código de acesso fornecido por seu
              superior.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              {/* Campo - Código de Acesso */}
              <Field>
                <FieldLabel htmlFor="cadastro-codigo">
                  Código de Acesso
                </FieldLabel>
                <InputOTP
                  id="cadastro-codigo"
                  maxLength={12}
                  value={credentials.codigoAcesso}
                  onChange={handleCodigoChange}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                    <InputOTPSlot index={6} />
                    <InputOTPSlot index={7} />
                    <InputOTPSlot index={8} />
                    <InputOTPSlot index={9} />
                    <InputOTPSlot index={10} />
                    <InputOTPSlot index={11} />
                  </InputOTPGroup>
                </InputOTP>
              </Field>

              {/* Campo - Nome */}
              <Field>
                <FieldLabel htmlFor="cadastro-email">Nome Completo</FieldLabel>
                <Input
                  id="cadastro-nome"
                  type="text"
                  value={credentials.nome}
                  onChange={handleNomeChange}
                  required
                />
              </Field>

              {/* Campo - Email */}
              <Field>
                <FieldLabel htmlFor="cadastro-email">E-mail</FieldLabel>
                <Input
                  id="cadastro-email"
                  type="text"
                  value={credentials.email}
                  onChange={handleEmailChange}
                  required
                />
              </Field>

              {/* Campo - Senha */}
              <Field>
                <FieldLabel htmlFor="cadastro-senha">Senha</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="cadastro-senha"
                    type={senhaVisible ? "text" : "password"}
                    value={credentials.senha}
                    onChange={handleSenhaChange}
                    required
                  />
                  <InputGroupAddon align="block-right">
                    <InputGroupButton size="icon" onClick={toggleSenhaVisible}>
                      {senhaVisible ? <EyeClosedIcon /> : <EyeIcon />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter className="flex flex-col items-end space-y-2 bg-background-light">
            <Button
              type="submit"
              className="w-full"
              disabled={isPending || !isFormValid}
            >
              {isPending ? (
                <span className="flex items-center space-x-2">
                  <Spinner /> Registrando
                </span>
              ) : (
                "Registrar-se"
              )}
            </Button>
            <p className="flex flex-row gap-1 text-xs">
              Já possui uma conta?
              <Link to="/login" className="text-primary-hover underline">
                Entre aqui
              </Link>
            </p>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
