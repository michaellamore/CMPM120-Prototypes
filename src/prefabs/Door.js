class Door extends ImmovableBody{
  constructor(scene, x, y, texture, frame, color="", id=0, level=0, startsOpen){
    super(scene, x, y, texture, frame);
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.color = color;
    this.id = id;
    this.level = level;
    this.startsOpen = startsOpen;
    this.stayOpen = false;

    this.targets = [];
    this.openedAllFlag = false;

  }

  update(){
    if(this.targets.length == 0) return;
    for(const target of this.targets){
      if(!target.isPressed){
        if(!this.startsOpen) return this.close();
        if(this.startsOpen) return this.open();
      }
    }
    if(!this.startsOpen) return this.open();
    if(this.startsOpen) return this.close();
  }

  open(){
    this.body.debugBodyColor = 0x468232;
    this.body.setEnable(false);
    this.alpha = 0;

    if(this.color == "purple" && !this.openedAllFlag) this.openAllDoors();
  }

  close(){
    if(this.stayOpen) return;
    this.body.debugBodyColor = 0xa53030;
    this.body.setEnable(true);
    this.alpha = 1;
  }

  getTargets(){
    let output = [];
    Phaser.Actions.Call(this.scene.buttonGroup.getChildren(), (button)=>{
      if(this.level != button.level) return;
      if(this.color != button.color) return;
      if(this.id != button.id) return;
      output.push(button);
    })
    this.targets = output;
  }

  openAllDoors(){
    this.openedAllFlag = true;
    Phaser.Actions.Call(this.scene.doorGroup.getChildren(), (door)=>{
      if(door.level == this.level){
        door.stayOpen = true;
        door.open();
        door.body.setEnable(false);
      }
    })
  }
}