class Menu extends Phaser.Scene {
  constructor() {
    super ("menuScene");
  }

  preload(){
    this.load.path = './assets/'
    this.load.spritesheet('menuPlay', 'menuPlay.png', {frameWidth: 160, frameHeight: 80});
    this.load.audio('split', 'split.wav');

    this.load.spritesheet('paintDoorSheet', 'paintDoorSheet.png', {frameWidth: 24, frameHeight: 24});

    this.load.atlas('buttonSheet', 'buttonSheet.png', 'buttonSheet.json');
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
    this.anims.create({
      key: 'pressedPlay', 
      frames: this.anims.generateFrameNumbers('menuPlay', {start: 0, end: 1, first: 0}),
      frameRate: 2,
    });
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