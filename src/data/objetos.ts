/** Objetos físicos que entran al inventario. El ícono está en public/assets/objetos/<clave>.svg. */

export interface Objeto {
  /** Cómo se nombra en la barra ("unas monedas"). */
  nombre: string;
}

export const OBJETOS: Record<string, Objeto> = {
  monedas: { nombre: 'unas monedas' },
  galletitas: { nombre: 'un paquete de galletitas' },
  pasamontanas: { nombre: 'el pasamontañas de Nikola' },
};
