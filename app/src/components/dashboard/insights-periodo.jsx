import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  CircleCheck,
  Info,
} from "lucide-react";

// ==========================================
// MINI GRÁFICO DE TENDÊNCIA
// ==========================================

function MiniGrafico({ valores, cor }) {
  if (!valores || valores.length < 2) {
    return null;
  }

  const largura = 100;
  const altura = 40;
  const minimo = Math.min(...valores);
  const maximo = Math.max(...valores);
  const diferenca = maximo - minimo || 1;

  const pontos = valores.map((valor, index) => {
    const x = (index / (valores.length - 1)) * largura;
    const y = altura - ((valor - minimo) / diferenca) * (altura - 8) - 4;

    return `${x},${y}`;
  });

  const caminho = `M ${pontos.join(" L ")}`;
  const area = `${caminho} L ${largura},${altura} L 0,${altura} Z`;

  return (
    <svg
      viewBox={`0 0 ${largura} ${altura}`}
      className="w-24 h-10 shrink-0"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient
          id={`gradiente-${cor.replace("#", "")}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={cor} stopOpacity="0.25" />
          <stop offset="100%" stopColor={cor} stopOpacity="0.02" />
        </linearGradient>
      </defs>

      <path
        d={area}
        fill={`url(#gradiente-${cor.replace("#", "")})`}
      />

      <path
        d={caminho}
        fill="none"
        stroke={cor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export function InsightsPeriodo({
  totalAlertas = 0,
  periodo = "atual",
  variacaoPercentual = null,
  servidoresSemAlertas = null,
  totalServidores = null,
  tendenciaAlertas = [],
  tendenciaServidores = [],
  tendenciaMedia = [],
}) {
  // ==========================================
  // CALCULAR MÉDIA DE ALERTAS POR DIA
  // ==========================================

  const diasPeriodo = {
    atual: 1,
    "7d": 7,
    "15d": 15,
    "30d": 30,
  };

  const quantidadeDias = diasPeriodo[periodo] || 1;

  const mediaAlertasDia = totalAlertas / quantidadeDias;

  // ==========================================
  // CONFIGURAR VARIAÇÃO
  // ==========================================

  const possuiComparacao = variacaoPercentual !== null;

  const aumentou = possuiComparacao && variacaoPercentual > 0;
  const diminuiu = possuiComparacao && variacaoPercentual < 0;

  const corVariacao = aumentou
    ? "#EF4444"
    : diminuiu
      ? "#16A34A"
      : "#6B7280";

  const IconeVariacao = diminuiu
    ? TrendingDown
    : TrendingUp;

  const textoVariacao = possuiComparacao
    ? `${aumentou ? "Aumento" : diminuiu ? "Redução" : "Variação de"} de ${Math.abs(
        variacaoPercentual
      ).toFixed(1)}%`
    : "Sem comparação";

  // ==========================================
  // RENDERIZAÇÃO
  // ==========================================

  return (
    <div className="bg-background border border-border rounded-2xl p-4 h-full"> 
      {/* TÍTULO */}
      <div className="flex items-center gap-2 mb-5">
        <Lightbulb
          size={22}
          className="text-amber-500"
        />

        <h3 className="text-base font-semibold">
          Insights do Período
        </h3>
      </div>

      {/* LISTA DE INSIGHTS */}
      <div className="flex flex-col gap-10 mt-10">

        {/* ================================== */}
        {/* INSIGHT 1 - VARIAÇÃO DE ALERTAS */}
        {/* ================================== */}

        <div className="flex items-center gap-3">

          {/* ÍCONE */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
            style={{
              backgroundColor: `${corVariacao}15`,
            }}
          >
            <IconeVariacao
              size={22}
              style={{ color: corVariacao }}
            />
          </div>

          {/* TEXTO */}
          <div className="flex-1 min-w-0">

            <p
              className="font-semibold text-sm"
              style={{ color: corVariacao }}
            >
              {textoVariacao}
            </p>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {possuiComparacao
                ? "no número de alertas em relação ao período anterior"
                : "dados insuficientes para comparar com o período anterior"}
            </p>

          </div>

          {/* GRÁFICO */}
          <MiniGrafico
            valores={tendenciaAlertas}
            cor={corVariacao}
          />

        </div>

        {/* ================================== */}
        {/* INSIGHT 2 - SERVIDORES SEM ALERTAS */}
        {/* ================================== */}

        <div className="flex items-center gap-3">

          {/* ÍCONE */}
          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
            <CircleCheck
              size={22}
              className="text-green-500"
            />
          </div>

          {/* TEXTO */}
          <div className="flex-1 min-w-0">

            <p className="font-semibold text-sm text-green-600 dark:text-green-400">
              {servidoresSemAlertas !== null
                ? `${servidoresSemAlertas} ${
                    servidoresSemAlertas === 1
                      ? "servidor"
                      : "servidores"
                  }`
                : "— servidores"}
            </p>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {servidoresSemAlertas !== null
                ? "estão operando sem alertas"
                : "aguardando dados dos servidores"}
            </p>

          </div>

          {/* GRÁFICO */}
          <MiniGrafico
            valores={tendenciaServidores}
            cor="#10B981"
          />

        </div>

        {/* ================================== */}
        {/* INSIGHT 3 - MÉDIA DIÁRIA */}
        {/* ================================== */}

        <div className="flex items-center gap-3">

          {/* ÍCONE */}
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
            <Info
              size={22}
              className="text-blue-500"
            />
          </div>

          {/* TEXTO */}
          <div className="flex-1 min-w-0">

            <p className="font-semibold text-sm text-foreground">
              Média de{" "}
              <span className="text-blue-500">
                {mediaAlertasDia.toLocaleString("pt-BR", {
                  maximumFractionDigits: 1,
                })}
              </span>{" "}
              alertas/dia
            </p>

            <p className="text-xs text-muted-foreground leading-relaxed">
              no período selecionado
            </p>

          </div>

          {/* GRÁFICO */}
          <MiniGrafico
            valores={tendenciaMedia}
            cor="#3B82F6"
          />

        </div>

      </div>
    </div>
  );
}