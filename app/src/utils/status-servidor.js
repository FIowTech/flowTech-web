export function pegarStatusServidor(servidor) {
  const status = servidor.status;

  if (status === "critico") return "critico";
  if (status === "alerta") return "alerta";
  if (status === "sem_dados" || status == null) return "sem_dados";

  return "controlado";
}