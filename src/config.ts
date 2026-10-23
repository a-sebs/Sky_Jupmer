// Constantes compartidas del juego
export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 800;

export const GRAVITY = 1000;
export const PLAYER_SPEED = 260;
export const JUMP_VELOCITY = -640; // altura máx. de salto ≈ 205 px

export const PLATFORM_WIDTH = 96;
export const PLATFORM_HEIGHT = 18;

// Separación vertical entre plataformas (debe ser menor que la altura de salto)
export const GAP_MIN = 75;
export const GAP_MAX = 135;

// Velocidad con la que la cámara sube sola (px/s)
export const CAMERA_RISE_START = 25;
export const CAMERA_RISE_MAX = 90;
export const CAMERA_RISE_ACCEL = 1.2; // px/s ganados por segundo

export const COLORS = {
  background: 0x1b1f3b,
  normal: 0x4caf50,
  horizontal: 0x29b6f6,
  vertical: 0xab47bc,
  breakable: 0xa1887f,
  player: 0xffca28,
};
