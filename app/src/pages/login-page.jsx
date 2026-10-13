import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/store/auth-store";
import { EyeClosedIcon, EyeIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

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

  const handleSubmit = async (e) => {
    e.preventDefault();

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
    <div className="w-full max-w-[380px]">
      <div className="mb-9 flex items-center gap-2 text-[16px] font-extrabold text-foreground">
        FlowTech
      </div>

      <div>
        <div className="mb-6">
          <h2 className="mb-1.5 text-[23px] font-extrabold tracking-tight text-foreground">
            Logue na sua conta
          </h2>

          <span className="block text-[13.5px] text-muted-foreground">
            Faça login para acompanhar a saúde dos seus pórticos Free Flow.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">E-mail:</Label>

            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={credentials.email}
              onChange={handleEmailChange}
              required
              className="w-full rounded-[9px] border-input bg-background text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="senha">Senha:</Label>

            <div className="relative">
              <Input
                id="senha"
                name="senha"
                type={senhaVisible ? "text" : "password"}
                autoComplete="current-password"
                value={credentials.senha}
                onChange={handleSenhaChange}
                required
                className="w-full rounded-[9px] border-input bg-background pr-11 text-foreground placeholder:text-muted-foreground"
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleSenhaVisible}
                className="absolute right-0 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                {senhaVisible ? <EyeClosedIcon /> : <EyeIcon />}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending || !credentials.email || !credentials.senha}
            className="mt-1.5 w-full rounded-[9px] bg-primary py-3.5 text-[13px] font-bold text-primary-foreground transition hover:bg-primary-hover active:translate-y-px"
          >
            {isPending ? (
              <span className="flex items-center space-x-2">
                <Spinner /> Entrando
              </span>
            ) : (
              "Entrar"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
