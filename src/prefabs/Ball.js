class Ball extends Phaser.Physics.Arcade.Sprite{
  constructor(scene, x, y, texture, frame, player){
    super(scene, x, y, texture, frame);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5);
    this.player = player;
    this.scale = 0.75;

    this.velX = 400;
    this.velY = 1000;
    this.acceleration = 1500;
    this.drag = 2000;
    this.jump_velocity = -1000;
    this.setMaxVelocity(this.velX, this.velY)
    this.setTint(0x808080);
  }
  
  throw(lastAction){
    if (lastAction == "left") {
      this.body.setAccelerationX(-this.acceleration);
      this.body.setVelocityY(-this.velX);
    } else if (lastAction == "right"){
      this.body.setAccelerationX(this.acceleration);
      this.body.setVelocityY(this.velX);
    } else{
      this.body.setAccelerationX(0);
    }
    this.body.setDragX(this.drag);
    this.body.setVelocityY(this.jump_velocity);
  }

  update(){
    if(this.body.touching.down){
      this.body.setAccelerationX(0);
    }
    if(Phaser.Input.Keyboard.JustDown(keyAction)){
      this.player.teleport(this.x, this.y -10);
      this.player.scale = 1;
      this.destroy();
    }
  }
}