class Menu extends Phaser.Scene {
  constructor() {
    super ("menuScene");
  }

  preload(){
    this.load.path = './assets/'
    this.load.spritesheet('menuPlay', 'menuPlay.png', {frameWidth: 160, frameHeight: 80});
    this.load.audio('split', 'split.wav');

    // Player
    this.load.spritesheet('playerBlueSheet', 'playerBlueSheet.png', {frameWidth: 48, frameHeight: 48});
    this.load.spritesheet('playerPurpleSheet', 'playerPurpleSheet.png', {frameWidth: 48, frameHeight: 48});
    this.load.spritesheet('playerRedSheet', 'playerRedSheet.png', {frameWidth: 48, frameHeight: 48});

    // Buttons, doors, and other objects
    this.load.image('resetPanel', 'resetPanel.png');
    this.load.spritesheet('paintDoorSheet', 'paintDoorSheet.png', {frameWidth: 24, frameHeight: 24});
    this.load.atlas('buttonSheet', 'buttonSheet.png', 'buttonSheet.json');

    // Tileset things
    this.load.image('paintBG', 'paint.png');
    this.load.image('tiles', "tiles.png");
    this.load.tilemapTiledJSON('tilemap', 'newLevels.json');
    this.load.json('levelJSON', 'newLevels.json')
  }

  create() {
    this.generateAnims();

    this.playButton = this.add.sprite(width/2, 130, 'menuPlay').setOrigin(0.5).setInteractive();
    this.playButton.setTint(0x7d7d7d);
    this.tempTitle = this.add.text(width/2, 60, 'MISSING COLORS', {fontSize: "30px"}).setOrigin(0.5);


    // On mouse input, do stuff
    this.playButton.on("pointerover", () => {
      this.playButton.setTint(0xffffff);
    })
    this.playButton.on("pointerout", () => {
      this.playButton.setTint(0x7d7d7d);
    })
    this.playButton.on("pointerup", () => {
      this.playButton.anims.play('pressedPlay');
      this.sound.play('split');
      this.transitionToPlay();
    })
  }

  transitionToPlay(){
    this.tween = this.tweens.add({
      targets: [this.playButton, this.tempTitle],
      y: '-=400',
      ease: "Sine.easeInOut",
      duration: 1000,
      repeat: 0,
      yoyo: false
    })
    this.tween.on('complete', () => {
      this.scene.start(this.scene.start("Catch"));
    });
  }

  generateAnims(){
    // Menu
    this.anims.create({
      key: 'pressedPlay', 
      frames: this.anims.generateFrameNumbers('menuPlay', {start: 0, end: 1, first: 0}),
      frameRate: 2,
    });

    // Players
    // Blue
    this.anims.create({
      key: 'bluePlayerIdle', 
      frames: this.anims.generateFrameNumbers('playerBlueSheet', {start: 0, end: 2, first: 0}),
      frameRate: 2,
      repeat: -1
    });
    this.anims.create({
      key: 'bluePlayerRun', 
      frames: this.anims.generateFrameNumbers('playerBlueSheet', {start: 4, end: 7, first: 4}),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'bluePlayerJump', 
      frames: this.anims.generateFrameNumbers('playerBlueSheet', {start: 8, end: 9, first: 8}),
      frameRate: 8,
    });
    this.anims.create({
      key: 'bluePlayerWalljump', 
      frames: this.anims.generateFrameNumbers('playerBlueSheet', {start: 12, end: 13, first: 12}),
      frameRate: 8,
    });
    this.anims.create({
      key: 'bluePlayerInactive', 
      frames: this.anims.generateFrameNumbers('playerBlueSheet', {start: 16, end: 16, first: 16}),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'bluePlayerDie', 
      frames: this.anims.generateFrameNumbers('playerBlueSheet', {start: 20, end: 23, first: 20}),
      frameRate: 10,
    });

    // Purple
    this.anims.create({
      key: 'purplePlayerIdle', 
      frames: this.anims.generateFrameNumbers('playerPurpleSheet', {start: 0, end: 2, first: 0}),
      frameRate: 2,
      repeat: -1
    });
    this.anims.create({
      key: 'purplePlayerRun', 
      frames: this.anims.generateFrameNumbers('playerPurpleSheet', {start: 4, end: 7, first: 4}),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'purplePlayerJump', 
      frames: this.anims.generateFrameNumbers('playerPurpleSheet', {start: 8, end: 9, first: 8}),
      frameRate: 8,
    });
    this.anims.create({
      key: 'purplePlayerWalljump', 
      frames: this.anims.generateFrameNumbers('playerPurpleSheet', {start: 12, end: 13, first: 12}),
      frameRate: 8,
    });
    this.anims.create({
      key: 'purplePlayerInactive', 
      frames: this.anims.generateFrameNumbers('playerPurpleSheet', {start: 16, end: 16, first: 16}),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'purplePlayerDie', 
      frames: this.anims.generateFrameNumbers('playerPurpleSheet', {start: 20, end: 23, first: 20}),
      frameRate: 10,
    });

    // Red
    this.anims.create({
      key: 'redPlayerIdle', 
      frames: this.anims.generateFrameNumbers('playerRedSheet', {start: 0, end: 2, first: 0}),
      frameRate: 2,
      repeat: -1
    });
    this.anims.create({
      key: 'redPlayerRun', 
      frames: this.anims.generateFrameNumbers('playerRedSheet', {start: 4, end: 7, first: 4}),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'redPlayerJump', 
      frames: this.anims.generateFrameNumbers('playerRedSheet', {start: 8, end: 9, first: 8}),
      frameRate: 8,
    });
    this.anims.create({
      key: 'redPlayerWalljump', 
      frames: this.anims.generateFrameNumbers('playerRedSheet', {start: 12, end: 13, first: 12}),
      frameRate: 8,
    });
    this.anims.create({
      key: 'redPlayerInactive', 
      frames: this.anims.generateFrameNumbers('playerRedSheet', {start: 16, end: 16, first: 16}),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'redPlayerDie', 
      frames: this.anims.generateFrameNumbers('playerRedSheet', {start: 20, end: 23, first: 20}),
      frameRate: 10,
    });


    // Doors
    this.anims.create({
      key: 'blueDoorIdle', 
      frames: this.anims.generateFrameNumbers('paintDoorSheet', {start: 0, end: 6, first: 0}),
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: 'blueDoorClose', 
      frames: this.anims.generateFrameNumbers('paintDoorSheet', {start: 7, end: 12, first: 7}),
      frameRate: 16,
    });
    this.anims.create({
      key: 'blueDoorOpen', 
      frames: this.anims.generateFrameNumbers('paintDoorSheet', {start: 12, end: 7, first: 12}),
      frameRate: 16,
    });
    this.anims.create({
      key: 'redDoorIdle', 
      frames: this.anims.generateFrameNumbers('paintDoorSheet', {start: 14, end: 20, first: 14}),
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: 'redDoorClose', 
      frames: this.anims.generateFrameNumbers('paintDoorSheet', {start: 21, end: 26, first: 21}),
      frameRate: 16,
    });
    this.anims.create({
      key: 'redDoorOpen', 
      frames: this.anims.generateFrameNumbers('paintDoorSheet', {start: 26, end: 21, first: 26}),
      frameRate: 16,
    });
    this.anims.create({
      key: 'purpleDoorIdle', 
      frames: this.anims.generateFrameNumbers('paintDoorSheet', {start: 28, end: 34, first: 28}),
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: 'purpleDoorClose', 
      frames: this.anims.generateFrameNumbers('paintDoorSheet', {start: 35, end: 40, first: 35}),
      frameRate: 16,
    });
    this.anims.create({
      key: 'purpleDoorOpen', 
      frames: this.anims.generateFrameNumbers('paintDoorSheet', {start: 40, end: 35, first: 40}),
      frameRate: 16,
    });
  }
}