import Phaser from 'phaser';
import { ANCHO, ALTO_ESCENA, ALTO_BARRA } from '../config';
import { VERBOS, type Verbo } from '../data/acciones';
import { OBJETOS } from '../data/objetos';
import { inventario, LUGARES_INVENTARIO } from '../systems/inventario';
import { sinLigaduras } from '../systems/textos';

const COLOR = {
  fondo: 0x15131a,
  borde: 0x2b1d3a,
  boton: 0x241f2e,
  bordeBoton: 0x3a3348,
  acento: 0xe8c46a,
};
const TEXTO = { claro: '#F4EFE6', acento: '#E8C46A', apagado: '#9A8FB0' };
const FUENTE = '"Pixelify Sans"';

/** Medidas de la barra, en píxeles dentro de los 1280x160 de abajo. */
const MARGEN = 24;
const Y_TEXTO = ALTO_ESCENA + 20;
const Y_FILA = ALTO_ESCENA + 60;
const ALTO_FILA = 84;
const ANCHO_VERBO = 176;
const SEPARACION = 12;
const LADO_LUGAR = 84;
const X_INVENTARIO = 620;
const ANCHO_PHONE = 172;

export interface OpcionesBarra {
  alElegirVerbo: (verbo: Verbo) => void;
  alTocarPhone: () => void;
  /** Se soltó un objeto del inventario sobre la escena, en (x, y). */
  alSoltarObjeto: (objeto: string, x: number, y: number) => void;
}

/** Distancia que hay que mover el dedo para que un toque sea un arrastre. */
const UMBRAL_ARRASTRE = 8;

function nombreDe(objeto: string) {
  return OBJETOS[objeto]?.nombre ?? objeto;
}


interface Boton {
  fondo: Phaser.GameObjects.Rectangle;
  texto: Phaser.GameObjects.Text;
}

/**
 * Barra de interfaz de abajo: texto de la acción actual, Mirar / Agarrar / Hablar,
 * inventario de cuatro lugares y botón Phone.
 */
export class BarraAcciones extends Phaser.GameObjects.Container {
  private linea: Phaser.GameObjects.Text;
  private verbos = new Map<Verbo, Boton>();
  private lugares: Phaser.GameObjects.Container[] = [];
  private objetivo: string | null = null;
  /** Objeto del inventario elegido con un toque, para usarlo tocando algo en la escena. */
  private elegido: string | null = null;
  private novedad!: Phaser.GameObjects.Rectangle;
  private temporizador?: Phaser.Time.TimerEvent;
  private alCambiarInventario = () => this.dibujarInventario();

  constructor(escena: Phaser.Scene, private opciones: OpcionesBarra) {
    super(escena, 0, 0);
    this.setDepth(10000);

    this.add(escena.add.rectangle(0, ALTO_ESCENA, ANCHO, ALTO_BARRA, COLOR.fondo).setOrigin(0));
    this.add(escena.add.rectangle(0, ALTO_ESCENA, ANCHO, 4, COLOR.borde).setOrigin(0));

    this.linea = escena.add
      .text(MARGEN, Y_TEXTO, '', { fontFamily: FUENTE, fontSize: '26px', color: TEXTO.claro })
      .setOrigin(0, 0);
    this.add(this.linea);

    VERBOS.forEach(({ verbo, etiqueta }, i) => {
      const x = MARGEN + i * (ANCHO_VERBO + SEPARACION);
      const boton = this.crearBoton(x, ANCHO_VERBO, etiqueta, () => this.tocarVerbo(verbo));
      this.verbos.set(verbo, boton);
    });

    for (let i = 0; i < LUGARES_INVENTARIO; i++) {
      const x = X_INVENTARIO + i * (LADO_LUGAR + SEPARACION);
      const lugar = escena.add.container(x, Y_FILA);
      lugar.add(
        escena.add
          .rectangle(0, 0, LADO_LUGAR, LADO_LUGAR, COLOR.boton)
          .setOrigin(0)
          .setStrokeStyle(4, COLOR.bordeBoton),
      );
      this.lugares.push(lugar);
      this.add(lugar);
    }

    this.crearBoton(ANCHO - MARGEN - ANCHO_PHONE, ANCHO_PHONE, 'Phone', () => this.opciones.alTocarPhone(), true);
    // Punto de novedades: algo nuevo en el Phone que todavía no se vio.
    this.novedad = escena.add
      .rectangle(ANCHO - MARGEN - 16, Y_FILA - 4, 20, 20, COLOR.acento)
      .setStrokeStyle(4, COLOR.fondo)
      .setVisible(false);
    this.add(this.novedad);
    escena.tweens.add({ targets: this.novedad, scale: 1.25, duration: 500, yoyo: true, repeat: -1 });

    escena.add.existing(this);
    escena.input.dragDistanceThreshold = UMBRAL_ARRASTRE;
    inventario.on('cambio', this.alCambiarInventario);
    this.once(Phaser.GameObjects.Events.DESTROY, () => inventario.off('cambio', this.alCambiarInventario));

    this.dibujarInventario();
    this.setObjetivo(null);
  }

  /** Lo que el jugador tocó en la escena; null si no hay nada elegido. */
  setObjetivo(nombre: string | null) {
    this.objetivo = nombre;
    this.temporizador?.remove();
    for (const boton of this.verbos.values()) {
      boton.texto.setColor(nombre ? TEXTO.claro : TEXTO.apagado);
    }
    if (this.elegido) {
      this.escribirLinea(`Usar ${nombreDe(this.elegido)} con… (tocá dónde)`).setColor(TEXTO.acento);
    } else if (nombre) {
      this.escribirLinea(nombre).setColor(TEXTO.acento);
    } else {
      this.escribirLinea('Tocá algo o a alguien, o caminá por la vereda.').setColor(TEXTO.apagado);
    }
  }

  setNovedad(hay: boolean) {
    this.novedad.setVisible(hay);
  }

  get objetoElegido() {
    return this.elegido;
  }

  /** Elige (o suelta, con null) un objeto del inventario y lo remarca. */
  elegirObjeto(clave: string | null) {
    this.elegido = clave;
    const objetos = inventario.lista();
    this.lugares.forEach((lugar, i) => {
      const marco = lugar.list[0] as Phaser.GameObjects.Rectangle;
      marco.setStrokeStyle(4, clave && objetos[i] === clave ? COLOR.acento : COLOR.bordeBoton);
    });
    this.setObjetivo(this.objetivo);
  }

  private escribirLinea(texto: string) {
    return this.linea.setText(sinLigaduras(texto));
  }

  /** Muestra un mensaje en la línea de arriba y después vuelve al objetivo actual. */
  mostrarMensaje(texto: string, ms = 3500) {
    this.temporizador?.remove();
    this.escribirLinea(texto).setColor(TEXTO.claro);
    this.temporizador = this.scene.time.delayedCall(ms, () => this.setObjetivo(this.objetivo));
  }

  private tocarVerbo(verbo: Verbo) {
    if (this.elegido) this.elegirObjeto(null);
    if (!this.objetivo) {
      this.mostrarMensaje('Primero tocá algo o a alguien en la escena.', 2500);
      return;
    }
    this.opciones.alElegirVerbo(verbo);
  }

  private crearBoton(x: number, ancho: number, etiqueta: string, alTocar: () => void, conIcono = false): Boton {
    const escena = this.scene;
    const fondo = escena.add
      .rectangle(x, Y_FILA, ancho, ALTO_FILA, COLOR.boton)
      .setOrigin(0)
      .setStrokeStyle(4, COLOR.bordeBoton)
      .setInteractive({ useHandCursor: true });
    const texto = escena.add
      .text(x + ancho / 2 + (conIcono ? 14 : 0), Y_FILA + ALTO_FILA / 2, etiqueta, {
        fontFamily: FUENTE,
        fontSize: '30px',
        fontStyle: 'bold',
        color: TEXTO.claro,
      })
      .setOrigin(0.5);
    this.add([fondo, texto]);

    if (conIcono) this.add(this.iconoPhone(texto.x - texto.width / 2 - 28, Y_FILA + ALTO_FILA / 2));

    fondo.on('pointerdown', () => fondo.setStrokeStyle(4, COLOR.acento));
    fondo.on('pointerout', () => fondo.setStrokeStyle(4, COLOR.bordeBoton));
    fondo.on('pointerup', () => {
      fondo.setStrokeStyle(4, COLOR.bordeBoton);
      alTocar();
    });
    return { fondo, texto };
  }

  /** Celularcito en pixel art (5x8 unidades a escala x4). */
  private iconoPhone(cx: number, cy: number) {
    const g = this.scene.add.graphics();
    const x = Math.round(cx - 10);
    const y = Math.round(cy - 16);
    g.fillStyle(COLOR.acento).fillRect(x, y, 20, 32);
    g.fillStyle(COLOR.boton).fillRect(x + 4, y + 4, 12, 20);
    g.fillStyle(COLOR.boton).fillRect(x + 8, y + 26, 4, 4);
    return g;
  }

  private dibujarInventario() {
    const objetos = inventario.lista();
    this.lugares.forEach((lugar, i) => {
      lugar.list.slice(1).forEach((hijo) => hijo.destroy());
      const clave = objetos[i];
      if (clave) lugar.add(this.crearObjeto(clave));
    });
    this.elegirObjeto(this.elegido && inventario.tiene(this.elegido) ? this.elegido : null);
  }

  /**
   * Ícono de un objeto del inventario. Se usa de dos maneras: tocándolo (queda elegido)
   * y después tocando algo en la escena, o arrastrándolo hasta ahí.
   */
  private crearObjeto(clave: string) {
    const escena = this.scene;
    const textura = `objeto-${clave}`;
    const centro = LADO_LUGAR / 2;
    const icono: Phaser.GameObjects.Image | Phaser.GameObjects.Text = escena.textures.exists(textura)
      ? escena.add.image(centro, centro, textura)
      : escena.add
          .text(centro, centro, clave, { fontFamily: FUENTE, fontSize: '16px', color: TEXTO.claro })
          .setOrigin(0.5);

    icono.setInteractive({ draggable: true, useHandCursor: true });
    let flotante: Phaser.GameObjects.Image | null = null;
    let arrastrando = false;

    icono.on('pointerup', () => {
      if (!arrastrando) this.elegirObjeto(this.elegido === clave ? null : clave);
    });
    icono.on('dragstart', (puntero: Phaser.Input.Pointer) => {
      arrastrando = true;
      if (this.elegido) this.elegirObjeto(null);
      this.temporizador?.remove();
      this.escribirLinea(`Usar ${nombreDe(clave)} con…`).setColor(TEXTO.acento);
      if (icono instanceof Phaser.GameObjects.Image) {
        icono.setAlpha(0.3);
        flotante = escena.add.image(puntero.x, puntero.y, textura).setDepth(30000);
      }
    });
    icono.on('drag', (puntero: Phaser.Input.Pointer) => flotante?.setPosition(puntero.x, puntero.y));
    icono.on('dragend', (puntero: Phaser.Input.Pointer) => {
      flotante?.destroy();
      flotante = null;
      icono.setAlpha(1);
      // Se espera al final del toque para que 'pointerup' no lo tome como un toque simple.
      escena.time.delayedCall(0, () => (arrastrando = false));
      this.setObjetivo(this.objetivo);
      if (puntero.y < ALTO_ESCENA) this.opciones.alSoltarObjeto(clave, puntero.x, puntero.y);
    });
    return icono;
  }
}
