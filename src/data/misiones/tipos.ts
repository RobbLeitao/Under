import type { Verbo } from '../acciones';
import type { Respuesta } from '../escenas';

/** Lo que hace el jugador sobre un punto: una de las tres acciones o soltarle un objeto encima. */
export type Accion = Verbo | { usar: string };

/** Se cumple si se cumplen todas las partes que tenga. */
export interface Condicion {
  /** Marcas de avance que tienen que estar. */
  con?: string[];
  /** Marcas de avance que no tienen que estar. */
  sin?: string[];
  /** Objetos que tiene que tener en el inventario. */
  tiene?: string[];
}

export type Efecto = { marcar: string } | { agregar: string } | { quitar: string } | { recompensa: string };

export interface Regla {
  punto: string;
  accion: Accion;
  si?: Condicion;
  respuesta: Respuesta;
  efectos?: Efecto[];
}

/** Cambia el sprite de un personaje según el avance. */
export interface Apariencia {
  personaje: string;
  textura: string;
  si: Condicion;
}

export interface Mision {
  clave: string;
  /** Marca que se pone cuando termina la entrada de la misión. */
  marcaInicio: string;
  /** Marca que se pone al terminarla. */
  marcaFin: string;
  /** Se revisan en orden: gana la primera que coincide. */
  reglas: Regla[];
  apariencias: Apariencia[];
  /** Mensaje en la barra al terminar. */
  mensajeFinal: string;
}
