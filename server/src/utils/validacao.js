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
  const { cep, logradouro, bairro, localidade, uf, numero, km, sentido } =
    endereco;
  let errors = [];

  if (isBlank(cep)) {
    errors.push("cep");
  }

  if (isMissing(numero)) {
    errors.push("numero");
  }

  if (isBlank(localidade)) {
    errors.push("localidade");
  }

  if (isBlank(uf)) {
    errors.push("uf");
  }

  if (isMissing(logradouro)) {
    errors.push("logradouro");
  }

  if (isMissing(bairro)) {
    errors.push("bairro");
  }

  if (tipo === "embarcado") {
    if (isBlank(km)) {
      errors.push("km");
    }
    if (isBlank(sentido)) {
      errors.push("sentido");
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
