/**
 * Figuritas del álbum: una por músico de la demo (docs/diseno.md).
 * Se desbloquean con la recompensa "figurita:<clave>" y muestran el logo de la banda (bandas.ts).
 */

export interface Figurita {
  clave: string;
  nombre: string;
  banda: string;
  rol: string;
}

export const FIGURITAS: Figurita[] = [
  { clave: 'nikola', nombre: 'Nikola', banda: 'orate', rol: 'Cantante y guitarrista' },
  { clave: 'fat', nombre: 'FAT', banda: 'kainoas', rol: 'Cantante' },
  { clave: 'peke', nombre: 'Peke', banda: 'abismal', rol: 'Cantante' },
  { clave: 'el-s', nombre: 'El S', banda: 'avtomata', rol: 'Cantante' },
  { clave: 'jota', nombre: 'Jota', banda: 'exiliado', rol: 'Bajista' },
];
