/**
 * Figuritas del álbum: una por músico de la demo (docs/diseno.md).
 * Se desbloquean con la recompensa "figurita:<clave>".
 */

export interface Figurita {
  clave: string;
  nombre: string;
  banda: string;
  rol: string;
  /** Textura del sprite; null mientras no haya dibujo. */
  textura: string | null;
}

export const FIGURITAS: Figurita[] = [
  { clave: 'nikola', nombre: 'Nikola', banda: 'orate', rol: 'Cantante y guitarrista', textura: 'nikola-pasamontanas' },
  { clave: 'fat', nombre: 'FAT', banda: 'kainoas', rol: 'Cantante', textura: null },
  { clave: 'peke', nombre: 'Peke', banda: 'abismal', rol: 'Cantante', textura: null },
  { clave: 'el-s', nombre: 'El S', banda: 'avtomata', rol: 'Cantante', textura: null },
  { clave: 'jota', nombre: 'Jota', banda: 'exiliado', rol: 'Bajista', textura: null },
];
