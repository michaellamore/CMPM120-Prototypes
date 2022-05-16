class Ball extends Phaser.Physics.Arcade.Sprite{
  constructor(scene, x, y, texture, frame, angle){
    super(scene, x, y, texture, frame);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5);
    this.setBounce(0.5, 0.5);
    this.setTint(0xa53030);
    this.scene = scene;
    
    // Variables to change the way the ball moves when thrown
    this.velX = 160;
    this.velXBig = 270;
    this.velY = 400;
    this.velYBig = 600;
    this.jumpVelocity = -400;
    this.jumpVelBig = -500;
    this.acceleration = 550;
    this.drag = 500;
    this.dragBig = 1000;

    this.setMaxVelocity(this.velX, this.velY);
    this.body.setDragX(this.drag);
    
    // Add it to the ball group. Anything in this group will collide with walls, doors, reset panels, and spikes
    this.scene.ballGroup.add(this);

    // When initializing this object, throw it based on angle provided
    this.throw(angle);
  }

  throw(angle){
    if(angle > 337.5 || angle <=22.5){ // Right
      this.body.setAccelerationX(this.acceleration*3);
      this.body.setVelocityX(this.velXBig);
      this.body.setVelocityY(this.jumpVelocity/2);
      this.setMaxVelocity(this.velXBig, this.velY)
      this.setBounce(0.1, 0.1);
      this.body.setDragX(this.dragBig);
    }
    else if (angle > 22.5 && angle <=67.5){ // Bottom right
      this.body.setAccelerationX(this.acceleration);
      this.body.setVelocityX(this.velX*3);
      this.body.setVelocityY(-this.jumpVelBig);
    }
    else if (angle > 67.5 && angle <=112.5){ // Bottom
      this.body.setAccelerationX(0);
      this.body.setVelocityY(-this.jumpVelocity/2);
    }
    else if (angle > 112.5 && angle <=157.5){ // Bottom Left
      this.body.setAccelerationX(-this.acceleration);
      this.body.setVelocityX(-this.velXBig);
    }
    else if (angle > 157.5 && angle <=202.5){ // Left
      this.body.setAccelerationX(-this.acceleration*3);
      this.body.setVelocityX(-this.velXBig);
      this.body.setVelocityY(this.jumpVelocity/2);
      this.setMaxVelocity(this.velXBig, this.velY)
      this.setBounce(0.1, 0.1);
      this.body.setDragX(this.dragBig);
    }
    else if (angle > 202.5 && angle <=247.5){ // Top Left
      this.body.setAccelerationX(-this.acceleration);
      this.body.setVelocityX(-this.velX);
      this.body.setVelocityY(this.jumpVelocity);
    }
    else if (angle > 247.5 && angle <=292.5){ // Top
      this.body.setAccelerationX(0);
      this.body.setVelocityY(this.jumpVelocity);
    }
    else if (angle > 292.5 && angle <=337.5){ // Top Right
      this.body.setAccelerationX(this.acceleration*3);
      this.body.setVelocityX(this.velX);
      this.body.setVelocityY(this.jumpVelocity);
    }
    else console.warn("INVALID ANGLE WTF DID U DO LOL");
  }

  // addRaycasts(){
  //   // Raycast is an Arcade Physics body with no texture. Extra params are target to follow, size, and offset (for placement) 
  //   let ray1 = new Raycast(this.scene, this.x, this.y, null, 0, this, [6, 4], [5, 14]);
  //   let ray2 = new Raycast(this.scene, this.x, this.y, null, 0, this, [6, 4], [21, 14]);
  //   let ray3 = new Raycast(this.scene, this.x, this.y, null, 0, this, [4, 6], [14, 6]);
  //   let ray4 = new Raycast(this.scene, this.x, this.y, null, 0, this, [4, 6], [14, 22]);
  //   this.ballRaycasts.addMultiple([ray1, ray2, ray3, ray4]);
  // }

  // checkRaycasts(){
  //   if(!this.ballRaycasts.getChildren()[0]) return
  //   // Left, right, up, down
  //   let array = [];
  //   Phaser.Actions.Call(this.ballRaycasts.getChildren(), (raycast)=>{ 
  //     array.push(raycast.colliding);
  //   });
  //   return array;
  // }

  // destroyRaycasts(){
  //   let raycast = this.ballRaycasts.getChildren();
  //   // I have to destroy BACKWARDS from the array, because looping through each element gets messed up when doing it normally
  //   raycast[3].destroy();
  //   raycast[2].destroy();
  //   raycast[1].destroy();
  //   raycast[0].destroy();
  // }
}