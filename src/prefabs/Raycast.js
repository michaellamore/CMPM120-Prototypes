class Raycast extends Phaser.Physics.Arcade.Sprite{
  constructor(scene, x, y, texture, frame, target, size=[],  offset=[]){
    super(scene, x, y, texture, frame);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setSize(size[0], size[1], false);
    this.body.setOffset(0, 0);
    this.body.immovable = true;
    this.body.allowGravity = false;
    this.alpha = 0;
    this.target = target;
    this.offset = offset;
    this.colliding = false;
  }

  update(){
    this.body.debugBodyColor = 0x468232;
    this.colliding = false;

    this.x = this.target.x + this.offset[0];
    this.y = this.target.y + this.offset[1];
  }

  isColliding(){
    this.body.debugBodyColor = 0xa53030;
    this.colliding = true;
  }
}