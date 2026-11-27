import Phaser from 'phaser';
import { CAJA_LOGO, ESCALA } from '../config';
import { BANDAS } from '../data/bandas';
import { OBJETOS } from '../data/objetos';
import { inventario } from '../systems/inventario';
import { iniciarEstado, reiniciarPartida } from '../systems/estado';
import { sonidoActivo } from '../systems/preferencias';

/** Sprites en SVG con su tamaño en unidades; se rasterizan ya escalados x4. */
const SPRITES: Record<string, { archivo: string; ancho: number; alto: number }> = {
  jugador: { archivo: 'jugador-metalero.svg', ancho: 12, alto: 30 },
  nikola: { archivo: 'nikola.svg', ancho: 12, alto: 30 },
  'nikola-pasamontanas': { archivo: 'nikola-pasamontanas.svg', ancho: 12, alto: 30 },
  perro: { archivo: 'perro.svg', ancho: 15, alto: 8 },
  'perro-sin-pasamontanas': { archivo: 'perro-sin-pasamontanas.svg', ancho: 15, alto: 8 },
  'monedas-piso': { archivo: 'monedas-piso.svg', ancho: 8, alto: 3 },
};

/** Los íconos del inventario miden 16x16 unidades. */
const LADO_ICONO = 16;

/** Carga de assets de public/assets/, de la partida guardada, y paso a la pantalla de inicio. */
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
    for (const banda of Object.values(BANDAS)) {
      if (banda.logo) this.load.image(`logo-original-${banda.clave}`, `assets/logos/${banda.logo}`);
    }
    for (const clave of Object.keys(OBJETOS)) {
      this.load.svg(`objeto-${clave}`, `assets/objetos/${clave}.svg`, {
        width: LADO_ICONO * ESCALA,
        height: LADO_ICONO * ESCALA,
      });
    }
  }

  create() {
    this.achicarLogos();
    iniciarEstado();
    this.sound.mute = !sonidoActivo();

    // Solo en desarrollo: ?reiniciar borra el progreso, ?objetos=a,b carga esos objetos
    // en el inventario y ?escena=Clave arranca directo en esa escena.
    const parametros = import.meta.env.DEV ? new URLSearchParams(location.search) : null;
    if (parametros?.has('reiniciar')) reiniciarPartida();
    parametros?.get('objetos')?.split(',').forEach((o) => o && inventario.agregar(o));
    const atajo = parametros?.get('escena');
    this.scene.start(atajo && this.scene.get(atajo) ? atajo : 'Inicio');
  }

  /**
   * Los logos llegan grandes y no son pixel art. Con pixelArt: true, Phaser los achicaría
   * sin suavizar y quedarían serruchados, así que se hace una copia chica una sola vez
   * con el escalado suave del navegador: la textura logo-<banda>, que entra en CAJA_LOGO.
   */
  private achicarLogos() {
    for (const banda of Object.values(BANDAS)) {
      const original = `logo-original-${banda.clave}`;
      if (!this.textures.exists(original)) continue;
      const imagen = this.textures.get(original).getSourceImage() as HTMLImageElement;
      const escala = Math.min(CAJA_LOGO.ancho / imagen.width, CAJA_LOGO.alto / imagen.height);
      const ancho = Math.round(imagen.width * escala);
      const alto = Math.round(imagen.height * escala);
      const lienzo = this.textures.createCanvas(`logo-${banda.clave}`, ancho, alto);
      if (!lienzo) continue;
      const ctx = lienzo.getContext();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(imagen, 0, 0, ancho, alto);
      lienzo.refresh();
      this.textures.remove(original);
    }
  }
}
