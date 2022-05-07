class Spawn extends Obstacle{
  constructor(scene, x, y, texture, frame){
    super(scene, x, y, texture, frame);
    this.alpha = 0;
  }

  getPos(){
    let pos = new Phaser.Math.Vector2(this.x, this.y)
    return pos;
  }
}