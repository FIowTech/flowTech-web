export function mascaraCep(cep) {
  const cepFormatado = cep.replace(/\D/g, "");
  if (cepFormatado.length > 5) {
    return `${cepFormatado.slice(0, 5)}-${cepFormatado.slice(5)}`;
  }
  return cepFormatado;
}

export function mascaraEnderecoMac(enderecoMac) {
  let macFormatado = String(enderecoMac).replaceAll(":", "");
  let macArr = [];

  if (macFormatado.length > 2) {
    for (let i = 0; i < macFormatado.length; i += 2) {
      macArr.push(macFormatado.slice(i, i + 2));
    }

    return macArr.join(":").slice(0, 17);
  }

  return macFormatado;
}
