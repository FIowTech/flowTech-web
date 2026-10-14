import dashboardPreviewImg from "@/assets/image.png";
import heroImg from "@/assets/portico-index.png";
import { MetricasCard } from "../components/institucional/metricas-card";
import { MissaoCard } from "../components/institucional/missao-card";
import { Navbar } from "../components/institucional/navbar";
import { RecursoCard } from "../components/institucional/recurso-card";
import { Section } from "../components/institucional/section";

export default function LandingPage() {
  return (
    <>
      <Navbar />

      <main className="bg-background text-foreground">
        <section className="grid grid-cols-1 gap-12 px-6 py-16 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16 lg:px-16 lg:py-24">
          <div className="flex flex-col gap-6">
            <h1 className="max-w-xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              O trânsito não precisa ser um problema
            </h1>

            <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
              Resumos detalhados do comportamento do trânsito e da saúde da sua
              infraestrutura, em tempo real — para você agir antes que vire
              imprevisto.
            </p>

            <a
              href="#nossa_missao"
              className="w-fit border-b-2 border-primary pb-1 text-base font-semibold text-foreground transition hover:border-primary-hover hover:text-primary"
            >
              Saiba mais
            </a>
          </div>

          <div className="relative pb-16 sm:pb-20">
            <img
              src={heroImg}
              alt="Pórtico de pedágio free flow monitorado pelo FlowTech em rodovia de tráfego intenso"
              className="aspect-4/3 w-full rounded-sm border border-border object-cover"
            />

            <div className="absolute inset-x-4 -bottom-2 rounded-sm border border-border bg-card p-6 shadow-sm sm:inset-x-8">
              <div className="mb-5 flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground">
                  Central Rod. BR-101 · Km 42
                </span>

                <span className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  ao vivo
                </span>
              </div>

              <div>
                <MetricasCard />
              </div>
            </div>
          </div>
        </section>

        {/* MISSÃO */}
        <Section
          id="nossa_missao"
          title="Nossa Missão"
          subtitle="Erradicar a fricção dos processos empresariais."
          description="Acreditamos que o controle deve ser um condutor invisível, permitindo que as equipes foquem na criação de valor enquanto o sistema gerencia a complexidade estrutural com precisão cirúrgica."
        >
          <div>
            <MissaoCard />
          </div>
        </Section>

        <section
          id="nossa_solucao"
          className="flex flex-col items-center gap-8 bg-background px-6 py-16 text-center text-foreground sm:px-10"
        >
          <h2 className="text-3xl font-bold sm:text-4xl">
            Análise completa, em um só lugar
          </h2>

          <p className="max-w-2xl text-lg">
            Dashboard de diagnóstico: observe cada um dos seus microcomputadores
            instalados em produção.
          </p>

          <img
            className="w-full max-w-4xl rounded-sm border border-border"
            src={dashboardPreviewImg}
            alt="Dashboard de diagnóstico do FlowTech"
          />
        </section>

        <Section
          id="recursos"
          className="flex flex-col items-center bg-muted px-6 py-10 text-foreground sm:px-10"
        >
          <RecursoCard />
        </Section>
      </main>

      <footer className="flex items-center justify-center border-t border-border bg-sidebar px-6 py-3 text-sidebar-foreground">
        <span className="text-lg font-semibold">
          2026 FlowTech. Todos os direitos reservados.
        </span>
      </footer>
    </>
  );
}
