import Phaser from 'phaser';
import { COLORS, GAME_HEIGHT, GAME_WIDTH, PLATFORM_HEIGHT, PLATFORM_WIDTH } from '../config';

export class Preloader extends Phaser.Scene {
  constructor() {
    super('Preloader');
  }

  init() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    this.add.text(cx, cy - 40, 'Cargando...', { fontFamily: 'Arial', fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);
    this.add.rectangle(cx, cy, 300, 24).setStrokeStyle(2, 0xffffff);
    const bar = this.add.rectangle(cx - 148, cy, 4, 20, 0xffca28).setOrigin(0, 0.5);

    this.load.on('progress', (progress: number) => {
      bar.width = 4 + 292 * progress;
    });
  }

  preload() {
    // Los assets estáticos van en public/ y se cargan con rutas relativas,
    // por ejemplo: this.load.audio('jump', 'sounds/jump.mp3');
    this.load.svg('icon', 'favicon.svg', { width: 64, height: 64 });
  }

  create() {
    this.makeTextures();
    this.scene.start('MainMenu');
  }

  // Texturas dibujadas de forma procedural con Graphics
  private makeTextures() {
    const g = this.make.graphics({ x: 0, y: 0 }, false);

    // Jugador
    g.fillStyle(COLORS.player).fillRoundedRect(0, 0, 32, 40, 8);
    g.fillStyle(0x000000).fillCircle(10, 14, 3).fillCircle(22, 14, 3);
    g.fillStyle(0x000000).fillRect(10, 26, 12, 3);
    g.generateTexture('player', 32, 40);
    g.clear();

    // Plataformas
    const platform = (key: string, color: number, detail: (gr: Phaser.GameObjects.Graphics) => void) => {
      g.fillStyle(color).fillRoundedRect(0, 0, PLATFORM_WIDTH, PLATFORM_HEIGHT, 6);
      g.fillStyle(0xffffff, 0.25).fillRoundedRect(4, 2, PLATFORM_WIDTH - 8, 5, 3);
      detail(g);
      g.generateTexture(key, PLATFORM_WIDTH, PLATFORM_HEIGHT);
      g.clear();
    };

    platform('plat-normal', COLORS.normal, () => {});
    platform('plat-horizontal', COLORS.horizontal, (gr) => {
      gr.fillStyle(0xffffff, 0.8);
      gr.fillTriangle(8, 9, 18, 4, 18, 14);
      gr.fillTriangle(PLATFORM_WIDTH - 8, 9, PLATFORM_WIDTH - 18, 4, PLATFORM_WIDTH - 18, 14);
    });
    platform('plat-vertical', COLORS.vertical, (gr) => {
      gr.fillStyle(0xffffff, 0.8);
      gr.fillTriangle(PLATFORM_WIDTH / 2, 2, PLATFORM_WIDTH / 2 - 6, 8, PLATFORM_WIDTH / 2 + 6, 8);
      gr.fillTriangle(PLATFORM_WIDTH / 2, 16, PLATFORM_WIDTH / 2 - 6, 10, PLATFORM_WIDTH / 2 + 6, 10);
    });
    platform('plat-breakable', COLORS.breakable, (gr) => {
      gr.lineStyle(2, 0x4e342e);
      gr.lineBetween(30, 0, 38, 9).lineBetween(38, 9, 32, 18);
      gr.lineBetween(64, 0, 58, 10).lineBetween(58, 10, 66, 18);
    });

    // Suelo inicial
    g.fillStyle(0x2e7d32).fillRect(0, 0, GAME_WIDTH, 32);
    g.fillStyle(COLORS.normal).fillRect(0, 0, GAME_WIDTH, 8);
    g.generateTexture('ground', GAME_WIDTH, 32);
    g.clear();

    // Fondo de estrellas repetible
    for (let i = 0; i < 40; i++) {
      g.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.15, 0.7));
      g.fillCircle(Phaser.Math.Between(0, 255), Phaser.Math.Between(0, 255), Phaser.Math.FloatBetween(0.6, 1.6));
    }
    g.generateTexture('starfield', 256, 256);
    g.clear();

    // Partícula / estrella de fondo
    g.fillStyle(0xffffff).fillCircle(2, 2, 2);
    g.generateTexture('star', 4, 4);
    g.clear();

    // Botón táctil
    g.fillStyle(0xffffff, 0.18).fillCircle(40, 40, 40);
    g.lineStyle(3, 0xffffff, 0.5).strokeCircle(40, 40, 38);
    g.generateTexture('btn', 80, 80);

    g.destroy();
  }
}
