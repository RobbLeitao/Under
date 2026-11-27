import Phaser from 'phaser';
import { ANCHO, ALTO_ESCENA, ALTO_BARRA, ESCALA } from '../config';
import { ESQUINA_EL_BUNKER as DATOS } from '../data/escenas';

/** Velocidad del jugador, en píxeles por segundo. */
const VELOCIDAD = 260;
/** Cada cuánto alterna el paso (rebote de 4 px) mientras camina. */
const MS_POR_PASO = 140;

/** La esquina de El Bunker: fondo, jugador, Nikola y el perro. Se camina tocando el piso. */
export class EsquinaBunker extends Phaser.Scene {
  private jugador!: Phaser.GameObjects.Image;
  /** Posición de los pies del jugador; el sprite la sigue con el rebote del paso. */
  private pies = { x: 0, y: 0 };
  private caminata?: Phaser.Tweens.Tween;
  private pasos?: Phaser.Time.TimerEvent;
  private rebote = 0;

  constructor() {
    super('EsquinaBunker');
  }

  create() {
    this.add.image(0, 0, DATOS.fondo).setOrigin(0);

    for (const c of DATOS.carteles) {
      this.add
        .text(c.x * ESCALA, c.y * ESCALA, c.texto, {
          fontFamily: '"Pixelify Sans"',
          fontSize: `${Math.round(c.tamano * ESCALA)}px`,
          fontStyle: 'bold',
          color: c.color,
        })
        .setOrigin(0.5);
    }

    for (const p of DATOS.personajes) {
      this.add
        .image(p.x * ESCALA, p.y * ESCALA, p.textura)
        .setOrigin(0.5, 1)
        .setDepth(p.y * ESCALA)
        .setName(p.clave);
    }

    this.pies = { x: DATOS.inicioJugador.x * ESCALA, y: DATOS.inicioJugador.y * ESCALA };
    this.jugador = this.add.image(0, 0, 'jugador').setOrigin(0.5, 1);
    this.actualizarJugador();

    this.dibujarBarra();

    this.input.on('pointerdown', (puntero: Phaser.Input.Pointer, tocados: Phaser.GameObjects.GameObject[]) => {
      if (puntero.y >= ALTO_ESCENA || tocados.length > 0) return;
      this.caminarHacia(puntero.x, puntero.y);
    });
  }

  /** Lugar provisorio de la barra de interfaz (tarea 4). */
  private dibujarBarra() {
    this.add.rectangle(0, ALTO_ESCENA, ANCHO, ALTO_BARRA, 0x15131a).setOrigin(0).setDepth(10000);
    this.add.rectangle(0, ALTO_ESCENA, ANCHO, 4, 0x2b1d3a).setOrigin(0).setDepth(10000);
  }

  private caminarHacia(x: number, y: number) {
    const z = DATOS.zonaCaminable;
    const destinoX = Phaser.Math.Clamp(x, z.xMin * ESCALA, z.xMax * ESCALA);
    const destinoY = Phaser.Math.Clamp(y, z.yMin * ESCALA, z.yMax * ESCALA);
    // Se ajusta a la grilla de 4 px para no salir del pixel art.
    const fx = Math.round(destinoX / ESCALA) * ESCALA;
    const fy = Math.round(destinoY / ESCALA) * ESCALA;

    const distancia = Phaser.Math.Distance.Between(this.pies.x, this.pies.y, fx, fy);
    if (distancia < ESCALA) return;

    this.marcarDestino(fx, fy);
    this.caminata?.stop();
    this.pasos ??= this.time.addEvent({
      delay: MS_POR_PASO,
      loop: true,
      callback: () => {
        this.rebote = this.rebote ? 0 : ESCALA;
        this.actualizarJugador();
      },
    });

    this.caminata = this.tweens.add({
      targets: this.pies,
      x: fx,
      y: fy,
      duration: (distancia / VELOCIDAD) * 1000,
      onUpdate: () => this.actualizarJugador(),
      onComplete: () => this.detener(),
    });
  }

  private detener() {
    this.pasos?.remove();
    this.pasos = undefined;
    this.rebote = 0;
    this.actualizarJugador();
  }

  private actualizarJugador() {
    const x = Math.round(this.pies.x / ESCALA) * ESCALA;
    const y = Math.round(this.pies.y / ESCALA) * ESCALA;
    this.jugador.setPosition(x, y - this.rebote).setDepth(y + 0.5);
  }

  /** Cuadradito que marca adónde va el jugador. */
  private marcarDestino(x: number, y: number) {
    const marca = this.add.rectangle(x, y, ESCALA * 2, ESCALA * 2, 0xe8c46a).setDepth(1);
    this.tweens.add({ targets: marca, alpha: 0, duration: 500, onComplete: () => marca.destroy() });
  }
}
