class Door extends Obstacle{
  constructor(scene, x, y, texture, frame, id=0, targets=[]){
    super(scene, x, y, texture, frame);
    this.id = id;
    this.targets = targets;
  }

  update(){
    for(const target of this.targets){
      if(!target.isPressed){return false;}
    }
    return this.open();
  }

  open(){
    this.destroy();
  }

  close(){

  }
}