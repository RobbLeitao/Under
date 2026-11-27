import { escribirJSON, leerJSON } from './guardado';

/** Preferencias de quien juega, guardadas en el dispositivo (aparte de la partida). */
interface Preferencias {
  sonido: boolean;
}

const CLAVE = 'preferencias';

function cargar(): Preferencias {
  return { sonido: true, ...(leerJSON<Partial<Preferencias>>(CLAVE) ?? {}) };
}

export function sonidoActivo(): boolean {
  return cargar().sonido;
}

export function guardarSonido(activo: boolean): void {
  escribirJSON(CLAVE, { ...cargar(), sonido: activo });
}
