class Player extends Phaser.Physics.Arcade.Sprite{
  constructor(scene, x, y, texture, frame, ground){
    super(scene, x, y, texture, frame);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.scene = scene;
    this.isSmall = false;
    this.setOrigin(0.5);
    this.setDepth(1);
    this.body.setSize(16, 16, false);
    this.body.setOffset(0, 3);
    this.body.debugBodyColor = 0x468232;
    this.ground = ground;
    this.raycastGroup = this.scene.add.group({runChildUpdate: true});
    this.addRaycasts();

    this.growthSpeed = 300; // in milliseconds
    // Variables to change the feel of player movement
    this.velXBig = 160;
    this.velYBig = 385;
    this.velJumpBig = -385;
    this.accelBig = 800;
    this.dragBig = 900;

    this.velXSmall = 80;
    this.velYSmall = 300;
    this.velJumpSmall = -300;
    this.accelSmall = 800;
    this.dragSmall = 900;

    this.setMaxVelocity(this.velXBig, this.velYBig);
  }
  
  update(){
    if(this.isSmall){
      // Left and right
      if(cursors.left.isDown) {
        this.flipX = true;
        this.body.setAccelerationX(-this.accelSmall);
      } else if(cursors.right.isDown) {
        this.flipX = false;
        this.body.setAccelerationX(this.accelSmall);
      } else { // Standing still
        this.body.setAccelerationX(0);
        this.body.setDragX(this.dragSmall);
      }
      // Jumping
      if(this.body.onFloor() && Phaser.Input.Keyboard.JustDown(cursors.up) && !keyAction.isDown) {
        this.body.setVelocityY(this.velJumpSmall);
      }
    } else {
      // Left and right
      if(cursors.left.isDown) {
        this.flipX = true;
        this.body.setAccelerationX(-this.accelBig);
      } else if(cursors.right.isDown) {
        this.flipX = false;
        this.body.setAccelerationX(this.accelBig);
      } else { // Standing still
        this.body.setAccelerationX(0);
        this.body.setDragX(this.dragBig);
      }
      // Jumping
      if(this.body.onFloor() && Phaser.Input.Keyboard.JustDown(cursors.up) && !keyAction.isDown) {
        this.body.setVelocityY(this.velJumpBig);
      }
    }
  }

  teleport(x, y){
    this.x = x;
    this.y = y;
  }

  changeScale(initial, final){
    if(final == 1){
      this.isSmall = false;
      this.setMaxVelocity(this.velXBig, this.velYBig);
    }
    if(final < 1){
      this.isSmall = true;
      this.setMaxVelocity(this.velXSmall, this.velYSmall);
    }

    this.scene.tweens.add({
      targets: this,
      scale: {from: initial, to: final},
      ease: "Sine.easeInOut",
      duration: this.growthSpeed,
      repeat: 0,
      yoyo: false
    })
  }

  addRaycasts(){
    // Raycast is an Arcade Physics body with no texture. Extra params are target to follow, size, and offset (for placement) 
    let ray1 = new Raycast(this.scene, this.x, this.y, null, 0, this, [6, 4], [5, 14]);
    let ray2 = new Raycast(this.scene, this.x, this.y, null, 0, this, [6, 4], [21, 14]);
    let ray3 = new Raycast(this.scene, this.x, this.y, null, 0, this, [4, 6], [14, 6]);
    let ray4 = new Raycast(this.scene, this.x, this.y, null, 0, this, [4, 6], [14, 22]);
    this.raycastGroup.addMultiple([ray1, ray2, ray3, ray4]);
    this.scene.physics.add.overlap(this.raycastGroup, this.ground, (raycast, tile)=>{
      // If the tile the raycast is hitting is actual ground, tell it that it's colliding
      if(this.ground.culledTiles.includes(tile)) raycast.isColliding();
    });
  }

  checkRaycasts(){
    // Left, right, up, down
    let array = [];
    Phaser.Actions.Call(this.raycastGroup.getChildren(), (raycast)=>{ 
      array.push(raycast.colliding);
    });
    return array;
  }
}