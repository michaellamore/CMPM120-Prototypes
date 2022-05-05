class Button extends Obstacle{
  constructor(scene, x, y, texture, frame, group, id=0){
    super(scene, x, y, texture, frame);
    this.setOrigin(0.5, 0);
    this.targets = group;
    this.id = id;
    this.isPressed = false;
  }

  update(){
    // simple AABB checking
    for(const target of this.targets){
      if (this.x < target.x + target.width && 
        this.x + this.width > target.x && 
        this.y < target.y + target.height &&
        this.height + this.y > target. y) {  
        return this.isPressed = true
      } 
      else this.isPressed = false;
    }
  }
}