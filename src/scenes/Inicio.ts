import Phaser from 'phaser';
import { ANCHO, ALTO } from '../config';
import { cargarNombre, guardarNombre, limpiarNombre, LARGO_MAXIMO_NOMBRE } from '../systems/guardado';

/** Escena a la que se pasa después de elegir el nombre. */
const ESCENA_SIGUIENTE = 'EsquinaBunker';

/** Franjas planas del cielo al atardecer (docs/estilo-visual.md), de arriba hacia abajo. */
const FRANJAS_CIELO = [0x2b1d3a, 0x4a2a52, 0x7a3b55, 0xc25a4a, 0xe8875a];

const FORMULARIO = `
<form class="inicio" autocomplete="off">
  <label for="nombre-jugador">¿Cómo te llamás?</label>
  <input id="nombre-jugador" name="nombre" type="text" maxlength="${LARGO_MAXIMO_NOMBRE}"
    autocapitalize="words" spellcheck="false" enterkeyhint="go" placeholder="Tu nombre" />
  <p class="aviso" aria-live="polite"></p>
  <button type="submit">Jugar</button>
</form>
<style>
  .inicio { display: flex; flex-direction: column; align-items: center; gap: 12px; width: 520px;
    font-family: 'Pixelify Sans', monospace; }
  .inicio label { color: #F4EFE6; font-size: 32px; }
  .inicio input { box-sizing: border-box; width: 100%; height: 72px; padding: 0 20px;
    font: inherit; font-size: 36px; text-align: center; color: #F4EFE6;
    background: #241F2E; border: 4px solid #3A3348; border-radius: 0; outline: none; }
  .inicio input:focus { border-color: #E8C46A; }
  .inicio input::placeholder { color: #9A8FB0; }
  .inicio .aviso { min-height: 28px; margin: 0; color: #E8875A; font-size: 24px; }
  .inicio button { min-width: 240px; height: 72px; font: inherit; font-size: 36px; font-weight: 700;
    color: #15131A; background: #E8C46A; border: 4px solid #15131A; box-shadow: 4px 4px 0 #15131A;
    cursor: pointer; }
  .inicio button:active { transform: translate(4px, 4px); box-shadow: none; }
</style>`;

/** Pantalla de inicio: logo UNDER y campo para el nombre de quien juega. */
export class Inicio extends Phaser.Scene {
  constructor() {
    super('Inicio');
  }

  create() {
    this.dibujarFondo();
    this.dibujarLogo();
    this.crearFormulario();
  }

  private dibujarFondo() {
    const alto = 400 / FRANJAS_CIELO.length;
    FRANJAS_CIELO.forEach((color, i) => {
      this.add.rectangle(0, i * alto, ANCHO, alto, color).setOrigin(0);
    });
    this.add.rectangle(0, 400, ANCHO, ALTO - 400, 0x15131a).setOrigin(0);
    this.add.rectangle(0, 400, ANCHO, 4, 0x2b1d3a).setOrigin(0);
  }

  private dibujarLogo() {
    const estilo: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: '"Pixelify Sans"',
      fontSize: '176px',
      fontStyle: 'bold',
    };
    // Sombra dura de 8 px, sin difuminado, para que siga siendo pixel art.
    this.add.text(ANCHO / 2 + 8, 168, 'UNDER', { ...estilo, color: '#15131A' }).setOrigin(0.5);
    this.add.text(ANCHO / 2, 160, 'UNDER', { ...estilo, color: '#E8C46A' }).setOrigin(0.5);
    this.add
      .text(ANCHO / 2, 280, 'rock · metal · punk de Mar del Plata', {
        fontFamily: '"Pixelify Sans"',
        fontSize: '32px',
        color: '#F4EFE6',
      })
      .setOrigin(0.5);
  }

  private crearFormulario() {
    const dom = this.add.dom(ANCHO / 2, 540).createFromHTML(FORMULARIO);
    const form = dom.node.querySelector('form') as HTMLFormElement;
    const input = dom.node.querySelector('input') as HTMLInputElement;
    const aviso = dom.node.querySelector('.aviso') as HTMLParagraphElement;

    input.value = cargarNombre() ?? '';
    input.addEventListener('input', () => (aviso.textContent = ''));

    form.addEventListener('submit', (evento) => {
      evento.preventDefault();
      const nombre = limpiarNombre(input.value);
      if (!nombre) {
        aviso.textContent = 'Escribí tu nombre para arrancar.';
        input.focus();
        return;
      }
      guardarNombre(nombre);
      input.blur();
      this.empezar();
    });
  }

  private empezar() {
    this.scene.start(ESCENA_SIGUIENTE);
  }
}
