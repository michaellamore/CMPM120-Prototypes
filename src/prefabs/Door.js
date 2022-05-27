class Door extends ImmovableBody{
  constructor(scene, x, y, texture, frame, color="", id=0, level=0, startsOpen){
    super(scene, x, y, texture, frame);
    this.body.setSize(24, 24, false);
    this.scene = scene;

    // Offset b/c of the way we did it in Tiled
    this.x -= 8;
    this.y -= 8;

    // Door properties
    this.color = color;
    this.id = id;
    this.level = level;
    
    this.startsOpen = startsOpen; // Determines if activation means opening or closing
    this.targets = []; // If any of the buttons in this array are pressed, activate the door
    this.stayOpen = false; // Flag to keep doors opened (after opening purple door)
    this.isActive = true;
    this.currentState = "closed";

    this.anims.play(`${this.color}DoorIdle`);
    this.on('animationcomplete', this.handleEndAnim, this);

    /* 
      A lot of this spaghetti logic is me just trying to call functions when a valid player enters and exits a button. 
      The reason why it's so "all over the place" is because Phaser doesn't have an "On Exit" Collision event (unless I missed it)
      Idk, there's probably a better way of doing things. I don't have enough time to find other methods 
    */
  }

  update(){
    if(this.targets.length == 0 || !this.isActive) return; // No targets yet, don't do anything 
    for(const button of this.targets){ // If ANY of the buttons with the same level/color are overlapped, activate
      if(button.playerOverlapping){
        return this.activate();
      }
    }
    this.deactivate();
  }

  deactivate(){
    if(!this.startsOpen) return this.close();
    if(this.startsOpen) return this.open();
  }

  activate(){
    if(!this.startsOpen) return this.open();
    if(this.startsOpen) return this.close();
  }

  open(){
    if(this.currentState == "open") return;
    this.currentState = "open";
    this.body.debugBodyColor = 0x468232;
    this.body.setEnable(false);
    this.anims.play(`${this.color}DoorOpen`, false);
    if(this.color == "purple" && !this.stayOpen){ this.stayOpen = true; }
  }

  close(){
    if(this.currentState == "closed") return;
    if(this.stayOpen) return;
    this.currentState = "closed";
    this.body.debugBodyColor = 0xa53030;
    this.body.setEnable(true);
    this.anims.play(`${this.color}DoorClose`, false);
  }

  
  handleEndAnim(animation, frame){
    // After opening the door, transition to playing the idle animation 
    if(animation.key == `${this.color}DoorClose`){
      this.anims.play(`${this.color}DoorIdle`);
    }
    // If the door is purple and player activated it, destroy button and door 
    if(animation.key == `${this.color}DoorOpen` && this.color == "purple"){
      this.destroyPurple();
    }
  }

  // is called after all objects from Tiled are intialized
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

  async destroyPurple(){
    await this.destroyPurpleButtons();
    this.destroy();
  }

   destroyPurpleButtons(){
    Phaser.Actions.Call(this.targets, (button)=>{
      button.destroy();
    });
  }
  // openAllDoors(){
  //   Phaser.Actions.Call(this.scene.doorGroup.getChildren(), (door)=>{
  //     if(door.level == this.level){
  //       door.stayOpen = true;
  //       if(door.currentState == "closed") door.open();
  //       door.body.setEnable(false);
  //       door.isActive = false;
  //     }
  //   })
  // }
}