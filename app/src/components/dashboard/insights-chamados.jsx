
import {
    Lightbulb,
    AlertTriangle,
    Users,
    ChartNoAxesCombined,
    CheckCircle,
} from "lucide-react";

export function InsightsChamados({ labels = [], valores = [] }) {
  const totalChamados = valores.reduce(
    (total, valor) => total + valor,
    0
  );

  const indiceNaoAtribuido = labels.findIndex(
    (nome) => nome.toLowerCase().includes("não atribuído")
  );

  const chamadosNaoAtribuidos =
    indiceNaoAtribuido !== -1
      ? valores[indiceNaoAtribuido]
      : 0;

  const chamadosAtribuidos = totalChamados - chamadosNaoAtribuidos;

  // Considera apenas integrantes com chamados atribuídos
  const integrantes = labels
    .map((nome, index) => ({
      nome,
      total: valores[index],
    }))
    .filter(
      (item) =>
        !item.nome.toLowerCase().includes("não atribuído")
    );

  // Ordena do menor para o maior número de chamados
  const integrantesOrdenados = [...integrantes].sort(
    (a, b) => a.total - b.total
  );

  const menorCarga = integrantesOrdenados[0];
  const maiorCarga =
    integrantesOrdenados[integrantesOrdenados.length - 1];

  // Identifica possível sobrecarga
  const possivelSobrecarga =
    integrantes.length >= 2 &&
    maiorCarga.total - menorCarga.total >= 2 &&
    maiorCarga.total >= menorCarga.total * 1.5;

  // Primeiro insight: distribuição de responsabilidades
  let primeiroInsight;

  if (possivelSobrecarga) {
    primeiroInsight = {
      titulo: `Possível sobrecarga: ${maiorCarga.nome}`,
      descricao: `${maiorCarga.nome} possui ${maiorCarga.total} chamados, enquanto ${menorCarga.nome} possui ${menorCarga.total}. Considere transferir chamados para ${menorCarga.nome}.`,
      icon: AlertTriangle,
      cor: "text-amber-500",
      fundo: "bg-amber-500/10",
    };
  } else if (integrantes.length < 2) {
    primeiroInsight = {
      titulo: "Dados insuficientes para comparação",
      descricao: "É necessário ter pelo menos dois integrantes com chamados atribuídos para avaliar a distribuição.",
      icon: Users,
      cor: "text-blue-500",
      fundo: "bg-blue-500/10",
    };
  } else {
    primeiroInsight = {
      titulo: "Distribuição equilibrada",
      descricao: "Não foi identificada uma diferença significativa na quantidade de chamados entre os integrantes.",
      icon: CheckCircle,
      cor: "text-green-500",
      fundo: "bg-green-500/10",
    };
  }

  const insights = [
    primeiroInsight,
    {
      titulo: `${chamadosNaoAtribuidos} chamados sem responsável`,
      descricao: totalChamados
        ? `${Math.round((chamadosNaoAtribuidos / totalChamados) * 100)}% dos chamados em aberto ainda não foram atribuídos.`
        : "Não existem chamados em aberto.",
      icon: AlertTriangle,
      cor: "text-amber-500",
      fundo: "bg-amber-500/10",
    },
    {
      titulo: `${chamadosAtribuidos} chamados atribuídos`,
      descricao: `${integrantes.length} integrante(s) possuem chamados sob sua responsabilidade.`,
      icon: ChartNoAxesCombined,
      cor: "text-blue-500",
      fundo: "bg-blue-500/10",
    },
  ];

  return (
    <div className="bg-background border border-border rounded-2xl p-4 h-93 mt-3">
      <div className="flex items-center gap-3 mb-8">
        <Lightbulb className="text-amber-500" size={22} />
        <h3 className="font-semibold text-base">
          Insights do Período
        </h3>
      </div>

      <div className="flex flex-col gap-10">
        {insights.map((insight, index) => {
          const Icon = insight.icon;

          return (
            <div key={index} className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${insight.fundo}`}
              >
                <Icon className={insight.cor} size={21} />
              </div>

              <div className="min-w-0">
                <p className="font-semibold text-sm">
                  {insight.titulo}
                </p>

                <p className="text-xs text-muted-foreground">
                  {insight.descricao}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
