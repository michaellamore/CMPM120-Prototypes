class Credits extends Phaser.Scene {
  constructor() {
    super ("Credits");
  }

  create(){
    // Inputs
    keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    keyJump = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    keySwap = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    keySplit = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    keyReset = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    // Scene transition
    this.sceneTransition = this.add.image(-width, 0, 'sceneTransition').setOrigin(0).setDepth(10);
    this.sceneTransition.scale = 10;
    this.tweens.add({
      targets: this.sceneTransition,
      x: width,
      ease: "Sine.easeOut",
      duration: 2000,
    });

    // Actual level
    this.add.image(0, 0, 'creditLevel').setOrigin(0);

    

    // Player
    this.player = new Player(this, width/2, 300, 'player', 0, 'blue');
    this.player.body.setCollideWorldBounds(true);

    // Create collisions for player
    this.bodyGroup = this.add.group();
    this.physics.add.collider(this.player, this.bodyGroup);
    this.physics.add.overlap(this.player.playerRaycasts, this.bodyGroup, (raycast, body)=>{ raycast.isColliding() });
    for(let i=0; i<4; i++){
      let body = new ImmovableBody(this, 0, 0, null, 0);
      body.alpha = 0;
      this.bodyGroup.add(body);
    }
    let bodyArr = this.bodyGroup.getChildren();
    bodyArr[0].setSize(640, 8).setPosition(width/2-16, height-28);
    bodyArr[1].setSize(640, 8).setPosition(width/2-16, 60);  
    bodyArr[2].setSize(8, 300).setPosition(-4, 200);   
    bodyArr[3].setSize(8, 300).setPosition(612, 200); 

    this.button = new Button(this, 60, 336, 'blueButtonIdle', 0, "blue", 1, 1);
    this.buttonGroup = this.add.group({runChildUpdate: true});
    this.buttonGroup.add(this.button);
    this.door = new Door(this, 0, 400, 'blueDoorIdle', 0, "blue", 1, 1, false);
    this.door.targets.push(this.button);

    this.transitionFlag = false;
    this.physics.add.overlap(this.player, this.button, (player, button)=>{
      button.isOverlapping();
      if(this.transitionFlag) return;
      this.transitionFlag = true;
      this.tweens.add({
        targets: this.sceneTransition,
        x: {from: -width*3, to: -width},
        ease: "Sine.easeOut",
        duration: 2000,
        onComplete: ()=>{this.scene.start("Menu");}
      });
    });
  }

  update(){
    this.player.update();
    this.door.update();
  }
}