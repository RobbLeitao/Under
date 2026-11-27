import Phaser from 'phaser';
import { ESCALA } from '../config';
import { inventario } from '../systems/inventario';

/** Sprites en SVG con su tamaño en unidades; se rasterizan ya escalados x4. */
const SPRITES: Record<string, { archivo: string; ancho: number; alto: number }> = {
  jugador: { archivo: 'jugador-metalero.svg', ancho: 12, alto: 30 },
  nikola: { archivo: 'nikola.svg', ancho: 12, alto: 30 },
  'nikola-pasamontanas': { archivo: 'nikola-pasamontanas.svg', ancho: 12, alto: 30 },
  perro: { archivo: 'perro.svg', ancho: 15, alto: 8 },
};

/** Carga de assets de public/assets/ y paso a la pantalla de inicio. */
export class Preload extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload() {
    // El SVG del fondo ya mide 1280x560.
    this.load.svg('fondo-esquina-el-bunker', 'assets/escenas/esquina-el-bunker.svg');
    for (const [clave, s] of Object.entries(SPRITES)) {
      this.load.svg(clave, `assets/sprites/${s.archivo}`, {
        width: s.ancho * ESCALA,
        height: s.alto * ESCALA,
      });
    }
  }

  create() {
    // Solo en desarrollo: ?escena=Clave arranca directo en esa escena
    // y ?objetos=a,b carga esos objetos en el inventario.
    const parametros = import.meta.env.DEV ? new URLSearchParams(location.search) : null;
    parametros?.get('objetos')?.split(',').forEach((o) => o && inventario.agregar(o));
    const atajo = parametros?.get('escena');
    this.scene.start(atajo && this.scene.get(atajo) ? atajo : 'Inicio');
  }
}
