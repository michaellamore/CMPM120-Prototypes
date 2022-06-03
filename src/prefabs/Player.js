class Player extends Phaser.Physics.Arcade.Sprite{
  constructor(scene, x, y, texture, frame, color){
    super(scene, x, y, texture, frame);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5);
    this.setDepth(5);
    this.body.setSize(16, 16, false);
    this.body.setOffset(16, 14);
    this.body.debugBodyColor = 0x468232;

    // Reference to stuff from the scene
    this.scene = scene;
    this.ground = this.scene.ground;
    this.doorGroup = this.scene.doorGroup;

    // Raycast stuff
    this.playerRaycasts = this.scene.add.group({runChildUpdate: true});
    this.scene.physics.add.overlap(this.playerRaycasts, this.ground, (raycast, tile)=>{
      // If the tile the raycast is hitting is actual ground, tell it that it's colliding
      if(this.ground.culledTiles.includes(tile)){ raycast.isColliding(); }
    });
    this.scene.physics.add.overlap(this.playerRaycasts, this.doorGroup, (raycast, door)=>{
      raycast.isColliding();
    });
    this.addRaycasts();

    // Particles (for dust)
    this.particles = this.scene.add.particles('smoke');
    this.emitter = this.particles.createEmitter({
      x: this.x,
      y: this.y,
      follow: this,
      followOffset: {
        x: 0,
        y: 6
      },
      angle: { min: 240, max: 300 },
      alpha: {start: 1, end: 0.5},
      scale: {min: 0.5, max: 1},
      speed: 3,
      lifespan: 200,
      gravityY: 100,
      on: false
    });

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

    // Misc
    this.currentColor = color;
    this.setTexture(`${this.currentColor}PlayerInactive`);
    this.setTint(0x402751);

    this.state = "IDLE";
    this.availableStates = ["IDLE", "MOVE", "JUMP", "WALLJUMP", "BUSY"];
    this.anims.play(`${this.currentColor}PlayerIdle`);
  }
  
  update(){
    // Change player tint depending on what player is and if they're active
    if(!this.isActive){
      this.body.setAccelerationX(0);
      this.body.setDragX(this.dragXBig);
      if(this.anims.currentAnim.key != `${this.currentColor}PlayerInactive` && this.anims.currentAnim.key != `${this.currentColor}PlayerDie`) this.anims.play(`${this.currentColor}PlayerInactive`, false);
      this.setTint(0x757575);
      return;
    } 
    this.clearTint();

    let raycast = this.checkRaycasts();
    if(this.state == "BUSY") this.BUSY();
    else if (this.state == "MOVE") this.MOVE(raycast);
    else if (this.state == "JUMP") this.JUMP(raycast);
    else if (this.state == "WALLJUMP") this.WALLJUMP(raycast);
    else this.IDLE(raycast);
  }

  IDLE(raycast){
    // If idle's not playing, play the animation
    if(this.anims.currentAnim.key != `${this.currentColor}PlayerIdle`) this.anims.play(`${this.currentColor}PlayerIdle`, false);
    
    if(this.body.onFloor()){
      this.canJump = true;
    }

    this.setMaxVelocity(this.velXBig, this.velYBig);

    if(Phaser.Input.Keyboard.JustDown(keyJump) || Phaser.Input.Keyboard.JustDown(keyJump2)){
      if(this.canJump || raycast[3]) this.transitionTo("JUMP");
      else if(!this.body.onFloor() && (raycast[0] || raycast[1] || this.body.onWall())) this.transitionTo("WALLJUMP");
    } else if(keyLeft.isDown || keyRight.isDown) this.transitionTo("MOVE");
    
  }

  MOVE(raycast){
    if(this.body.onFloor()){
      this.canJump = true; 
      if(this.anims.currentAnim.key != `${this.currentColor}PlayerRun`) this.anims.play(`${this.currentColor}PlayerRun`);
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

    // Jumping
    if(Phaser.Input.Keyboard.JustDown(keyJump) || Phaser.Input.Keyboard.JustDown(keyJump2)){
      if(this.canJump || raycast[3]) this.transitionTo("JUMP");
      else if(!this.body.onFloor() && (raycast[0] || raycast[1] || this.body.onWall())) this.transitionTo("WALLJUMP");
    }

    if(this.body.velocity.x == 0 && this.body.velocity.y == 0 && this.body.acceleration.x == 0 && this.body.acceleration.y == 0) {
      this.transitionTo("IDLE");
    }
  }

  JUMP(raycast){
    this.squashAndStretch();
    this.particles.emitParticle();
    this.scene.sound.play('sfxJump', {volume: 0.2});
    this.anims.play(`${this.currentColor}PlayerJump`, true);

    this.body.setVelocityY(this.velJumpBig);
    this.body.setAccelerationX(0);
    this.canJump = false;

    if(!this.body.onFloor() && (raycast[0] || raycast[1] || this.body.onWall())) this.transitionTo("WALLJUMP");
    this.transitionTo("MOVE");
  }

  WALLJUMP(raycast){
    this.squashAndStretch();
    this.particles.emitParticle();
    this.scene.sound.play('sfxJump', {volume: 0.2});
    this.anims.play(`${this.currentColor}PlayerWalljump`, false);

    if(raycast[0] || this.body.blocked.left) {
      this.flipX = false;
      this.body.setAccelerationX(this.accelBig);
      this.body.setVelocityX(this.velXBig);
    }
    else if(raycast[1] || this.body.blocked.right){
      this.flipX = true;
      this.body.setAccelerationX(-this.accelBig);
      this.body.setVelocityX(-this.velXBig);
    }
    this.body.setVelocityY(this.velJumpBig);
    this.canJump = false; 
    this.transitionTo("MOVE");
  }

  BUSY(){
    // When busy, player literally shouldn't be able to do anything
    // To get out of busy state, it has to be externally (after tween completion, animation finished, etc. etc.)
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

  squashAndStretch(){
    this.scene.tweens.add({
      targets: this,
      scaleX: {from: 1, to: 0.8},
      duration: 100,
      yoyo: true
    })
  }

  addRaycasts(){
    // Raycast is an Arcade Physics body with no texture. Extra params are target to follow, size, and offset (for placement) 
    let ray1 = new Raycast(this.scene, this.x, this.y, null, 0, this, [6, 14], [2, 8]);
    let ray2 = new Raycast(this.scene, this.x, this.y, null, 0, this, [6, 14], [24, 8]);
    let ray3 = new Raycast(this.scene, this.x, this.y, null, 0, this, [14, 6], [9, 1]);
    let ray4 = new Raycast(this.scene, this.x, this.y, null, 0, this, [14, 16], [9, 23]);
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
    this.scene.lights.removeLight(this.spotlight);
    let raycast = this.playerRaycasts.getChildren();
    raycast[3].destroy();
    raycast[2].destroy();
    raycast[1].destroy();
    raycast[0].destroy();
    this.destroy();
  }
}