function isUndefined(value) {
  return value === undefined;
}

function isNull(value) {
  return value === null;
}

function isMissing(value) {
  return isUndefined(value) || isNull(value);
}

function isBlank(value) {
  return isMissing(value) || String(value).trim().length === 0;
}

function isEmailValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isPasswordValid(password) {
  return /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[^\w\s]).{6,}$/.test(password);
}

// tipo = "embarcado" ou tipo = "empresa"
function enderecoErrors(endereco, tipo) {
  const {
    cep,
    logradouro,
    bairro,
    localidade,
    uf,
    numero,
    km,
    sentido,
    lat,
    lon,
  } = endereco;
  let errors = [];

  if (isBlank(cep)) {
    errors.push("cep");
  }

  if (isMissing(logradouro)) {
    errors.push("logradouro");
  }

  if (isMissing(bairro)) {
    errors.push("bairro");
  }

  if (isBlank(localidade)) {
    errors.push("localidade");
  }

  if (isBlank(uf)) {
    errors.push("uf");
  }

  if (isMissing(numero)) {
    errors.push("numero");
  }

  if (tipo === "embarcado") {
    if (isBlank(km)) {
      errors.push("km");
    }
    if (isBlank(sentido)) {
      errors.push("sentido");
    }

    if (isBlank(lat)) {
      errors.push("lat");
    }

    if (isBlank(lon)) {
      errors.push("lon");
    }
  }

  return errors;
}

module.exports = {
  isUndefined,
  isNull,
  isMissing,
  isBlank,
  isEmailValid,
  isPasswordValid,
  enderecoErrors,
};
