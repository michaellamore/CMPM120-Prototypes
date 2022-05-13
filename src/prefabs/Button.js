class Button extends ImmovableBody{
  constructor(scene, x, y, texture, frame, color="", id=0, level=0){
    super(scene, x, y, texture, frame);
    this.color = color;
    this.id = id;
    this.level = level;
    this.isPressed = false;
  }

  update(){
    this.body.debugBodyColor = 0xa53030;
    this.isPressed = false;
  }

  isOverlapping(){
    this.isPressed = true;
    this.body.debugBodyColor = 0x468232;
  }
}