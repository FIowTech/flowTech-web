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
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/store/auth-store";
import { EyeClosedIcon, EyeIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuth((state) => state.login);
  const isPending = useAuth((state) => state.isPending);
  const isLoggedIn = useAuth((state) => state.isLoggedIn);

  const [credentials, setCredentials] = useState({
    email: "",
    senha: "",
  });

  const [senhaVisible, setSenhaVisible] = useState(false);

  const handleEmailChange = (e) =>
    setCredentials((prev) => ({ ...prev, email: e.target.value }));

  const handleSenhaChange = (e) =>
    setCredentials((prev) => ({ ...prev, senha: e.target.value }));

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(credentials.email);

  const senhaRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#.])[A-Za-z\d@$!%*?&#.]{8,}$/;
  const isSenhaValid = senhaRegex.test(credentials.senha);

  const isFormValid = isEmailValid && isSenhaValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || isLoggedIn) return;

    const result = await login(credentials);

    if (!result.success) {
      toast.add({
        description: result.error,
        type: "error",
      });

      return;
    }

    toast.add({
      description: "Login efetuado, redirecionando...",
      type: "success",
    });

    navigate({ pathname: result.redirectTo, replace: true });
  };

  const toggleSenhaVisible = () => setSenhaVisible((prev) => !prev);

  useEffect(() => {
    if (isLoggedIn) navigate("/", { replace: true });
  });

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
              Seja bem-vindo de volta!
            </CardTitle>
            <CardDescription>
              Insira suas credenciais para acessar o Vision Center da sua
              Empresa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              {/* Campo - Email */}
              <Field>
                <FieldLabel htmlFor="login-email">E-mail</FieldLabel>
                <Input
                  id="login-email"
                  type="text"
                  value={credentials.email}
                  onChange={handleEmailChange}
                  required
                />
              </Field>

              {/* Campo - Senha */}
              <Field>
                <FieldLabel htmlFor="login-senha">Senha</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="login-senha"
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
                  <Spinner /> Entrando
                </span>
              ) : (
                "Entrar"
              )}
            </Button>
            <p className="flex flex-row gap-1 text-xs">
              Ainda não tem uma conta?
              <Link to="/cadastrar" className="text-primary-hover underline">
                Registre-se aqui
              </Link>
            </p>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
