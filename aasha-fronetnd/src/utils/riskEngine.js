// simple risk calculation based on structured data
export function calculateRisk({ pregnancyMonth, feverDays, highBP, swelling }) {
  // high risk conditions
  if (
    (pregnancyMonth >= 7 && highBP) ||
    (feverDays >= 3 && highBP) ||
    (swelling && highBP)
  ) {
    return 'High';
  }

  // medium risk conditions
  if (feverDays >= 2 || (pregnancyMonth >= 5 && swelling)) {
    return 'Medium';
  }

  return 'Normal';
}

export default calculateRisk;
