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

module.exports = {
  isUndefined,
  isNull,
  isMissing,
  isBlank,
  isEmailValid,
  isPasswordValid,
};
