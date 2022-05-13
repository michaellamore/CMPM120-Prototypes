class Spawn extends ImmovableBody{
  constructor(scene, x, y, texture, frame){
    super(scene, x, y, texture, frame);
    this.body.setSize(4, 4, false);
    this.body.debugBodyColor = 0xd0da91;
    this.alpha = 0;
  }

  getPos(){
    let pos = new Phaser.Math.Vector2(this.x, this.y)
    return pos;
  }
}