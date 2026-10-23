import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';

export class MainMenu extends Phaser.Scene {
  constructor() {
    super('MainMenu');
  }

  create() {
    const cx = GAME_WIDTH / 2;

    for (let i = 0; i < 60; i++) {
      this.add.image(Phaser.Math.Between(0, GAME_WIDTH), Phaser.Math.Between(0, GAME_HEIGHT), 'star').setAlpha(Phaser.Math.FloatBetween(0.2, 0.8));
    }

    this.add.image(cx, 170, 'icon');
    this.add.text(cx, 250, 'SKY JUMPER', { fontFamily: 'Arial Black, Arial', fontSize: '48px', color: '#ffca28' }).setOrigin(0.5);

    const help = [
      'Sube lo más alto que puedas.',
      'La cámara no espera: ¡si te quedas abajo, pierdes!',
      '',
      '← → / A D : moverse',
      '↑ / W / Espacio : saltar',
      'Móvil: botones en pantalla',
    ];
    this.add.text(cx, 380, help, { fontFamily: 'Arial', fontSize: '20px', color: '#ffffff', align: 'center' }).setOrigin(0.5);

    const legend: [string, string][] = [
      ['plat-normal', 'Normal'],
      ['plat-horizontal', 'Se mueve ← →'],
      ['plat-vertical', 'Se mueve ↑ ↓'],
      ['plat-breakable', 'Se rompe'],
    ];
    legend.forEach(([key, label], i) => {
      const y = 510 + i * 36;
      this.add.image(cx - 70, y, key).setScale(0.6);
      this.add.text(cx - 20, y, label, { fontFamily: 'Arial', fontSize: '18px', color: '#dddddd' }).setOrigin(0, 0.5);
    });

    const start = this.add.text(cx, 700, 'Clic, toca o pulsa ENTER para jugar', { fontFamily: 'Arial', fontSize: '20px', color: '#ffca28' }).setOrigin(0.5);
    this.tweens.add({ targets: start, alpha: 0.3, duration: 700, yoyo: true, repeat: -1 });

    this.input.once('pointerdown', () => this.startGame());
    this.input.keyboard?.once('keydown-ENTER', () => this.startGame());
    this.input.keyboard?.once('keydown-SPACE', () => this.startGame());
  }

  private startGame() {
    this.scene.start('Game');
  }
}
