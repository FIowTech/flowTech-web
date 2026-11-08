// status de cada servidor na tela do mapa: "controlado", "alerta" ou "critico".

const tempServidoresCriticos = [
  "00:93:37:45:D2:B5",
  "5C:CD:5B:E5:3D:E1",
  "DC:1B:A1:FE:BB:04",
];
const tempServidoresAlerta = [
  "24:B2:B9:31:31:E5",
  "50:FE:0C:25:F4:8D",
  // "8C:B0:E9:BC:12:F3",
];

export function pegarStatusServidor(servidor) {
  if (tempServidoresCriticos.includes(servidor.endereco_mac)) return "critico";
  if (tempServidoresAlerta.includes(servidor.endereco_mac)) return "alerta";

  return "controlado";
}