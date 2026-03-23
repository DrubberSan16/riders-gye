export function resolveReferenceDate(value?: string): Date {
  if (!value) {
    return new Date();
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('La fecha límite no tiene un formato valido');
  }

  return parsed;
}
