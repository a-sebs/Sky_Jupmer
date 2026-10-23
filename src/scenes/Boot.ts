import Phaser from 'phaser';

// Escena mínima: prepara lo esencial y pasa al Preloader
export class Boot extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    this.scene.start('Preloader');
  }
}
