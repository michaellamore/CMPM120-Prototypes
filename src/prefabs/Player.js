class Player extends Phaser.Physics.Arcade.Sprite{
  constructor(scene, x, y, texture, frame, group, ground){
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
    this.group = group
    this.ground = ground;

    // Raycast stuff
    this.playerRaycasts = this.scene.add.group({runChildUpdate: true});
    this.scene.physics.add.overlap(this.playerRaycasts, this.ground, (raycast, tile)=>{
      // If the tile the raycast is hitting is actual ground, tell it that it's colliding
      if(this.ground.culledTiles.includes(tile)){ raycast.isColliding(); }
    });
    this.addRaycasts();

    // Flags
    this.isSmall = false;
    this.canThrow = true;
    this.canTeleport = true;

    
    // Variables to change the feel of player movement
    this.wallJumps = 1;
    this.throwDelay = 50;
    this.teleportDelay = 160;
    this.growthSpeed = 300; // in milliseconds
    // Player is big
    this.velXBig = 150;
    this.velYBig = 385;
    this.velJumpBig = -385;
    this.accelBig = 800;
    this.dragBig = 900;
    // Player is small
    this.velXSmall = 80;
    this.velYSmall = 300;
    this.velJumpSmall = -300;
    this.accelSmall = 800;
    this.dragSmall = 900;

    this.setMaxVelocity(this.velXBig, this.velYBig);
  }
  
  update(){
    let raycasts = this.checkRaycasts();

    // Player on floor = reset any resources that movement uses
    if(this.body.onFloor()){
      this.wallJumps = 1;
    }
    // Reset = going back to spawn and retrieving ball if it's out
    if (Phaser.Input.Keyboard.JustDown(keyReset)){
      if(this.group.isFull()) this.retrieveBall();
      this.teleport(this.currentSpawn.x, this.currentSpawn.y);
    };
    // If arrow key is used, throw ball or teleport to it
    if (Phaser.Input.Keyboard.JustDown(cursors.left) || Phaser.Input.Keyboard.JustDown(cursors.right) || 
    Phaser.Input.Keyboard.JustDown(cursors.up) || Phaser.Input.Keyboard.JustDown(cursors.down)){   
      if(!this.group.isFull() && this.canThrow){
        this.throwBall();
      } else if (this.group.isFull() && this.canTeleport){
        this.teleportToBall();
      }
    }
    // Retrieve the ball if it's out
    if(Phaser.Input.Keyboard.JustDown(keyAction) && this.group.isFull()){
      this.retrieveBall();
    }

    if(this.isSmall){ // If player is small
      // Left and right
      if(keyLeft.isDown) {
        this.flipX = true;
        this.body.setAccelerationX(-this.accelSmall);
      } else if(keyRight.isDown) {
        this.flipX = false;
        this.body.setAccelerationX(this.accelSmall);
      } else { // Standing still
        this.body.setAccelerationX(0);
        this.body.setDragX(this.dragSmall);
      }
      // Jumping
      if(Phaser.Input.Keyboard.JustDown(keyUp)){
        // If (near) floor
        if(this.body.onFloor() || raycasts[3]){
          this.body.setVelocityY(this.velJumpSmall);
        }
      }
    } else { // If the player is big again
      if(keyLeft.isDown) {
        this.flipX = true;
        this.body.setAccelerationX(-this.accelBig);
      } else if(keyRight.isDown) {
        this.flipX = false;
        this.body.setAccelerationX(this.accelBig);
      } else { // Standing still
        this.body.setAccelerationX(0);
        this.body.setDragX(this.dragBig);
      }
      // Jumping
      if(Phaser.Input.Keyboard.JustDown(keyUp)){
        // If (near) floor
        if(this.body.onFloor() || raycasts[3]){
          this.body.setVelocityY(this.velJumpBig);
        }
        // If (near) wall
        if((this.body.onWall() || raycasts[0] || raycasts[1]) && !this.body.onFloor()){
          if(this.wallJumps <= 0) return;
          this.body.setVelocityY(this.velJumpSmall);
          this.wallJumps--;
        }
      }
    }
  }

  teleport(x, y){
    this.body.setVelocityY(this.velJumpSmall/3);
    this.x = x;
    this.y = y;
  }

  changeScale(initial, final){
    if(final == 1){
      this.canThrow = false;
      this.isSmall = false;
      this.setMaxVelocity(this.velXBig, this.velYBig);
      this.scene.time.addEvent({
        delay: this.throwDelay, 
        callback: ()=>{ this.canThrow = true },
      })
    }
    if(final < 1){
      this.canTeleport = false;
      this.isSmall = true;
      this.setMaxVelocity(this.velXSmall, this.velYSmall);
      this.scene.time.addEvent({
        delay: this.teleportDelay, 
        callback: ()=>{ this.canTeleport = true },
      })
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

  throwBall(){
    let ball = new Ball(this.scene, this.x, this.y, 'player', 0, this, this.ground);
    ball.throw();
    this.group.add(ball);
    this.changeScale(1, 0.5);
  }

  teleportToBall(){
    let ball = this.group.getChildren()[1];
    let raycastColl = ball.checkRaycasts();
    if((raycastColl[0] && raycastColl[1]) || (raycastColl[2] && raycastColl[3])){
      return;
    }
    let inc = 4
    let offset = new Phaser.Math.Vector2(0, 0);
    // If player is near anything, add extra offset to teleport so that they don't clip in
    if(raycastColl[0]) offset.x += inc;
    if(raycastColl[1]) offset.x -= inc;
    if(raycastColl[2]) offset.y += inc;
    if(raycastColl[3]) offset.y -= inc;

    this.teleport(ball.x + offset.x, ball.y + offset.y);
    this.changeScale(0.5, 1);
    ball.destroyRaycasts();
    ball.destroy();
  }

  retrieveBall(){
    let raycastColl = this.checkRaycasts();
    if((raycastColl[0] && raycastColl[1]) || (raycastColl[2] && raycastColl[3])){
      return;
    }
    let ball = this.group.getChildren()[1];
    if(ball == null) return;

    let inc = 4
    let offset = new Phaser.Math.Vector2(0, 0);
    if(raycastColl[0]) offset.x += inc;
    if(raycastColl[1]) offset.x -= inc;
    if(raycastColl[2]) offset.y += inc;
    if(raycastColl[3]) offset.y -= inc;

    this.teleport(this.x + offset.x, this.y + offset.y);
    this.changeScale(0.5, 1);
    ball.destroyRaycasts();
    ball.destroy();
  }

  addRaycasts(){
    // Raycast is an Arcade Physics body with no texture. Extra params are target to follow, size, and offset (for placement) 
    let ray1 = new Raycast(this.scene, this.x, this.y, null, 0, this, [6, 4], [5, 14]);
    let ray2 = new Raycast(this.scene, this.x, this.y, null, 0, this, [6, 4], [21, 14]);
    let ray3 = new Raycast(this.scene, this.x, this.y, null, 0, this, [4, 6], [14, 6]);
    let ray4 = new Raycast(this.scene, this.x, this.y, null, 0, this, [4, 6], [14, 22]);
    this.playerRaycasts.addMultiple([ray1, ray2, ray3, ray4]);
  }

  // Initialize this using a variable, or else the raycast check doesn't work properly. Idk why lol, took 2 hours to figure out
  checkRaycasts(){
    // Left, right, up, down
    let array = [];
    Phaser.Actions.Call(this.playerRaycasts.getChildren(), (raycast)=>{ array.push(raycast.getColliding()); });
    return array;
  }
}