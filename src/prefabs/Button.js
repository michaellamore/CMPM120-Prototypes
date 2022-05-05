class Button extends Obstacle{
  constructor(scene, x, y, texture, frame, id=0){
    super(scene, x, y, texture, frame);
    this.id = id;
    this.isPressed = false;
  }

  playerPressed(){
    this.isPressed = true;
  }
}