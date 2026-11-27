/**
 * Guardado en el dispositivo (localStorage). Nunca rompe el juego:
 * si el navegador bloquea el almacenamiento, se sigue jugando sin guardar.
 */
const PREFIJO = 'under:';

export const LARGO_MAXIMO_NOMBRE = 16;

export function leerJSON<T>(clave: string): T | null {
  const texto = leer(clave);
  if (!texto) return null;
  try {
    return JSON.parse(texto) as T;
  } catch {
    return null;
  }
}

export function escribirJSON(clave: string, valor: unknown): void {
  escribir(clave, JSON.stringify(valor));
}

export function borrar(clave: string): void {
  try {
    localStorage.removeItem(PREFIJO + clave);
  } catch {
    // Se ignora.
  }
}

function leer(clave: string): string | null {
  try {
    return localStorage.getItem(PREFIJO + clave);
  } catch {
    return null;
  }
}

function escribir(clave: string, valor: string): void {
  try {
    localStorage.setItem(PREFIJO + clave, valor);
  } catch {
    // Modo privado o almacenamiento bloqueado: se ignora.
  }
}

/** Saca espacios de más y caracteres de control, y corta al largo máximo. */
export function limpiarNombre(texto: string): string {
  return texto
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, LARGO_MAXIMO_NOMBRE);
}

export function cargarNombre(): string | null {
  const nombre = leer('jugador');
  return nombre ? limpiarNombre(nombre) || null : null;
}

export function guardarNombre(nombre: string): void {
  escribir('jugador', limpiarNombre(nombre));
}
