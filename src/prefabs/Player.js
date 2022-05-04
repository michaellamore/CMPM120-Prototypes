class Player extends Phaser.Physics.Arcade.Sprite{
  constructor(scene, x, y, texture, frame){
    super(scene, x, y, texture, frame);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5);
    this.setDepth(1);
    this.velX = 400;
    this.velY = 1000;
    this.acceleration = 1500;
    this.drag = 2000;
    this.jump_velocity = -870;
    this.setMaxVelocity(this.velX, this.velY);
  }
  
  update(){
    // Left and right
    if(cursors.left.isDown) {
      this.body.setAccelerationX(-this.acceleration);
    } else if(cursors.right.isDown) {
      this.body.setAccelerationX(this.acceleration);
    } else {
      this.body.setAccelerationX(0);
      this.body.setDragX(this.drag);
    }

    // Jumping
    if(this.body.touching.down && Phaser.Input.Keyboard.JustDown(cursors.up) && !keyAction.isDown) {
      this.body.setVelocityY(this.jump_velocity);
    }
  }

  teleport(x, y){
    this.x = x;
    this.y = y;
  }

  changeBodySize(w, h, offsetX, offsetY){
    this.body.setSize(w, h, false);
    this.body.setOffset(offsetX, offsetY);
  }

  resetBodySize(){
    this.body.setSize(48, 48);
    this.body.setOffset(0, 0);
  }
}