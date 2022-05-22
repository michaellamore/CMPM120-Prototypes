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
    this.validPlayer = false;
    this.canChangeState = true;

    this.anims.play(`${this.color}DoorIdle`);
    this.on('animationcomplete', this.closeToIdle, this);

    /* 
      A lot of this spaghetti logic is me just trying to call functions when a valid player enters and exits a button. 
      The reason why it's so "all over the place" is because Phaser doesn't have an "On Exit" Collision event (unless I missed it)
      Idk, there's probably a better way of doing things. I don't have enough time to find other methods 
    */
  }

  update(){
    if(this.targets.length == 0 || !this.isActive) return; // No targets yet, don't do anything 
    for(const button of this.targets){
      if(button.validPlayer == null){
        this.deactivate();
        this.canChangeState = false;
        return
      }
      let touching = !button.validPlayer.body.touching.none;
      let wasTouching = !button.validPlayer.body.wasTouching.none;
      if (!touching && wasTouching){ // Exit button range
        this.canChangeState = true;
        this.deactivate();
      }
      if(touching && !wasTouching){ // Enter button range
        this.canChangeState = true;
        this.activate();
      }
    }
  }

  deactivate(){
    if(!this.canChangeState) return;
    if(!this.startsOpen) return this.close();
    if(this.startsOpen) return this.open();
  }

  activate(){
    if(!this.canChangeState) return;
    if(!this.startsOpen) return this.open();
    if(this.startsOpen) return this.close();
  }

  open(){
    if(this.currentState == "open") return;
    this.currentState = "open";
    this.body.debugBodyColor = 0x468232;
    this.body.setEnable(false);
    this.anims.play(`${this.color}DoorClose`, false);
    // if(this.color == "purple" && !this.stayOpen) this.openAllDoors();
    if(this.color == "purple" && !this.stayOpen) this.stayOpen = true;
  }

  close(){
    if(this.currentState == "closed") return;
    if(this.stayOpen) return;
    this.currentState = "closed";
    this.body.debugBodyColor = 0xa53030;
    this.body.setEnable(true);
    this.anims.play(`${this.color}DoorOpen`, false);
  }

  // After opening the door, transition to playing the idle animation 
  closeToIdle(animation, frame){
    if(animation.key == `${this.color}DoorOpen`){
      this.anims.play(`${this.color}DoorIdle`)
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

  // is called after a purple door is opened
  openAllDoors(){
    Phaser.Actions.Call(this.scene.doorGroup.getChildren(), (door)=>{
      if(door.level == this.level){
        door.stayOpen = true;
        if(door.currentState == "closed") door.open();
        door.body.setEnable(false);
        door.isActive = false;
      }
    })
  }
}