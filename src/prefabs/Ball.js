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
    this.drag = 1000;
    this.jump_velocity = -1000;
    this.setMaxVelocity(this.velX, this.velY)
    this.setTint(0x808080);

    // When initializing this object, check the last known input to get direction of throw
    if(cursors.left.isDown) {
      this.currentAction = "left";
    } else if(cursors.right.isDown) {
      this.currentAction = "right";
    } else { // Standing still
      this.currentAction = "none";
    }
  }
  
  throw(){
    if (this.currentAction == "left") {
      this.body.setAccelerationX(-this.acceleration);
      this.body.setVelocityY(-this.velX);
    } else if (this.currentAction == "right"){
      this.body.setAccelerationX(this.acceleration);
      this.body.setVelocityY(this.velX);
    } else{
      this.body.setAccelerationX(0);
    }
    this.body.setDragX(this.drag);
    this.body.setVelocityY(this.jump_velocity);
  }

  update(){
    // If it hits ANYTHING other than player, stop its movement
    if(this.body.touching.down || this.body.touching.left || this.body.touching.right){
      this.body.setAccelerationX(0);
    }
  }
}