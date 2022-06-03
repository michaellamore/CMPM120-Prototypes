'use strict';

let config = {
  type: Phaser.AUTO,
  // This width/height makes it easier to scale up to 720p or 1080p
  width: 640,
  height: 360,
  parent: "phaser-canvas",
  pixelArt: true,
  zoom: 2,
  fps:{
    target: 60,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {y: 1400},
      tileBias: 8,
      debug: false
    }
  },
  scene: [Menu, Catch]
}

let game = new Phaser.Game(config);

let keyLeft, keyRight, keyJump, keyJump2, keySplit, keySwap, keyReset, keyZoom;
const width = config.width;
const height = config.height;
const padding = 30;

const tints = {
  red: 0x9a4e6c,
  blue: 0x4f8fba,
  purple: 0x7a367b
}