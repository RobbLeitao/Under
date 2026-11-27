import Phaser from 'phaser';
import { ALTO_ESCENA, ESCALA } from '../config';
import { ESQUINA_EL_BUNKER as DATOS, type PuntoInteres } from '../data/escenas';
import { RESPUESTAS_POR_DEFECTO, type Verbo } from '../data/acciones';
import { BarraAcciones } from '../ui/BarraAcciones';

/** Velocidad del jugador, en píxeles por segundo. */
const VELOCIDAD = 260;
/** Cada cuánto alterna el paso (rebote de 4 px) mientras camina. */
const MS_POR_PASO = 140;

/**
 * La esquina de El Bunker: fondo, jugador, Nikola y el perro. Se camina tocando el piso;
 * al tocar a alguien o algo, el jugador se acerca y se elige una acción en la barra.
 */
export class EsquinaBunker extends Phaser.Scene {
  private jugador!: Phaser.GameObjects.Image;
  /** Posición de los pies del jugador; el sprite la sigue con el rebote del paso. */
  private pies = { x: 0, y: 0 };
  private caminata?: Phaser.Tweens.Tween;
  private pasos?: Phaser.Time.TimerEvent;
  private rebote = 0;
  private barra!: BarraAcciones;
  private seleccionado: PuntoInteres | null = null;

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

    this.barra = new BarraAcciones(this, {
      alElegirVerbo: (verbo) => this.actuar(verbo),
      alTocarPhone: () => this.barra.mostrarMensaje('El Phone todavía no prende.'),
    });

    for (const punto of DATOS.puntos) {
      const z = punto.zona;
      this.add
        .zone(z.x * ESCALA, z.y * ESCALA, z.ancho * ESCALA, z.alto * ESCALA)
        .setOrigin(0)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.seleccionar(punto));
    }

    this.input.on('pointerdown', (puntero: Phaser.Input.Pointer, tocados: Phaser.GameObjects.GameObject[]) => {
      if (puntero.y >= ALTO_ESCENA || tocados.length > 0) return;
      this.seleccionado = null;
      this.barra.setObjetivo(null);
      this.caminarHacia(puntero.x, puntero.y);
    });
  }

  private seleccionar(punto: PuntoInteres) {
    this.seleccionado = punto;
    this.barra.setObjetivo(punto.nombre);
    this.caminarHacia(punto.acercarse.x * ESCALA, punto.acercarse.y * ESCALA, false);
  }

  /** Respuesta provisoria en la barra; con la tarea 5 pasa a las viñetas de diálogo. */
  private actuar(verbo: Verbo) {
    if (!this.seleccionado) return;
    this.barra.mostrarMensaje(this.seleccionado.respuestas[verbo] ?? RESPUESTAS_POR_DEFECTO[verbo]);
  }

  private caminarHacia(x: number, y: number, marcar = true) {
    const z = DATOS.zonaCaminable;
    const destinoX = Phaser.Math.Clamp(x, z.xMin * ESCALA, z.xMax * ESCALA);
    const destinoY = Phaser.Math.Clamp(y, z.yMin * ESCALA, z.yMax * ESCALA);
    // Se ajusta a la grilla de 4 px para no salir del pixel art.
    const fx = Math.round(destinoX / ESCALA) * ESCALA;
    const fy = Math.round(destinoY / ESCALA) * ESCALA;

    const distancia = Phaser.Math.Distance.Between(this.pies.x, this.pies.y, fx, fy);
    if (distancia < ESCALA) return;

    if (marcar) this.marcarDestino(fx, fy);
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
