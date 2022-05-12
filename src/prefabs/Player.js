class Player extends Phaser.Physics.Arcade.Sprite{
  constructor(scene, x, y, texture, frame){
    super(scene, x, y, texture, frame);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5);
    this.setDepth(1);
    this.body.setSize(16, 16, false);
    this.body.setOffset(0, 3);
    this.body.debugBodyColor = 0x468232;

    // Reference to stuff from the scene
    this.scene = scene;
    this.ground = this.scene.ground;

    // Raycast stuff
    this.playerRaycasts = this.scene.add.group({runChildUpdate: true});
    this.scene.physics.add.overlap(this.playerRaycasts, this.ground, (raycast, tile)=>{
      // If the tile the raycast is hitting is actual ground, tell it that it's colliding
      if(this.ground.culledTiles.includes(tile)){ raycast.isColliding(); }
    });
    this.addRaycasts();

    // Flags
    this.isActive = true;
    this.canJump = true;
    this.canThrow = true;
    this.canTeleport = true;
    
    // Variables to change player feel
    this.velXBig = 150;
    this.velYBig = 400;
    this.velJumpBig = -400;
    this.accelBig = 800;
    this.dragXBig = 900;
    this.dragYBig = 1300;

    this.setMaxVelocity(this.velXBig, this.velYBig);

    this.currentColor = "purple";
    if(this.currentColor == "red") this.setTint(0xa53030);
    if(this.currentColor == "blue") this.setTint(0x4f8fba);
    if(this.currentColor == "purple") this.setTint(0xa23e8c);

    this.state = "IDLE";
    this.availableStates = ["IDLE", "MOVE", "JUMP", "WALLJUMP", "BUSY"];
  }
  
  update(){
    // Change player tint depending on what player is and if they're active
    if(this.currentColor == "red") this.setTint(0xa53030);
    if(this.currentColor == "blue") this.setTint(0x4f8fba);
    if(this.currentColor == "purple") this.setTint(0xa23e8c);
    if(!this.isActive){
      this.body.setAccelerationX(0);
      this.body.setDragX(this.dragXBig);
      this.setTexture('playerInactive');
      return;
    } 
    this.setTexture('player');

    let raycast = this.checkRaycasts();
    if(this.state == "BUSY") this.BUSY();
    else if (this.state == "MOVE") this.MOVE(raycast);
    else if (this.state == "JUMP") this.JUMP(raycast);
    else if (this.state == "WALLJUMP") this.WALLJUMP(raycast);
    else this.IDLE(raycast);
  }

  IDLE(raycast){
    // Refresh abilities when on the floor (don't use raycast to check it)
    if(this.body.onFloor()){
      this.canJump = true;
    }

    if(Phaser.Input.Keyboard.JustDown(keyUp)){
      if(this.canJump || raycast[3]) this.transitionTo("JUMP");
      else if(!this.body.onFloor() && (raycast[0] || raycast[1] || this.body.onWall())) this.transitionTo("WALLJUMP");
    } else if(keyLeft.isDown || keyRight.isDown) this.transitionTo("MOVE");
    
  }

  MOVE(raycast){
    // Refresh abilities when on the floor (don't use raycast to check it)
    if(this.body.onFloor()){
      this.canJump = true;   
    }

    this.body.setAccelerationX(0);
    this.body.setDragX(this.dragXBig);

    if(keyLeft.isDown) {
      this.flipX = true;
      this.body.setAccelerationX(-this.accelBig);
    } else if(keyRight.isDown) {
      this.flipX = false;
      this.body.setAccelerationX(this.accelBig);
    }

    // if(this.body.onWall() && (keyLeft.isDown || keyRight.isDown) && !this.body.onFloor()){
    //   this.body.setDragY(this.dragYBig);
    // } else {
    //   this.body.setDragY(0);
    // }

    // Jumping
    if(Phaser.Input.Keyboard.JustDown(keyUp)){
      if(this.canJump || raycast[3]) this.transitionTo("JUMP");
      else if(!this.body.onFloor() && (raycast[0] || raycast[1] || this.body.onWall())) this.transitionTo("WALLJUMP");
    }

    if(this.body.velocity.x == 0 && this.body.velocity.y == 0 && this.body.acceleration.x == 0 && this.body.acceleration.y == 0) {
      this.transitionTo("IDLE");
    }
      
  }

  JUMP(raycast){
    this.body.setVelocityY(this.velJumpBig);
    this.canJump = false;

    if(!this.body.onFloor() && (raycast[0] || raycast[1] || this.body.onWall())) this.transitionTo("WALLJUMP");
    this.transitionTo("MOVE");
  }

  WALLJUMP(raycast){
    if(raycast[0]) {
      this.body.setAccelerationX(this.accelBig);
      this.body.setVelocityX(this.velXBig);
    }
    else if(raycast[1]){
      this.body.setAccelerationX(-this.accelBig);
      this.body.setVelocityX(-this.velXBig);
    }
    this.body.setVelocityY(this.velJumpBig);
    this.transitionTo("MOVE");
  }

  BUSY(){
    
  }

  transitionTo(state){
    // If the desired state is valid, continue
    if(this.availableStates.includes(state)){
      // console.log(`Transitioning to ${state}`);
      this.state = state;
    } else {
      console.error(`State "${state}" is not valid`);
    }
  }

  teleport(x, y){
    this.body.setVelocityY(this.velJumpBig/3);
    this.x = x;
    this.y = y;
  }

  addRaycasts(){
    // Raycast is an Arcade Physics body with no texture. Extra params are target to follow, size, and offset (for placement) 
    let ray1 = new Raycast(this.scene, this.x, this.y, null, 0, this, [6, 14], [2, 10]);
    let ray2 = new Raycast(this.scene, this.x, this.y, null, 0, this, [6, 14], [24, 10]);
    let ray3 = new Raycast(this.scene, this.x, this.y, null, 0, this, [14, 6], [9, 3]);
    let ray4 = new Raycast(this.scene, this.x, this.y, null, 0, this, [14, 16], [9, 25]);
    this.playerRaycasts.addMultiple([ray1, ray2, ray3, ray4]);
  }

  // Initialize this using a variable, or else the raycast check doesn't work properly. Idk why lol, took 2 hours to figure out
  checkRaycasts(){
    // Left, right, up, down
    let array = [];
    Phaser.Actions.Call(this.playerRaycasts.getChildren(), (raycast)=>{ array.push(raycast.getColliding()); });
    return array;
  }

  customDestroy(){
    let raycast = this.playerRaycasts.getChildren();
    raycast[3].destroy();
    raycast[2].destroy();
    raycast[1].destroy();
    raycast[0].destroy();
    this.destroy();
  }
}