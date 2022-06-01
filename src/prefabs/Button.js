class Button extends ImmovableBody{
  constructor(scene, x, y, texture, frame, color="", id=0, level=0){
    super(scene, x, y, texture, frame);
    this.body.setSize(32, 28, false);
    this.x -= 8;
    this.y -= 24;
    this.color = color;
    this.id = id;
    this.level = level;
    this.playerOverlapping = false;

    this.anims.play(`${this.color}ButtonActive`);
    this.anims.pause();

    // If this is a purple button, deactivate once the animation is complete
    this.on('animationcomplete', (animation, frame)=>{
      if(animation.key != `purpleButtonActive`) return;
      this.destroy();
    }, this);
  }

  update(){
    this.body.debugBodyColor = 0xa53030;
    this.setTint(0x757575);
    this.playerOverlapping = false;
  }

  isOverlapping(){
    this.playerOverlapping = true;
    this.body.debugBodyColor = 0x468232;
    this.clearTint();
  }
}