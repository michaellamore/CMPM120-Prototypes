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
    this.colliding = false;
    this.x = this.target.x + this.offset[0];
    this.y = this.target.y + this.offset[1];
  }
}

class Player extends Phaser.Physics.Arcade.Sprite{
  constructor(scene, x, y, texture, frame, ground){
    super(scene, x, y, texture, frame);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.scene = scene;
    this.setOrigin(0.5);
    this.setDepth(1);
    this.body.setSize(16, 16, false);
    this.body.setOffset(0, 3);
    // Variables to change the feel of player movement
    this.velX = 180;
    this.velY = 550;
    this.acceleration = 700;
    this.drag = 900;
    this.jump_velocity = -420;
    this.scaleSpeed = 300; // in milliseconds
    this.setMaxVelocity(this.velX, this.velY);

    this.raycastGroup = this.scene.add.group({runChildUpdate: true});
    this.ground = ground;
    this.addRaycasts();
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
    if(this.body.onFloor() && this.body.onCeiling()) return; // If the player perfectly fits in the current space, don't change scale
    this.scene.tweens.add({
      targets: this,
      scale: {from: initial, to: final},
      ease: "Sine.easeInOut",
      duration: this.scaleSpeed,
      repeat: 0,
      yoyo: false
    })
  }

  addRaycasts(){
    // Raycast is an Arcade Physics body with no texture. Extra params are target to follow, size, and offset (for placement) 
    let ray1 = new Raycast(this.scene, this.x, this.y, null, 0, this, [10, 4], [0, 14]);
    // let ray2 = new Raycast(this.scene, this.x, this.y, null, 0, this, [10, 4], [22, 14]);
    // let ray3 = new Raycast(this.scene, this.x, this.y, null, 0, this, [4, 10], [14, 1]);
    // let ray4 = new Raycast(this.scene, this.x, this.y, null, 0, this, [4, 10], [14, 23]);
    // this.raycastGroup.addMultiple([ray1, ray2, ray3, ray4]);
    this.raycastGroup.add(ray1);
    this.scene.physics.add.overlap(this.raycastGroup, this.ground, (raycast, groundTile)=>{
      console.log("raycast is overlapping");
    });
  }
}