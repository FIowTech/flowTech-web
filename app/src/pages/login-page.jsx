import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/store/auth-store";
import { ArrowLeftIcon, EyeClosedIcon, EyeIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Link } from "react-router";

export default function LoginPage() {
  const login = useAuth((state) => state.login);
  const [credentials, setCredentials] = useState({
    email: "",
    senha: "",
  });
  const [senhaVisible, setSenhaVisible] = useState(false);

  const handleEmailChange = (e) =>
    setCredentials((prev) => ({ ...prev, email: e.target.value }));

  const handleSenhaChange = (e) =>
    setCredentials((prev) => ({ ...prev, senha: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    login(credentials);
  };

  const toggleSenhaVisible = () => setSenhaVisible((prev) => !prev);

  const benefitCardContents = [
    {
      title: "Pórticos monitorados",
      number: "70",
      description: "distribuídos em 12 rodovias",
    },
    {
      title: "Falhas evitadas",
      number: "18",
      description: "neste mês, via alertas antecipados",
    },
    {
      title: "Disponibilidade",
      number: "99,8%",
      description: "uptime garantido da rede",
    },
    {
      title: "Tempo de respostas",
      number: "4 min",
      description: "tempo médio até o alerta",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <div className="relative flex flex-1 flex-col overflow-hidden bg-sidebar px-6 py-10 sm:px-10 lg:flex-[1.3] lg:px-14 lg:py-12">
          <Link
            to="/"
            className="relative z-10 inline-flex w-fit items-center gap-2 self-start rounded-full border border-sidebar-foreground/20 bg-sidebar-foreground/5 px-4 py-2 text-sm font-semibold text-sidebar-foreground backdrop-blur-sm transition hover:bg-sidebar-foreground/10"
          >
            <ArrowLeftIcon />
            <span>Voltar</span>
          </Link>

          <div className="relative z-10 mt-10 max-w-md lg:mt-0">
            <h1 className="mb-4 text-3xl font-extrabold leading-tight tracking-tight text-sidebar-foreground sm:text-4xl">
              O monitoramento dos seus pórticos, sob controle total.
            </h1>

            <span className="block text-[15px] leading-relaxed text-sidebar-foreground/70">
              Acesse a central do mantenedor e acompanhe a saúde de cada pórtico
              Free Flow em tempo real, com alertas antes que a operação seja
              afetada.
            </span>
          </div>

          <div className="relative z-10 mt-10 grid grid-cols-2 gap-3 lg:mt-auto">
            {benefitCardContents.map((item) => (
              <BenefitCard
                key={item.title}
                title={item.title}
                number={item.number}
                description={item.description}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center bg-background px-6 py-12 sm:px-8 lg:py-10">
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
                  Faça login para acompanhar a saúde dos seus pórticos Free
                  Flow.
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
                  className="mt-1.5 w-full rounded-[9px] bg-primary py-3.5 text-[13px] font-bold uppercase tracking-wide text-primary-foreground transition hover:bg-primary-hover active:translate-y-px"
                >
                  <span>Entrar</span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BenefitCard({ title, number, description }) {
  return (
    <div className="rounded-xl border border-sidebar-border bg-sidebar-accent px-4 py-3.5">
      <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-sidebar-foreground/70">
        {title}
      </div>

      <div className="text-xl leading-none text-sidebar-foreground">
        {number}
      </div>

      <div className="mt-1.5 text-[11px] text-sidebar-foreground/70">
        {description}
      </div>
    </div>
  );
}
