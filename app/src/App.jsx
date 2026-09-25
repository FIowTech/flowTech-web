import { Navbar } from "./components/institucional/navbar";
import { Kpi } from "./components/institucional/kpi";
import { Section } from "./components/institucional/section";
import { MissaoCard } from "./components/institucional/missao-card";
import { RecursoCard } from "./components/institucional/recurso-card";

export default function App() {
  return (
    <>
      <Navbar />

      <main>
        <section
          className="relative isolate flex min-h-155 flex-col justify-center gap-8 bg-green-950 bg-cover bg-center px-6 py-16 sm:px-10 lg:min-h-170 lg:px-16 lg:py-20"
          style={{ backgroundImage: "url('/assets/portico-index.png')" }}
        >
          <div className="absolute inset-0 -z-10 bg-green-950/75"></div>
          <div className="flex w-full max-w-3xl flex-col justify-between gap-8 text-white">
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl xl:text-7xl">
              O trânsito não precisa ser um problema
            </h1>
            <p className="text-left text-lg leading-relaxed sm:text-xl lg:text-2xl">
              Com nossos serviços, o trânsito deixa de ser algo imprevisível e
              volátil. Você consegue ter acesso a resumos detalhados do
              comportamento do trânsito e se sua infraestrutura é adequada ao
              fluxo enfrentado.
            </p>
            <a
              href="#nossa_missao"
              className="max-w-fit rounded bg-emerald-800 px-5 py-3 transition duration-150 ease-in-out hover:bg-green-500"
            >
              SAIBA MAIS
            </a>
          </div>
        </section>

        {/* KPIs */}
        <section className="grid grid-cols-1 gap-4 px-6 py-8 sm:grid-cols-2 sm:gap-6 sm:px-10 lg:grid-cols-4 lg:gap-8">
          <Kpi titulo="CPU" porcentagem="30%" status="ATIVO" />
          <Kpi titulo="RAM" porcentagem="170MB" status="ATIVO" />
          <Kpi titulo="DISCO" porcentagem="3.1GB" status="ATIVO" />
          <Kpi titulo="REDE" porcentagem="389.4KB/s" status="ATIVO" />
        </section>

        {/* MISSÃO */}
        <Section
          id="nossa_missao"
          title="Nossa Missão"
          subtitle="Erradicar a fricção dos processos empresariais."
          description="Acreditamos que o controle deve ser um condutor invisível, permitindo que as equipes foquem na criação de valor enquanto o sistema gerencia a complexidade estrutural com precisão cirúrgica."
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            <MissaoCard
              icone={<img src="/assets/hardware.svg" alt="" className="h-10 w-10" />}
              titulo="Visibilidade de Hardware"
              texto="Captura contínua de métricas críticas de CPU, RAM, Disco e Rede. Acompanhe a saúde de cada máquina em tempo real e elimine gargalos de processamento."
            />
            <MissaoCard
              icone={<img src="/assets/alertas.svg" alt="" className="h-10 w-10" />}
              titulo="Coleta e Alertas Automáticos"
              texto="Automação na extração de dados do sistema sem carregar a máquina. Receba alertas antes que um pico de consumo derrube a sua central."
            />
            <MissaoCard
              icone={<img src="/assets/expansao.svg" alt="" className="h-10 w-10" />}
              titulo="Expansão Controlada"
              texto="Monitore de uma a centenas de máquinas simultaneamente. Adicione novas centrais ao FlowTech mantendo a estabilidade e o histórico de dados intactos."
            />
          </div>
        </Section>

        {/* PRODUTO */}
        <section id="produto" className="flex flex-col items-center gap-8 px-6 py-16 text-center sm:px-10">
          <h2 className="text-3xl font-bold sm:text-5xl">Análise completa, em um só lugar</h2>
          <p className="max-w-3xl text-lg sm:text-2xl">
            Dashboard de diagnóstico: observe cada um dos seus microcomputadores
            instalados em produção.
          </p>
          <img
            className="w-full max-w-4xl rounded-sm border border-gray-300"
            src="/assets/image.png"
            alt="Dashboard de diagnóstico do FlowTech"
          />
        </section>

        {/* RECURSOS */}
        <Section id="recursos" className="flex flex-col items-center bg-gray-100 px-6 py-10 sm:px-10">
          <h2 className="text-3xl font-bold sm:text-5xl">Recursos da Plataforma</h2>
          <div className="grid grid-cols-1 gap-4 py-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-8">
            <RecursoCard
              titulo="Segurança ponta a ponta"
              texto="Transmissão de dados criptografada e autenticação rigorosa em cada nó de monitoramento."
            />
            <RecursoCard
              titulo="Latência Ultra-baixa"
              texto="Sincronização em tempo real para tomada de decisões antes que anomalias afetem o fluxo."
            />
            <RecursoCard
              titulo="Relatórios Consolidados"
              texto="Exporte resumos analíticos periódicos de conformidade e uso de hardware facilmente."
            />
            <RecursoCard
              titulo="Integração Modular"
              texto="APIs flexíveis para conectar o FlowTech diretamente aos seus sistemas legados de rodovias."
            />
          </div>
        </Section>
      </main>

      {/* FOOTER */}
      <footer className="flex items-center justify-center bg-green-900 px-6 py-3">
        <span className="text-lg font-semibold text-white">
          2026 FlowTech. Todos os direitos reservados.
        </span>
      </footer>
    </>
  );
}
