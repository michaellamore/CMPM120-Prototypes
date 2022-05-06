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
    this.body.debugBodyColor = 0x468232;
    // Variables to change the feel of player movement
    this.velX = 180;
    this.velY = 550;
    this.acceleration = 700;
    this.drag = 900;
    this.jump_velocity = -420;
    this.scaleSpeed = 300; // in milliseconds
    this.setMaxVelocity(this.velX, this.velY);

    this.isSmall = false;

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

    this.isSmall = false;
    if(this.scale < 1) this.isSmall = true;
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
    let ray1 = new Raycast(this.scene, this.x, this.y, null, 0, this, [6, 4], [5, 14]);
    let ray2 = new Raycast(this.scene, this.x, this.y, null, 0, this, [6, 4], [21, 14]);
    let ray3 = new Raycast(this.scene, this.x, this.y, null, 0, this, [4, 6], [14, 6]);
    let ray4 = new Raycast(this.scene, this.x, this.y, null, 0, this, [4, 6], [14, 22]);
    this.raycastGroup.addMultiple([ray1, ray2, ray3, ray4]);
    this.scene.physics.add.overlap(this.raycastGroup, this.ground, (raycast, tile)=>{
      if(this.ground.culledTiles.includes(tile)) raycast.isColliding();
    });
  }

  checkRaycasts(){
    // Left, right, up, down
    let array = [];
    Phaser.Actions.Call(this.raycastGroup.getChildren(), (raycast)=>{ 
      array.push(raycast.colliding);
    });
    if(array[0] && array[1]) return false
    if(array[2] && array[3]) return false
    return true
  }
}