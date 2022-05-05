class Player extends Phaser.Physics.Arcade.Sprite{
  constructor(scene, x, y, texture, frame){
    super(scene, x, y, texture, frame);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.scene = scene;
    this.setOrigin(0.5);
    this.setDepth(1);
    // Variables to change the feel of player movement
    this.velX = 400;
    this.velY = 800;
    this.acceleration = 1500;
    this.drag = 2000;
    this.jump_velocity = -650;
    this.scaleSpeed = 300; // in milliseconds

    this.setMaxVelocity(this.velX, this.velY);
  }
  
  update(){
    // Left and right
    if(cursors.left.isDown) {
      this.body.setAccelerationX(-this.acceleration);
    } else if(cursors.right.isDown) {
      this.body.setAccelerationX(this.acceleration);
    } else { // Standing still
      this.body.setAccelerationX(0);
      this.body.setDragX(this.drag);
    }

    // Jumping
    if(this.body.onFloor() && Phaser.Input.Keyboard.JustDown(cursors.up) && !keyAction.isDown) {
      this.body.setVelocityY(this.jump_velocity);
    }
  }

  teleport(x, y){
    this.x = x;
    this.y = y;
  }

  changeScale(initial, final){
    this.scene.tweens.add({
      targets: this,
      scale: {from: initial, to: final},
      ease: "Sine.easeInOut",
      duration: this.scaleSpeed,
      repeat: 0,
      yoyo: false
    })
  }
}