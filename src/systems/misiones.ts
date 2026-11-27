import type { Accion, Efecto, Mision } from '../data/misiones/tipos';
import { cumple, darRecompensa, marcar } from './estado';
import { inventario } from './inventario';

function mismaAccion(a: Accion, b: Accion): boolean {
  if (typeof a === 'string' || typeof b === 'string') return a === b;
  return a.usar === b.usar;
}

/** La primera regla de la misión que corresponde a esta acción sobre este punto, o null. */
export function buscarRegla(mision: Mision, punto: string, accion: Accion) {
  return mision.reglas.find((r) => r.punto === punto && mismaAccion(r.accion, accion) && cumple(r.si)) ?? null;
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
export function texturaDe(mision: Mision, personaje: string, base: string): string {
  return mision.apariencias.find((a) => a.personaje === personaje && cumple(a.si))?.textura ?? base;
}
