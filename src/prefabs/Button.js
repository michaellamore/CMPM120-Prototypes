class Button extends ImmovableBody{
  constructor(scene, x, y, texture, frame, color="", id=0, level=0){
    super(scene, x, y, texture, frame);
    this.body.setSize(32, 28, false);
    this.x -= 8;
    this.y -= 24;
    this.color = color;
    this.id = id;
    this.level = level;
    this.playerOverlap = false; // flag for when a valid player is in the overlap

    let randInt = Phaser.Math.Between(0, 4);
    this.setFrame(`${this.color}${randInt}`);

    this.lightOffset = new Phaser.Math.Vector2(16, 16);
  }

  update(){
    this.body.debugBodyColor = 0xa53030;
    this.playerOverlap = false;
  }

  isOverlapping(){
    this.playerOverlap = true;
    this.body.debugBodyColor = 0x468232;
  }
}