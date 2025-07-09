
// Formatear el tiempo restante de manera legible
export function formatRemainingTime(seconds) {
    const secondsNumber = Number(seconds); // Convertir BigInt a Number

    const days = Math.floor(secondsNumber / 86400);
    const hours = Math.floor((secondsNumber % 86400) / 3600);
    const minutes = Math.floor((secondsNumber % 3600) / 60);
    const remainingSeconds = secondsNumber % 60;

    return `${days}d ${hours}h ${minutes}m ${remainingSeconds}s`;
}

export function commify(value, decimals = 4) {
  if (value == null || value === "") return "0";

  // Convertir a número
  const num = Number(value);
  if (isNaN(num)) return "0";

  // Decidir si aplicamos decimales
  const applyDecimals = Number.isInteger(decimals) && decimals > 0;

  // Obtener cadena fija o entero truncado
  let numStr = applyDecimals
    ? num.toFixed(decimals)
    : Math.trunc(num).toString();

  // Separar parte entera y decimal
  let [integerPart, decimalPart] = numStr.split(".");

  // Detectar negativo
  const isNegative = integerPart.startsWith("-");
  if (isNegative) integerPart = integerPart.slice(1);

  // Poner comas cada 3 dígitos en la parte entera
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Reconstruir resultado
  let result = (isNegative ? "-" : "") + integerPart;
  if (applyDecimals && decimalPart) {
    result += "." + decimalPart;
  }

  return result;
}

export function sqrtPriceX96ToPrice(sqrtPriceX96) {
  const Q96 = 2n ** 96n;
  const sqrtP = Number(sqrtPriceX96 * 1_000_000_000_000_000_000n / Q96) / 1e18;
  const price = sqrtP * sqrtP;
  return price;
}
