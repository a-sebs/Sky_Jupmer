import Phaser from 'phaser';
import './style.css';
import { GAME_HEIGHT, GAME_WIDTH, GRAVITY } from './config';
import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import { MainMenu } from './scenes/MainMenu';
import { Game } from './scenes/Game';
import { GameOver } from './scenes/GameOver';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#1b1f3b',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: GRAVITY },
      debug: false,
    },
  },
  input: {
    activePointers: 3, // varios dedos para los controles táctiles
  },
  scene: [Boot, Preloader, MainMenu, Game, GameOver],
};

export default new Phaser.Game(config);
