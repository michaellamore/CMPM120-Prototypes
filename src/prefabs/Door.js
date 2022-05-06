class Door extends Obstacle{
  constructor(scene, x, y, texture, frame, id=0, targets=[]){
    super(scene, x, y, texture, frame);
    this.setOrigin(0, 0);
    this.id = id;
    this.targets = targets;
    this.stayOpen = false;
  }

  update(){
    for(const target of this.targets){
      if(!target.isPressed){
        return this.close();
      }
    }
    return this.open();
  }

  open(){
    this.body.setEnable(false);
    this.alpha = 0;
  }

  close(){
    if(this.stayOpen) return;
    this.body.setEnable(true);
    this.alpha = 1;
  }
}