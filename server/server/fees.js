export function dhakaDate(now = new Date()) {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Dhaka" }).format(now);
}

export function feeDeadline(record) {
  const month = record.date;
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return "";
  const explicit = record.dueDate;
  if (typeof explicit === "string" && /^\d{4}-\d{2}-\d{2}$/.test(explicit)) {
    const date = new Date(explicit);
    if (Number.isFinite(+date) && date.toISOString().slice(0, 10) === explicit) return explicit;
  }
  const end = new Date(month + "-01T00:00:00Z");
  end.setUTCMonth(end.getUTCMonth() + 1, 0);
  return end.toISOString().slice(0, 10);
}

export function overdueFees(records, today = dhakaDate()) {
  return records
    .filter(record => record.state === "due" && Number(record.amount) > 0)
    .map(record => ({ month: record.date, amount: Number(record.amount), deadline: feeDeadline(record) }))
    .filter(record => record.deadline && record.deadline < today)
    .sort((a, b) => a.month.localeCompare(b.month));
}
