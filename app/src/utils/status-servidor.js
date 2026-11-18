export function pegarStatusServidor(servidor) {
  if (servidor.status === 0) return "critico";
  if (servidor.status === 2) return "alerta";
  return "controlado";
}