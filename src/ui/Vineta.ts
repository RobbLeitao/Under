import Phaser from 'phaser';
import { ANCHO, ALTO, ALTO_ESCENA } from '../config';
import { HABLANTES, type ClaveHablante, type Linea } from '../data/dialogos';
import { completarTexto } from '../systems/textos';
import { balbucear } from '../systems/voz';

const FUENTE = '"Pixelify Sans"';
const COLOR_FONDO = 0xf4efe6;
const COLOR_BORDE = 0x15131a;
const BORDE = 4;
const SOMBRA = 4;
const RELLENO = 20;
const ANCHO_MAXIMO = 600;
const MARGEN_PANTALLA = 16;
const MS_POR_LETRA = 28;
/** Altura de la colita que apunta al que habla. */
const COLITA = 16;

/** Devuelve el punto arriba de la cabeza de cada hablante. */
export type Anclas = (quien: ClaveHablante) => { x: number; y: number };

/**
 * Muestra una línea de diálogo en una viñeta: caja clara con borde y sombra dura,
 * nombre en rojo y texto que aparece letra por letra con balbuceo.
 */
class Vineta extends Phaser.GameObjects.Container {
  private texto: Phaser.GameObjects.Text;
  private completo: string;
  private letras = 0;
  private escritura: Phaser.Time.TimerEvent;

  constructor(escena: Phaser.Scene, linea: Linea, ancla: { x: number; y: number }, banda?: string) {
    super(escena, 0, 0);
    const hablante = HABLANTES[linea.quien];
    this.completo = completarTexto(linea.texto, banda);

    const nombre = escena.add.text(RELLENO, RELLENO, completarTexto(hablante.nombre), {
      fontFamily: FUENTE,
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#A7362F',
    });
    this.texto = escena.add.text(RELLENO, RELLENO + 32, this.completo, {
      fontFamily: FUENTE,
      fontSize: '28px',
      color: '#15131A',
      lineSpacing: 6,
      wordWrap: { width: ANCHO_MAXIMO - RELLENO * 2, useAdvancedWrap: true },
    });

    // Se mide con el texto entero para que la caja no cambie de tamaño mientras se escribe.
    const ancho = Math.ceil(Math.max(nombre.width, this.texto.width) + RELLENO * 2);
    const alto = Math.ceil(this.texto.y + this.texto.height + RELLENO);
    this.texto.setText('');

    // Arriba del que habla; si no entra, abajo. Siempre dentro de la escena.
    const arriba = ancla.y - COLITA - alto >= MARGEN_PANTALLA;
    const x = Phaser.Math.Clamp(Math.round(ancla.x - ancho / 2), MARGEN_PANTALLA, ANCHO - MARGEN_PANTALLA - ancho - SOMBRA);
    const y = arriba
      ? Math.round(ancla.y - COLITA - alto)
      : Math.min(Math.round(ancla.y + COLITA), ALTO_ESCENA - alto - SOMBRA);
    this.setPosition(x, y);

    const g = escena.add.graphics();
    const puntaX = Phaser.Math.Clamp(ancla.x - x, 24, ancho - 24);
    const colita = (dx: number, dy: number, achique: number) => {
      const base = arriba ? alto - BORDE + dy : BORDE + dy;
      const punta = arriba ? alto + COLITA - achique + dy : -COLITA + achique + dy;
      g.fillTriangle(puntaX - 12 + achique + dx, base, puntaX + 12 - achique + dx, base, puntaX + dx, punta);
    };
    // Sombra dura, borde y relleno (caja y colita).
    g.fillStyle(COLOR_BORDE).fillRect(SOMBRA, SOMBRA, ancho, alto);
    colita(SOMBRA, SOMBRA, 0);
    g.fillRect(0, 0, ancho, alto);
    colita(0, 0, 0);
    g.fillStyle(COLOR_FONDO).fillRect(BORDE, BORDE, ancho - BORDE * 2, alto - BORDE * 2);
    colita(0, arriba ? -BORDE : BORDE, 6);

    this.add([g, nombre, this.texto]);
    this.setDepth(20000);
    escena.add.existing(this);

    this.escritura = escena.time.addEvent({
      delay: MS_POR_LETRA,
      repeat: this.completo.length - 1,
      callback: () => {
        this.letras++;
        this.texto.setText(this.completo.slice(0, this.letras));
        const letra = this.completo[this.letras - 1];
        if (this.letras % 2 === 1 && /[\p{L}\p{N}]/u.test(letra)) balbucear(escena, hablante.tono);
      },
    });
  }

  get terminada() {
    return this.letras >= this.completo.length;
  }

  completar() {
    this.escritura.remove();
    this.letras = this.completo.length;
    this.texto.setText(this.completo);
  }
}

/**
 * Reproduce un diálogo línea por línea. Un toque completa el texto; otro pasa a la siguiente.
 * Mientras dura, bloquea los toques en la escena y en la barra.
 */
export function reproducirDialogo(escena: Phaser.Scene, lineas: Linea[], anclas: Anclas, banda?: string): Promise<void> {
  return new Promise((resolver) => {
    if (lineas.length === 0) return resolver();
    const bloqueo = escena.add
      .zone(0, 0, ANCHO, ALTO)
      .setOrigin(0)
      .setDepth(19999)
      .setInteractive();
    let indice = 0;
    let actual = new Vineta(escena, lineas[0], anclas(lineas[0].quien), banda);

    bloqueo.on('pointerdown', () => {
      if (!actual.terminada) {
        actual.completar();
        return;
      }
      actual.destroy();
      indice++;
      if (indice >= lineas.length) {
        bloqueo.destroy();
        resolver();
        return;
      }
      actual = new Vineta(escena, lineas[indice], anclas(lineas[indice].quien), banda);
    });
  });
}
