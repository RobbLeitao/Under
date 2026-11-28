/** Objetos físicos que entran al inventario. El ícono está en public/assets/objetos/<clave>.svg. */

export interface Objeto {
  /** Cómo se nombra en la barra ("unas monedas"). */
  nombre: string;
  /** Lo que dice el jugador al mirarlo en el inventario (elegido, tocando Mirar). */
  mirar?: string;
  /** Lo que dice al usarlo donde no sirve, en lugar de la respuesta general. */
  usarEnOtraCosa?: string;
}

export const OBJETOS: Record<string, Objeto> = {
  monedas: { nombre: 'unas monedas' },
  galletitas: { nombre: 'un paquete de galletitas' },
  pasamontanas: { nombre: 'el pasamontañas de Nikola' },
  // Misión 2. Cada uno se usa solo: no se combinan objetos.
  'cuerda-cortada': {
    nombre: 'la cuarta cuerda, cortada',
    mirar: 'La punta quedó enrulada. Parece un gancho.',
    usarEnOtraCosa: 'No, eso no.',
  },
  // Provisorio: el guion no dice qué se ve al mirar la llave ni las cuerdas.
  'llave-deposito': { nombre: 'la llave del depósito', mirar: 'Una llave dorada, con su argolla.' },
  'cuerdas-bajo': { nombre: 'un juego de cuerdas de bajo', mirar: 'Cuerdas de bajo nuevas, en su sobre.' },
};
