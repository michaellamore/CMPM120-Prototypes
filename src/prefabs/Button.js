class Button extends ImmovableBody{
  constructor(scene, x, y, texture, frame, color="", id=0, level=0){
    super(scene, x, y, texture, frame);
    this.body.setSize(32, 28, false);
    this.x -= 8;
    this.y -= 24;
    this.color = color;
    this.id = id;
    this.level = level;
    this.playerOverlapping = false;

    let randInt = Phaser.Math.Between(0, 4);
    this.setFrame(`${this.color}${randInt}`);
  }

  update(){
    this.body.debugBodyColor = 0xa53030;
    this.setTint(0x757575);
    this.playerOverlapping = false;
  }

  isOverlapping(){
    this.playerOverlapping = true;
    this.body.debugBodyColor = 0x468232;
    this.clearTint();
  }
}