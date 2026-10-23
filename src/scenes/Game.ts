import Phaser from 'phaser';
import {
  CAMERA_RISE_ACCEL,
  CAMERA_RISE_MAX,
  CAMERA_RISE_START,
  GAME_HEIGHT,
  GAME_WIDTH,
  GAP_MAX,
  GAP_MIN,
  JUMP_VELOCITY,
  PLATFORM_HEIGHT,
  PLATFORM_WIDTH,
  PLAYER_SPEED,
} from '../config';

type PlatformType = 'normal' | 'horizontal' | 'vertical' | 'breakable';

type Platform = Phaser.Physics.Arcade.Image & {
  kind: PlatformType;
  baseY: number;
  range: number;
  breaking: boolean;
};

const WORLD_TOP = -10_000_000;

export class Game extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Image;
  private platforms!: Phaser.Physics.Arcade.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<'A' | 'D' | 'W', Phaser.Input.Keyboard.Key>;
  private background!: Phaser.GameObjects.TileSprite;
  private hudTime!: Phaser.GameObjects.Text;
  private hudHeight!: Phaser.GameObjects.Text;

  private touch = { left: false, right: false, jump: false };
  private elapsed = 0;
  private started = false;
  private finished = false;
  private riseSpeed = CAMERA_RISE_START;
  private cameraBottom = GAME_HEIGHT; // límite inferior de la cámara: solo puede subir
  private highestPlatformY = 0;
  private lastKind: PlatformType = 'normal';
  private startY = 0;
  private maxHeight = 0;

  constructor() {
    super('Game');
  }

  init() {
    // Reiniciar estado al volver a jugar
    this.touch = { left: false, right: false, jump: false };
    this.elapsed = 0;
    this.started = false;
    this.finished = false;
    this.riseSpeed = CAMERA_RISE_START;
    this.cameraBottom = GAME_HEIGHT;
    this.lastKind = 'normal';
    this.maxHeight = 0;
  }

  create() {
    // Límites del mundo: paredes a los lados, sin techo práctico y sin suelo (caer = perder)
    this.physics.world.setBounds(0, WORLD_TOP, GAME_WIDTH, -WORLD_TOP + GAME_HEIGHT + 2000);
    this.physics.world.setBoundsCollision(true, true, true, false);

    this.background = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'starfield').setOrigin(0).setScrollFactor(0);

    // Plataformas
    this.platforms = this.physics.add.group({ allowGravity: false, immovable: true });
    const ground = this.physics.add.staticImage(GAME_WIDTH / 2, GAME_HEIGHT - 16, 'ground');

    this.highestPlatformY = GAME_HEIGHT - 32;
    this.fillPlatforms(-GAME_HEIGHT);

    // Jugador
    this.player = this.physics.add.image(GAME_WIDTH / 2, GAME_HEIGHT - 60, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);
    this.startY = this.player.y;

    this.physics.add.collider(this.player, ground);
    this.physics.add.collider(this.player, this.platforms, (_p, plat) => this.onLand(plat as Platform));

    // Cámara: sigue al jugador en vertical, pero su límite inferior solo sube
    const cam = this.cameras.main;
    cam.startFollow(this.player, true, 0, 0.12);
    this.updateCameraBounds();

    // Controles
    const kb = this.input.keyboard!;
    this.cursors = kb.createCursorKeys();
    this.keys = kb.addKeys('A,D,W') as Record<'A' | 'D' | 'W', Phaser.Input.Keyboard.Key>;

    this.createHud();
    if (this.sys.game.device.input.touch) this.createTouchControls();
  }

  update(_time: number, delta: number) {
    if (this.finished) return;
    const dt = delta / 1000;
    const body = this.player.body as Phaser.Physics.Arcade.Body;

    // Movimiento horizontal
    const left = this.cursors.left.isDown || this.keys.A.isDown || this.touch.left;
    const right = this.cursors.right.isDown || this.keys.D.isDown || this.touch.right;
    const dir = (right ? 1 : 0) - (left ? 1 : 0);
    this.player.setVelocityX(dir * PLAYER_SPEED);
    if (dir !== 0) this.player.setFlipX(dir < 0);

    // Salto
    const jump = this.cursors.up.isDown || this.cursors.space.isDown || this.keys.W.isDown || this.touch.jump;
    const onFloor = body.blocked.down || body.touching.down;
    if (jump && onFloor) {
      this.player.setVelocityY(JUMP_VELOCITY);
      this.started = true;
    }

    // Cronómetro y altura
    if (this.started) this.elapsed += dt;
    this.maxHeight = Math.max(this.maxHeight, Math.floor((this.startY - this.player.y) / 10));
    this.hudTime.setText(`Tiempo: ${this.elapsed.toFixed(1)} s`);
    this.hudHeight.setText(`Altura: ${this.maxHeight} m`);

    // La cámara sube sola cada vez más rápido una vez iniciado el juego
    const cam = this.cameras.main;
    if (this.started) {
      this.riseSpeed = Math.min(CAMERA_RISE_MAX, this.riseSpeed + CAMERA_RISE_ACCEL * dt);
      this.cameraBottom -= this.riseSpeed * dt;
    }
    this.cameraBottom = Math.min(this.cameraBottom, cam.scrollY + GAME_HEIGHT);
    this.updateCameraBounds();

    this.background.tilePositionY = cam.scrollY * 0.3;

    this.updatePlatforms();
    this.fillPlatforms(cam.scrollY - 200);
    this.recyclePlatforms(cam.scrollY + GAME_HEIGHT + 100);

    // Perder: el jugador se quedó por debajo de la cámara
    if (this.player.y > cam.scrollY + GAME_HEIGHT + 40) this.endGame();
  }

  private updateCameraBounds() {
    this.cameras.main.setBounds(0, WORLD_TOP, GAME_WIDTH, this.cameraBottom - WORLD_TOP);
  }

  // ---------- Plataformas ----------

  private fillPlatforms(untilY: number) {
    while (this.highestPlatformY > untilY) {
      const kind = this.pickKind();
      // Tras una plataforma vertical se deja menos hueco, porque puede estar en su punto más alto
      const maxGap = this.lastKind === 'vertical' || kind === 'vertical' ? GAP_MAX - 35 : GAP_MAX;
      this.highestPlatformY -= Phaser.Math.Between(GAP_MIN, maxGap);
      this.spawnPlatform(kind, this.highestPlatformY);
      this.lastKind = kind;
    }
  }

  private pickKind(): PlatformType {
    const height = (GAME_HEIGHT - this.highestPlatformY) / 10;
    const d = Phaser.Math.Clamp(height / 400, 0, 1); // dificultad 0..1
    if (height < 30) return 'normal';

    const r = Math.random();
    const pBreak = 0.1 + 0.15 * d;
    const pHoriz = 0.15 + 0.15 * d;
    const pVert = 0.1 + 0.15 * d;

    // Nunca dos rompibles seguidas, para que siempre haya camino
    if (r < pBreak && this.lastKind !== 'breakable') return 'breakable';
    if (r < pBreak + pHoriz) return 'horizontal';
    if (r < pBreak + pHoriz + pVert) return 'vertical';
    return 'normal';
  }

  private spawnPlatform(kind: PlatformType, y: number) {
    const half = PLATFORM_WIDTH / 2;
    const x = Phaser.Math.Between(half + 4, GAME_WIDTH - half - 4);
    const plat = this.platforms.create(x, y, `plat-${kind}`) as Platform;
    plat.kind = kind;
    plat.baseY = y;
    plat.range = 0;
    plat.breaking = false;

    // Plataformas de un solo sentido: se atraviesan desde abajo
    const body = plat.body as Phaser.Physics.Arcade.Body;
    body.checkCollision.down = false;
    body.checkCollision.left = false;
    body.checkCollision.right = false;
    body.setSize(PLATFORM_WIDTH, PLATFORM_HEIGHT);

    if (kind === 'horizontal') {
      plat.setCollideWorldBounds(true);
      plat.setBounce(1, 0);
      plat.setVelocityX(Phaser.Math.Between(60, 130) * (Math.random() < 0.5 ? -1 : 1));
    } else if (kind === 'vertical') {
      plat.range = Phaser.Math.Between(30, 50);
      plat.setVelocityY(Phaser.Math.Between(40, 80));
    }
  }

  private updatePlatforms() {
    for (const obj of this.platforms.getChildren()) {
      const plat = obj as Platform;
      if (plat.kind !== 'vertical') continue;
      const body = plat.body as Phaser.Physics.Arcade.Body;
      if (plat.y > plat.baseY + plat.range && body.velocity.y > 0) body.velocity.y *= -1;
      else if (plat.y < plat.baseY - plat.range && body.velocity.y < 0) body.velocity.y *= -1;
    }
  }

  private recyclePlatforms(belowY: number) {
    for (const obj of [...this.platforms.getChildren()]) {
      const plat = obj as Platform;
      if (plat.y > belowY) plat.destroy();
    }
  }

  private onLand(plat: Platform) {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (plat.kind !== 'breakable' || plat.breaking || !body.touching.down) return;

    plat.breaking = true;
    plat.setTint(0xff8a65);
    this.tweens.add({ targets: plat, x: plat.x + 3, duration: 50, yoyo: true, repeat: 3 });
    this.time.delayedCall(350, () => {
      if (!plat.active) return;
      (plat.body as Phaser.Physics.Arcade.Body).enable = false;
      this.tweens.add({
        targets: plat,
        y: plat.y + 60,
        alpha: 0,
        angle: Phaser.Math.Between(-25, 25),
        duration: 400,
        onComplete: () => plat.destroy(),
      });
    });
  }

  // ---------- HUD y controles táctiles ----------

  private createHud() {
    const style = { fontFamily: 'Arial', fontSize: '22px', color: '#ffffff', stroke: '#000000', strokeThickness: 4 };
    this.hudTime = this.add.text(12, 10, '', style).setScrollFactor(0).setDepth(100);
    this.hudHeight = this.add.text(GAME_WIDTH - 12, 10, '', style).setOrigin(1, 0).setScrollFactor(0).setDepth(100);
  }

  private createTouchControls() {
    const y = GAME_HEIGHT - 60;
    const makeButton = (x: number, label: string, key: keyof Game['touch']) => {
      const btn = this.add.image(x, y, 'btn').setScrollFactor(0).setDepth(100).setInteractive();
      this.add.text(x, y, label, { fontFamily: 'Arial', fontSize: '32px', color: '#ffffff' }).setOrigin(0.5).setScrollFactor(0).setDepth(101);
      btn.on('pointerdown', () => (this.touch[key] = true));
      btn.on('pointerup', () => (this.touch[key] = false));
      btn.on('pointerout', () => (this.touch[key] = false));
    };
    makeButton(60, '◀', 'left');
    makeButton(160, '▶', 'right');
    makeButton(GAME_WIDTH - 60, '▲', 'jump');
  }

  private endGame() {
    this.finished = true;
    this.cameras.main.shake(200, 0.01);
    this.time.delayedCall(250, () => {
      this.scene.start('GameOver', { time: this.elapsed, height: this.maxHeight });
    });
  }
}
