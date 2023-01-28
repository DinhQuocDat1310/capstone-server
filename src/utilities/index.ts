export function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function diffDates(begin: Date, end: Date) {
  const diffTime = Math.abs(end.getTime() - begin.getTime());
  const diffDays =
    begin.getTime() < end.getTime()
      ? Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      : Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
