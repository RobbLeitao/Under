import Phaser from 'phaser';
import { ANCHO, ALTO, ALTO_ESCENA } from '../config';
import { HABLANTES, type ClaveHablante, type Linea } from '../data/dialogos';
import { completarTexto } from '../systems/textos';
import { balbucear } from '../systems/voz';
import { abrirPlataforma, textoBotonPlataforma } from '../systems/enlaces';
import { anchoBoton, crearBoton } from './Boton';

const FUENTE = '"Pixelify Sans"';
/** Contorno oscuro alrededor de las letras, para que se lean sobre cualquier fondo. */
const CONTORNO = '#0B0810';
const GROSOR_CONTORNO = 8;
const TAMANO_LETRA = 30;
const ANCHO_MAXIMO = 560;
const MARGEN_PANTALLA = 16;
/** Separación entre la cabeza del que habla y el texto. */
const SEPARACION = 12;
/** Duración del balbuceo: una sílaba cada tantas letras. */
const MS_POR_LETRA = 28;
/** Milisegundos en que se ignoran los toques después de que aparece una línea. */
const ESPERA_MINIMA = 250;

/** Devuelve el punto arriba de la cabeza de cada hablante. */
export type Anclas = (quien: ClaveHablante) => { x: number; y: number };

/** Avisa cuándo empieza y cuándo termina el balbuceo de una línea (para animar al que habla). */
export type AlHablar = (quien: ClaveHablante, hablando: boolean) => void;

/**
 * Muestra una línea de diálogo como en Thimbleweed Park: el texto flota sobre la cabeza
 * del que habla, con su color y un contorno oscuro, sin caja ni nombre. La línea aparece
 * entera y el balbuceo suena mientras dura.
 */
class Vineta extends Phaser.GameObjects.Container {
  private letras = 0;
  private total: number;
  private balbuceo: Phaser.Time.TimerEvent;
  private hablando = true;

  constructor(
    escena: Phaser.Scene,
    private linea: Linea,
    ancla: { x: number; y: number },
    banda?: string,
    private alHablar?: AlHablar,
  ) {
    super(escena, 0, 0);
    const hablante = HABLANTES[linea.quien];
    const completo = completarTexto(linea.texto, banda);

    const texto = escena.add
      .text(0, 0, completo, {
        fontFamily: FUENTE,
        fontSize: `${TAMANO_LETRA}px`,
        color: hablante.color,
        stroke: CONTORNO,
        strokeThickness: GROSOR_CONTORNO,
        align: 'center',
        lineSpacing: 2,
        wordWrap: { width: ANCHO_MAXIMO, useAdvancedWrap: true },
      })
      .setOrigin(0.5, 0);

    // Si la línea invita a escuchar a la banda ({plataforma}), lleva el botón con el enlace, abajo.
    const etiquetaEnlace = banda && linea.texto.includes('{plataforma}') ? textoBotonPlataforma(banda) : null;
    const anchoEnlace = etiquetaEnlace ? anchoBoton(escena, etiquetaEnlace) : 0;
    const altoEnlace = etiquetaEnlace ? 52 + 12 : 0;
    const ancho = Math.max(texto.width, anchoEnlace);
    const alto = texto.height + altoEnlace;

    // Centrado arriba de la cabeza del que habla, siempre dentro de la escena.
    const cx = Phaser.Math.Clamp(Math.round(ancla.x), MARGEN_PANTALLA + ancho / 2, ANCHO - MARGEN_PANTALLA - ancho / 2);
    const y = Phaser.Math.Clamp(Math.round(ancla.y - SEPARACION - alto), MARGEN_PANTALLA, ALTO_ESCENA - alto - MARGEN_PANTALLA);
    this.setPosition(Math.round(cx), y);
    this.add(texto);
    if (etiquetaEnlace && banda) {
      this.add(crearBoton(escena, -Math.round(anchoEnlace / 2), Math.ceil(texto.height) + 12, anchoEnlace, etiquetaEnlace, () => abrirPlataforma(banda)));
    }
    this.setDepth(20000);
    escena.add.existing(this);

    this.total = completo.length;
    this.alHablar?.(linea.quien, true);
    this.balbuceo = escena.time.addEvent({
      delay: MS_POR_LETRA,
      repeat: this.total - 1,
      callback: () => {
        this.letras++;
        const letra = completo[this.letras - 1];
        if (this.letras % 2 === 1 && /[\p{L}\p{N}]/u.test(letra)) balbucear(escena, hablante.tono);
        if (this.letras >= this.total) this.callarse();
      },
    });
  }

  /** Corta el balbuceo; el texto ya está entero. */
  completar() {
    this.balbuceo.remove();
    this.letras = this.total;
    this.callarse();
  }

  /** Termina el gesto de hablar (una sola vez por línea). */
  private callarse() {
    if (!this.hablando) return;
    this.hablando = false;
    this.alHablar?.(this.linea.quien, false);
  }
}

/**
 * Reproduce un diálogo línea por línea. Cada toque pasa a la línea siguiente.
 * Mientras dura, bloquea los toques en la escena y en la barra.
 *
 * Con `msAuto`, cada línea pasa sola después de ese tiempo (en escenas sin control, como el
 * show), salvo la que lleva el botón de la plataforma, que espera el toque.
 */
export function reproducirDialogo(
  escena: Phaser.Scene,
  lineas: Linea[],
  anclas: Anclas,
  banda?: string,
  alHablar?: AlHablar,
  msAuto?: number,
): Promise<void> {
  return new Promise((resolver) => {
    if (lineas.length === 0) return resolver();
    const bloqueo = escena.add
      .zone(0, 0, ANCHO, ALTO)
      .setOrigin(0)
      .setDepth(19999)
      .setInteractive();
    let indice = 0;
    let actual: Vineta;
    let desde = 0;
    let automatico: Phaser.Time.TimerEvent | undefined;
    const mostrar = () => {
      const linea = lineas[indice];
      actual = new Vineta(escena, linea, anclas(linea.quien), banda, alHablar);
      desde = escena.time.now;
      automatico?.remove();
      const conBoton = Boolean(banda && linea.texto.includes('{plataforma}'));
      if (msAuto && !conBoton) automatico = escena.time.delayedCall(msAuto, pasar);
    };
    const pasar = () => {
      automatico?.remove();
      actual.completar();
      actual.destroy();
      indice++;
      if (indice >= lineas.length) {
        bloqueo.destroy();
        resolver();
        return;
      }
      mostrar();
    };
    mostrar();

    // Cada toque pasa a la línea siguiente (la línea ya se ve entera), salvo uno que llegue
    // apenas aparece, para que un doble toque no se saltee una línea sin querer.
    bloqueo.on('pointerdown', () => {
      if (escena.time.now - desde < ESPERA_MINIMA) return;
      pasar();
    });
  });
}
