export const USD_TO_PKR = 280;

export function formatPKR(usdAmount) {
  if (usdAmount == null || usdAmount === '') return 'Rs. 0';
  const pkr = Math.round(Number(usdAmount) * USD_TO_PKR);
  return `Rs. ${pkr.toLocaleString()}`;
}

export function pkrToUsd(pkrAmount) {
  return pkrAmount / USD_TO_PKR;
}
