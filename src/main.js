'use strict';

let config = {
  type: Phaser.AUTO,
  width: 640,
  height: 360,
  parent: "phaser-canvas",
  pixelArt: true,
  zoom: 1,
  fps:{
    // target: 60,
    // forceSetTimeOut: true
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {y: 0},
      debug: false
    }
  },
  dom:{
    createContainer: true
  },
  scene: [Tetris]
}

let game = new Phaser.Game(config);

let keyLeft, keyRight, keyUp, keyDown, keyAction, cursors;
const width = config.width;
const height = config.height;
const padding = 30;