'use strict';

let config = {
  type: Phaser.AUTO,
  // This width/height makes it easier to scale up to 720p or 1080p
  width: 320,
  height: 180,
  parent: "phaser-canvas",
  pixelArt: true,
  zoom: 2,
  fps:{
    target: 60,
    forceSetTimeOut: true
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {y: 0},
      tileBias: 8,
      debug: false
    }
  },
  scene: [Catch]
}

let game = new Phaser.Game(config);

let keyLeft, keyRight, keyUp, keyDown, keyAction, keyReset, cursors;
const width = config.width;
const height = config.height;
const padding = 30;