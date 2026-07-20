export function getErrorMessage(error: unknown, fallback: string = "Ocurrió un error inesperado.") {
  return error instanceof Error ? error.message : fallback;
}
