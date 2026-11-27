import { borrar, escribirJSON, leerJSON } from './guardado';
import { inventario } from './inventario';
import type { Condicion } from '../data/misiones/tipos';

/** Progreso de la partida, guardado en el dispositivo. */
interface Guardado {
  version: 1;
  /** Marcas de avance de las misiones (ver data/misiones/). */
  marcas: string[];
  inventario: string[];
  /** Lo que se desbloqueó para el Phone: "tema:..." y "figurita:...". */
  recompensas: string[];
}

const CLAVE = 'partida';

const marcas = new Set<string>();
const recompensas = new Set<string>();

function guardar() {
  const datos: Guardado = {
    version: 1,
    marcas: [...marcas],
    inventario: [...inventario.lista()],
    recompensas: [...recompensas],
  };
  escribirJSON(CLAVE, datos);
}

/** Carga la partida guardada y empieza a guardar cada cambio del inventario. Se llama una vez. */
export function iniciarEstado() {
  const datos = leerJSON<Guardado>(CLAVE);
  if (datos?.version === 1) {
    datos.marcas.forEach((m) => marcas.add(m));
    datos.recompensas.forEach((r) => recompensas.add(r));
    inventario.cargar(datos.inventario);
  }
  inventario.on('cambio', guardar);
}

/** Borra el progreso (no el nombre del jugador). */
export function reiniciarPartida() {
  marcas.clear();
  recompensas.clear();
  inventario.cargar([]);
  borrar(CLAVE);
}

export function tieneMarca(marca: string) {
  return marcas.has(marca);
}

export function marcar(marca: string) {
  if (marcas.has(marca)) return;
  marcas.add(marca);
  guardar();
}

export function tieneRecompensa(clave: string) {
  return recompensas.has(clave);
}

/** Claves de las recompensas de un tipo: listaRecompensas('tema') → ['orate-psicopata']. */
export function listaRecompensas(tipo: 'tema' | 'figurita'): string[] {
  const prefijo = `${tipo}:`;
  return [...recompensas].filter((r) => r.startsWith(prefijo)).map((r) => r.slice(prefijo.length));
}

export function darRecompensa(clave: string) {
  if (recompensas.has(clave)) return;
  recompensas.add(clave);
  marcas.add(MARCA_NOVEDADES);
  guardar();
}

/** Hay recompensas que el jugador todavía no vio en el Phone. */
const MARCA_NOVEDADES = 'novedades-phone';

export function hayNovedades() {
  return marcas.has(MARCA_NOVEDADES);
}

export function novedadesVistas() {
  if (marcas.delete(MARCA_NOVEDADES)) guardar();
}

export function cumple(condicion: Condicion | undefined): boolean {
  if (!condicion) return true;
  return (
    (condicion.con ?? []).every((m) => marcas.has(m)) &&
    (condicion.sin ?? []).every((m) => !marcas.has(m)) &&
    (condicion.tiene ?? []).every((o) => inventario.tiene(o))
  );
}
