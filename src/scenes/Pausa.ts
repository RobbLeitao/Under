import Phaser from 'phaser';
import { ANCHO, ALTO } from '../config';
import { reiniciarPartida } from '../systems/estado';
import { detenerMusica } from '../systems/musica';
import { pausarAmbiente } from '../systems/ambiente';
import { guardarSonido } from '../systems/preferencias';
import { sinLigaduras } from '../systems/textos';
import { crearBoton } from '../ui/Boton';

const ANCHO_PANEL = 440;
const RELLENO = 32;
const ALTO_BOTON = 52;
const SEPARACION = 16;

/**
 * Menú de pausa, abierto encima de la escena (que queda en pausa).
 * Seguir, sonido sí/no, empezar de nuevo (con confirmación) e ir al inicio.
 */
export class Pausa extends Phaser.Scene {
  private volverA = '';
  /** Sonidos que estaban sonando al pausar: al seguir se retoman solo esos. */
  private pausados: Phaser.Sound.BaseSound[] = [];

  constructor() {
    super('Pausa');
  }

  init(datos: { volverA: string }) {
    this.volverA = datos.volverA;
    this.pausados = [];
  }

  create() {
    this.pausados = this.sound.getAllPlaying();
    this.pausados.forEach((s) => s.pause());
    pausarAmbiente(true);

    this.add.rectangle(0, 0, ANCHO, ALTO, 0x15131a, 0.8).setOrigin(0).setInteractive();

    const botones = 4;
    const alto = RELLENO * 2 + 56 + botones * ALTO_BOTON + (botones - 1) * SEPARACION;
    const x0 = Math.round((ANCHO - ANCHO_PANEL) / 2);
    const y0 = Math.round((ALTO - alto) / 2);
    const g = this.add.graphics();
    g.fillStyle(0x15131a).fillRect(x0 + 6, y0 + 6, ANCHO_PANEL, alto);
    g.fillRect(x0, y0, ANCHO_PANEL, alto);
    g.fillStyle(0xf4efe6).fillRect(x0 + 4, y0 + 4, ANCHO_PANEL - 8, alto - 8);
    this.add
      .text(ANCHO / 2, y0 + RELLENO, 'Pausa', { fontFamily: '"Pixelify Sans"', fontSize: '40px', color: '#A7362F' })
      .setOrigin(0.5, 0);

    const ancho = ANCHO_PANEL - RELLENO * 2;
    let y = y0 + RELLENO + 56;
    const siguiente = () => {
      const actual = y;
      y += ALTO_BOTON + SEPARACION;
      return actual;
    };

    crearBoton(this, x0 + RELLENO, siguiente(), ancho, 'Seguir', () => this.seguir());

    const sonido = crearBoton(this, x0 + RELLENO, siguiente(), ancho, this.etiquetaSonido(), () => {
      this.sound.mute = !this.sound.mute;
      guardarSonido(!this.sound.mute);
      (sonido.list[2] as Phaser.GameObjects.Text).setText(this.etiquetaSonido());
    }, 'oscuro');

    // Empezar de nuevo borra el avance: el primer toque pide confirmación.
    let confirmar = false;
    const reiniciar = crearBoton(this, x0 + RELLENO, siguiente(), ancho, 'Empezar de nuevo', () => {
      if (!confirmar) {
        confirmar = true;
        (reiniciar.list[2] as Phaser.GameObjects.Text).setText(sinLigaduras('¿Seguro? Se borra el avance'));
        return;
      }
      reiniciarPartida();
      // La partida arranca de nuevo con la misión 1, en la esquina de El Bunker.
      this.salirA('EsquinaBunker');
    }, 'oscuro');

    crearBoton(this, x0 + RELLENO, siguiente(), ancho, 'Ir al inicio', () => this.salirA('Inicio'), 'oscuro');

    this.input.keyboard?.on('keydown-ESC', () => this.seguir());
    this.input.keyboard?.on('keydown-P', () => this.seguir());
  }

  private etiquetaSonido() {
    return this.sound.mute ? 'Sonido: no' : 'Sonido: sí';
  }

  private seguir() {
    this.pausados.forEach((s) => s.resume());
    pausarAmbiente(false);
    this.scene.resume(this.volverA);
    this.scene.stop();
  }

  /** Cierra la escena pausada y arranca otra (o la misma, desde cero). */
  private salirA(escena: string) {
    detenerMusica();
    this.scene.stop(this.volverA);
    this.scene.start(escena);
  }
}
