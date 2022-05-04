class StickyCube extends Phaser.Physics.Arcade.Sprite{
  constructor(scene, x, y, texture, frame, player){
    super(scene, x, y, texture, frame);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5);
    this.setDepth(1);
    this.setTint(0xff0000);
    this.player = player;
    this.target = new Phaser.Math.Vector2();
    this.taken = false;

    this.acceleration = 1500;
    this.drag = 2000;
    this.jumpVelocity = -1000;
    this.velX = 400;
    this.velY = 1000;
    this.setMaxVelocity(this.velX, this.velY)
  }

  update(){
    if(this.target!=null && this.taken){
      this.x = this.player.x + this.target.x;
      this.y = this.player.y + this.target.y;
    }
    if(this.body.touching.down){
      this.body.setAccelerationX(0);
    }
  }

  setTarget(x, y){
    this.body.setEnable(false);
    this.body.setAllowGravity(false);
    this.target = new Phaser.Math.Vector2(x, y);
  }

  throw(){
    this.body.setAccelerationX(0);
    this.body.setAccelerationY(0);
    this.body.setEnable(true);
    this.body.touching.down = false;
    this.body.setAllowGravity(true);
    let offset = 20;
    if (this.target.x <= -48) {
      this.x -= offset;
      this.body.setAccelerationX(-this.acceleration);
      this.body.setVelocityX(this.jumpVelocity);
    } else if (this.target.x >= 48){
      this.x += offset;
      this.body.setAccelerationX(this.acceleration);
      this.body.setVelocityX(-this.jumpVelocity);
    } else{
      this.y -= offset;
      this.body.setAccelerationY(this.acceleration);
      this.body.setVelocityY(this.jumpVelocity);
    }
    this.target = null;
    this.body.setDragX(this.drag);
  }
}