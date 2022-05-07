class Ball extends Phaser.Physics.Arcade.Sprite{
  constructor(scene, x, y, texture, frame, player, ground){
    super(scene, x, y, texture, frame);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5);
    this.body.setSize(16, 16, false);
    this.body.setOffset(0, 3);

    this.setBounce(0.5, 0.5);
    this.velX = 160;
    this.velXBig = 270;
    this.velY = 400;
    this.velYBig = 600;
    this.jumpVelocity = -400;
    this.jumpVelBig = -500;
    this.acceleration = 550;
    this.drag = 500;
    this.dragBig = 1000;
    this.setMaxVelocity(this.velX, this.velY)
    this.body.setDragX(this.drag);
    
    this.setTint(0x808080);
    this.scale = 0.5;
    this.player = player;
    this.ground = ground;
    this.ballRaycasts = this.scene.add.group({runChildUpdate: true});
    this.addRaycasts();

    this.scene.physics.add.overlap(this.ballRaycasts, this.ground, (raycast, tile)=>{
      if(this.ground.culledTiles.includes(tile)) raycast.isColliding();
    });

    // When initializing this object, check the last known input to get direction of throw
    this.currentAction = this.scene.getInput();
  }
  
  throw(){
    if(this.currentAction == "upLeft") {
      this.body.setAccelerationX(-this.acceleration);
      this.body.setVelocityX(-this.velX);
      this.body.setVelocityY(this.jumpVelocity);
    } 
    else if(this.currentAction == "downLeft") {
      this.body.setAccelerationX(-this.acceleration);
      this.body.setVelocityX(-this.velXBig);
      this.body.setVelocityY(-this.jumpVelBig);
      this.setMaxVelocity(this.velXBig, this.velYBig);
      this.setBounce(0.7, 0.7);
    } 
    else if(this.currentAction == "upRight") {
      this.body.setAccelerationX(this.acceleration*3);
      this.body.setVelocityX(this.velX);
      this.body.setVelocityY(this.jumpVelocity);
    } 
    else if(this.currentAction == "downRight") {
      this.body.setAccelerationX(this.acceleration*3);
      this.body.setVelocityX(this.velX*3);
      this.body.setVelocityY(-this.jumpVelBig);
      this.setMaxVelocity(this.velXBig, this.velYBig);
      this.setBounce(0.7, 0.7);
    } 
    else if(this.currentAction == "up") {
      this.body.setAccelerationX(0);
      this.body.setVelocityY(this.jumpVelocity);
    } 
    else if(this.currentAction == "down") {
      this.body.setAccelerationX(0);
      this.body.setVelocityY(-this.jumpVelocity);
    } 
    else if(this.currentAction == "left") {
      this.body.setAccelerationX(-this.acceleration*3);
      this.body.setVelocityX(-this.velXBig);
      this.body.setVelocityY(this.jumpVelocity/2);
      this.setMaxVelocity(this.velXBig, this.velY)
      this.setBounce(0.1, 0.1);
      this.body.setDragX(this.dragBig);
      
    } 
    else if(this.currentAction == "right") {
      this.body.setAccelerationX(this.acceleration*3);
      this.body.setVelocityX(this.velXBig);
      this.body.setVelocityY(this.jumpVelocity/2);
      this.setMaxVelocity(this.velXBig, this.velY)
      this.setBounce(0.1, 0.1);
      this.body.setDragX(this.dragBig);
    } 
    else {
      // if current action is none or not accounted for, it's ok. don't change its vel or accel
    }
  }

  update(){
    // If it hits ANYTHING other than player, stop its movement
    if(this.body.onFloor() || this.body.onWall()){
      this.setBounce(0, 0);
      this.body.setAccelerationX(0);
    }
  }

  addRaycasts(){
    // Raycast is an Arcade Physics body with no texture. Extra params are target to follow, size, and offset (for placement) 
    let ray1 = new Raycast(this.scene, this.x, this.y, null, 0, this, [6, 4], [5, 14]);
    let ray2 = new Raycast(this.scene, this.x, this.y, null, 0, this, [6, 4], [21, 14]);
    let ray3 = new Raycast(this.scene, this.x, this.y, null, 0, this, [4, 6], [14, 6]);
    let ray4 = new Raycast(this.scene, this.x, this.y, null, 0, this, [4, 6], [14, 22]);
    this.ballRaycasts.addMultiple([ray1, ray2, ray3, ray4]);
  }

  checkRaycasts(){
    if(!this.ballRaycasts.getChildren()[0]) return
    // Left, right, up, down
    let array = [];
    Phaser.Actions.Call(this.ballRaycasts.getChildren(), (raycast)=>{ 
      array.push(raycast.colliding);
    });
    return array;
  }

  destroyRaycasts(){
    Phaser.Actions.Call(this.ballRaycasts.getChildren(), (raycast)=>{ 
      raycast.destroy();
    });
  }
}