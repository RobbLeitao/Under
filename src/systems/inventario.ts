import Phaser from 'phaser';

export const LUGARES_INVENTARIO = 4;

/**
 * Objetos físicos que lleva el jugador (monedas, galletitas, pasamontañas).
 * Lo digital va en el Phone. Avisa con el evento 'cambio' cada vez que se modifica.
 */
export class Inventario extends Phaser.Events.EventEmitter {
  private objetos: string[] = [];

  lista(): readonly string[] {
    return this.objetos;
  }

  tiene(clave: string): boolean {
    return this.objetos.includes(clave);
  }

  /** Devuelve false si ya está lleno o si ya lo tenía. */
  agregar(clave: string): boolean {
    if (this.tiene(clave) || this.objetos.length >= LUGARES_INVENTARIO) return false;
    this.objetos.push(clave);
    this.emit('cambio', this.objetos);
    return true;
  }

  quitar(clave: string): void {
    const antes = this.objetos.length;
    this.objetos = this.objetos.filter((o) => o !== clave);
    if (this.objetos.length !== antes) this.emit('cambio', this.objetos);
  }
}

/** Un único inventario para todo el juego, compartido entre escenas. */
export const inventario = new Inventario();
