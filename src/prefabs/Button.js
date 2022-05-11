class Button extends Obstacle{
  constructor(scene, x, y, texture, frame, targets, id=0, level=0){
    super(scene, x, y, texture, frame);
    this.setOrigin(0, 0);
    this.targets = targets;
    this.id = id;
    this.level = level;
  }

  update(){
    this.body.debugBodyColor = 0xa53030;
    this.isPressed = false;
  }

  isColliding(){
    this.isPressed = true;
    this.body.debugBodyColor = 0x468232;
  }
}