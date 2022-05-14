class Menu extends Phaser.Scene {
  constructor() {
    super ("menuScene");
  }

  preload(){
    this.load.path = './assets/'
    this.load.spritesheet('menuPlay', 'menuPlay.png', {frameWidth: 160, frameHeight: 80});
    this.load.audio('split', 'split.wav');
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
  }
}