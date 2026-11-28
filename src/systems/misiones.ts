import type { Accion, Efecto, Mision, Regla } from '../data/misiones/tipos';
import { cumple, darRecompensa, marcar } from './estado';
import { inventario } from './inventario';

function mismaAccion(a: Accion, b: Accion): boolean {
  if (typeof a === 'string' || typeof b === 'string') return a === b;
  return a.usar === b.usar;
}

/**
 * La primera regla que corresponde a esta acción sobre este punto, o null. Se revisan primero
 * las reglas propias de la escena (la vereda sin misión) y después las misiones, en orden.
 */
export function buscarRegla(misiones: Mision[], reglasEscena: Regla[], punto: string, accion: Accion): Regla | null {
  const reglas = [...reglasEscena, ...misiones.flatMap((m) => m.reglas)];
  return reglas.find((r) => r.punto === punto && mismaAccion(r.accion, accion) && cumple(r.si)) ?? null;
}

/** Aplica los efectos de una regla. Devuelve los objetos que se agregaron al inventario. */
export function aplicarEfectos(efectos: Efecto[] = []): string[] {
  const agregados: string[] = [];
  for (const efecto of efectos) {
    if ('marcar' in efecto) marcar(efecto.marcar);
    else if ('quitar' in efecto) inventario.quitar(efecto.quitar);
    else if ('agregar' in efecto) {
      if (inventario.agregar(efecto.agregar)) agregados.push(efecto.agregar);
    } else if ('recompensa' in efecto) darRecompensa(efecto.recompensa);
  }
  return agregados;
}

/** Textura que le toca a un personaje según el avance (o la de base). */
export function texturaDe(misiones: Mision[], personaje: string, base: string): string {
  for (const mision of misiones) {
    const apariencia = mision.apariencias.find((a) => a.personaje === personaje && cumple(a.si));
    if (apariencia) return apariencia.textura;
  }
  return base;
}

/** La regla que termina la misión (la que marca su marcaFin), para mostrar sus recompensas. */
export function reglaFinal(mision: Mision): Regla | null {
  return mision.reglas.find((r) => r.efectos?.some((e) => 'marcar' in e && e.marcar === mision.marcaFin)) ?? null;
}

/** La misión que termina con esta regla (la que marca su marcaFin), o null. */
export function misionQueTermina(misiones: Mision[], regla: Regla | null): Mision | null {
  if (!regla?.efectos) return null;
  return misiones.find((m) => regla.efectos?.some((e) => 'marcar' in e && e.marcar === m.marcaFin)) ?? null;
}
