import { Kpi } from "../components/institucional/kpi";
import { MissaoCard } from "../components/institucional/missao-card";
import { Navbar } from "../components/institucional/navbar";
import { RecursoCard } from "../components/institucional/recurso-card";
import { Section } from "../components/institucional/section";

export default function LandingPage() {
  return (
    <>
      <Navbar />

      <main className="bg-paper text-ink">
        <section className="grid grid-cols-1 gap-12 px-6 py-16 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16 lg:px-16 lg:py-24">
          <div className="flex flex-col gap-6">
            <h1 className="max-w-xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              O trânsito não precisa ser um problema
            </h1>
            <p className="max-w-md text-lg leading-relaxed text-muted">
              Resumos detalhados do comportamento do trânsito e da saúde da sua
              infraestrutura, em tempo real — para você agir antes que vire
              imprevisto.
            </p>
            <a
              href="#nossa_missao"
              className="w-fit border-b-2 border-brand pb-1 text-base font-semibold text-ink transition hover:border-ink"
            >
              Saiba mais
            </a>
          </div>
          <div className="relative pb-16 sm:pb-20">
            <img
              src="/assets/portico-index.png"
              alt="Pórtico de pedágio free flow monitorado pelo FlowTech em rodovia de tráfego intenso"
              className="aspect-4/3 w-full rounded-sm border border-line object-cover"
            />
            <div className="absolute inset-x-4 -bottom-2 rounded-sm border border-line bg-white p-6 shadow-[0_1px_0_#DEDFD8] sm:inset-x-8">
              <div className="mb-5 flex items-center justify-between">
                <span className="text-sm font-semibold text-muted">
                  Central Rod. BR-101 · Km 42
                </span>
                <span className="flex items-center gap-2 text-xs font-semibold text-ink">
                  <span className="h-2 w-2 rounded-full bg-signal" />
                  ao vivo
                </span>
              </div>
              <div>
                <Kpi />
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
          className="flex flex-col items-center gap-8 px-6 py-16 text-center sm:px-10"
        >
          <h2 className="text-3xl font-bold sm:text-4xl">
            Análise completa, em um só lugar
          </h2>
          <p className="max-w-2xl text-lg sm:text-1xl">
            Dashboard de diagnóstico: observe cada um dos seus microcomputadores
            instalados em produção.
          </p>
          <img
            className="w-full max-w-4xl rounded-sm border border-gray-300"
            src="/assets/image.png"
            alt="Dashboard de diagnóstico do FlowTech"
          />
        </section>

        <Section
          id="recursos"
          className="flex flex-col items-center bg-gray-100 px-6 py-10 sm:px-10"
        >
          <RecursoCard />
        </Section>
      </main>

      <footer className="flex items-center justify-center bg-green-900 px-6 py-3">
        <span className="text-lg font-semibold text-white">
          2026 FlowTech. Todos os direitos reservados.
        </span>
      </footer>
    </>
  );
}
