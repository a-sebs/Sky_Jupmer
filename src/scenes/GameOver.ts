import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';

interface GameOverData {
  time: number;
  height: number;
}

export class GameOver extends Phaser.Scene {
  private time_ = 0;
  private height_ = 0;

  constructor() {
    super('GameOver');
  }

  init(data: GameOverData) {
    this.time_ = data.time ?? 0;
    this.height_ = data.height ?? 0;
  }

  create() {
    const cx = GAME_WIDTH / 2;

    const best = Math.max(this.height_, this.loadBest());
    this.saveBest(best);

    this.add.text(cx, 220, 'FIN DE LA PARTIDA', { fontFamily: 'Arial Black, Arial', fontSize: '40px', color: '#ff5252' }).setOrigin(0.5);
    this.add
      .text(cx, 360, [`Altura: ${this.height_} m`, `Tiempo: ${this.time_.toFixed(1)} s`, '', `Récord: ${best} m`], {
        fontFamily: 'Arial',
        fontSize: '28px',
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5);

    const again = this.add.text(cx, GAME_HEIGHT - 200, 'Clic, toca o ENTER para reintentar', { fontFamily: 'Arial', fontSize: '20px', color: '#ffca28' }).setOrigin(0.5);
    this.tweens.add({ targets: again, alpha: 0.3, duration: 700, yoyo: true, repeat: -1 });

    // Pequeña espera para no reiniciar con el mismo toque que hizo perder
    this.time.delayedCall(400, () => {
      this.input.once('pointerdown', () => this.scene.start('Game'));
      this.input.keyboard?.once('keydown-ENTER', () => this.scene.start('Game'));
      this.input.keyboard?.once('keydown-M', () => this.scene.start('MainMenu'));
    });
    this.add.text(cx, GAME_HEIGHT - 160, 'M: menú principal', { fontFamily: 'Arial', fontSize: '16px', color: '#aaaaaa' }).setOrigin(0.5);
  }

  private loadBest(): number {
    try {
      return Number(localStorage.getItem('sky-jumper-best')) || 0;
    } catch {
      return 0;
    }
  }

  private saveBest(value: number) {
    try {
      localStorage.setItem('sky-jumper-best', String(value));
    } catch {
      // sin almacenamiento disponible
    }
  }
}
