export function pegarStatusServidor(servidor) {
  // Prioriza a propriedade já normalizada pelo hook (status_front)
  if (servidor?.status_front) return servidor.status_front;

  const status = servidor?.status;

  // Se backend usar convensão numérica: 0 = critico, 1 = normal, 2 = alerta
  if (typeof status === "number") {
    if (status === 0) return "critico";
    if (status === 1) return "controlado";
    if (status === 2) return "alerta";
  }

  // Texto já em formato antigo
  if (status === "critico") return "critico";
  if (status === "alerta") return "alerta";
  if (status === "sem_dados" || status == null) return "sem_dados";

  return "controlado";
}
