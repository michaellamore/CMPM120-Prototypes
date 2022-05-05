class Button extends Phaser.GameObjects.Sprite{
  constructor(scene, x, y, texture, frame, paramFunc){
    super(scene, x, y, texture, frame);
    scene.add.existing(this);
    this.setOrigin(0.5, 0.5);
    this.setDepth(10);
    this.setInteractive();
    this.setTint(0x7d7d7d);

    this.on("pointerover", () => {
      this.setTint(0xffffff);
    })
    this.on("pointerout", () => {
      this.setTint(0x7d7d7d);
    })
    this.on("pointerup", () => {
      this.anims.play('pressedPlay')
      if(paramFunc && (typeof paramFunc == "function")) paramFunc();
    })
  }
}