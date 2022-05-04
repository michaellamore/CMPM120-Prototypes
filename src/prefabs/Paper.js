"use strict";
class Paper extends Phaser.GameObjects.Sprite{
  constructor(scene, x, y, texture, frame, angle){
    super(scene, x, y, texture, frame);
    scene.add.existing(this);
    this.setOrigin(0.5);
    this.angle = angle;

    this.setInteractive({
      draggable: true,
      useHandCursor: true
    });
    
    this.on('drag', (pointer, dragX, dragY) => {
      if(typeof this !== "undefined"){
        this.x = dragX;
        this.y = dragY;
      }
      
    });
    this.on('dragend', (pointer) => {
      if(this.x < 0) this.x = padding;
      if(this.x > width) this.x = width-padding;
      if(this.y < 0) this.y = padding;
      if(this.y > height) this.y = height-padding;
    });
  }
}