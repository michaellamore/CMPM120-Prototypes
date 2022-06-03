class Catch extends Phaser.Scene{
  constructor(){
    super("Catch");
  }

  preload(){
    // Tileset stuff
    const map = this.make.tilemap({key: "tilemap", tileWidth: 8, tileHeight: 8});
    const tileset = map.addTilesetImage("tileset", 'tiles', 8, 8, 0, 0);
    map.createLayer('bgDecor', tileset, 0, 0);
    this.ground = map.createLayer('ground', tileset, 0, 0);
    this.ground.setCollisionByProperty({collides: true});

    this.add.image(0, 0, 'paint').setOrigin(0); // Custom paint image
    
    this.killArea = map.createLayer('killArea', tileset, 0, 0).setDepth(1);
    this.killArea.setCollisionByProperty({kills: true});
  }

  create(){
    // Scene transition (from Menu)
    this.sceneTransition = this.add.image(-width, 0, 'sceneTransition').setOrigin(0).setDepth(10);
    this.sceneTransition.scale = 10;
    this.tweens.add({
      targets: this.sceneTransition,
      x: width,
      ease: "Sine.easeOut",
      duration: 2000,
      onComplete: ()=>{this.sceneTransition.alpha = 0;}
    });

    // Variables and such
    this.levelJSON = this.cache.json.get('levelJSON');
    this.currentSpawn = new Phaser.Math.Vector2(32, 340); // Change this to X and Y of level you want to test
    this.doorGroup = this.add.group({runChildUpdate: true});
    this.buttonGroup = this.add.group({runChildUpdate: true});
    this.resetPanels = this.add.group();
    this.spawnPoints = this.add.group();

    // Input
    keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    keyJump = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    keySwap = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    keySplit = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    keyReset = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    // Camera + flags
    this.cameras.main.setBackgroundColor('#a8b5b2');
    this.cameraInPosition = true;
    this.cameraTarget;

    // Player
    this.playerGroup = this.add.group({maxSize: 2, runChildUpdate: true});
    this.player = new Player(this, this.currentSpawn.x, this.currentSpawn.y, 'player', 0, 'blue');
    this.playerGroup.add(this.player);
    this.playerManager = new PlayerManager(this);
    this.playerManager.spawnRedCharacter(1688, 488);
    this.playerManager.refreshPlayers();

    // Player collisions
    this.physics.add.collider(this.playerGroup, this.ground);
    this.physics.add.collider(this.playerGroup, this.doorGroup);
    this.physics.add.overlap(this.playerGroup, this.buttonGroup, (player, button)=>{
      if(player.currentColor == button.color) button.isOverlapping();
    });

    this.physics.add.overlap(this.playerGroup, this.killArea, (player, spike)=>{
      if(this.killArea.culledTiles.includes(spike)){
        if(player.currentColor == "purple"){
          this.playerManager.respawn(this.currentSpawn.x, this.currentSpawn.y);
        } else {
          if(player.isActive) this.playerManager.changeActivePlayer();
          this.playerManager.retrieveInactivePlayer(true);
        }
      }
    });
    // Reset panels make sure player is purple. If not, retrieve the player that DIDN'T HIT the panel
    this.physics.add.overlap(this.playerGroup, this.resetPanels, (player, panel)=>{
      if(player.currentColor == "purple") return;
      if(!player.isActive) this.playerManager.changeActivePlayer();
      this.playerManager.retrieveInactivePlayer(true);
    });

    // Load custom tiles that use JS prefabs from Tiled
    this.loadSpecialTiles();

    // Ending stuff pls ignore :)
    this.endTrigger1 = false;
    this.endTrigger2 = false;
    this.endCanvas = this.add.sprite(width/2, height/2 + (height*2), 'endCanvas', 0);
    Phaser.Actions.Call(this.buttonGroup.getChildren(), (button)=>{
      if(button.level != 99) return;
      if(button.color == "purple"){
        this.endPurpleButton = button;
        button.alpha = 0
        button.body.setEnable(false);
      } 
      else if (button.color == "red"){ this.endRedButton = button; }
      else if (button.color == "blue"){ this.endBlueButton = button; }
    });
  }

  update(){
    // Camera and spawn points will automatically change based on player position
    if(this.cameraInPosition) this.updateCamera();
    this.updateSpawnpoint();
    this.playerManager.update();

    // Input stuff
    if(Phaser.Input.Keyboard.JustDown(keySplit)){
      if(this.playerGroup.isFull()) this.playerManager.retrieveInactivePlayer();
      else if(!this.playerGroup.isFull()) this.playerManager.spawnRedCharacter(this.playerManager.activePlayer.x, this.playerManager.activePlayer.y);
    }
    if(Phaser.Input.Keyboard.JustDown(keySwap)){
      if(this.playerGroup.isFull()) this.playerManager.changeActivePlayer();
    }
    if(Phaser.Input.Keyboard.JustDown(keyReset)){
      this.playerManager.respawn(this.currentSpawn.x, this.currentSpawn.y);
    }

    // Ending stuff pls ignore :)
    if(this.endRedButton.playerOverlapping && this.endBlueButton.playerOverlapping && !this.endTrigger1){
      // If both blue/red are triggered, spawn final, purple button
      this.endCanvas.setFrame(3);
      this.endTrigger1 = true;
      this.tweens.add({ // Get rid of blue/red buttons
        targets: [this.endRedButton, this.endBlueButton],
        y: "+=64",
        ease: "Sine.easeInOut",
        duration: 500,
      })
      this.endPurpleButton.y += 64;
      this.endPurpleButton.alpha = 1;
      this.endPurpleButton.body.setEnable();
      this.tweens.add({ // Add purple button
        targets: this.endPurpleButton,
        y: "-=64",
        ease: "Sine.easeInOut",
        duration: 500,
      })
    }
    else if (this.endPurpleButton.playerOverlapping && !this.endTrigger2){
      this.endCanvas.setFrame(4);
      this.endTrigger2 = true;
      this.sceneTransition.alpha = 1;
      this.time.delayedCall(3000, ()=>{
        this.tweens.add({
          targets: this.sceneTransition,
          x: {from: -width*3, to: -width},
          ease: "Sine.easeOut",
          duration: 2000,
          onComplete: ()=>{this.scene.start("Credits");}
        });
      }, null, this);
    }
    else if (this.endRedButton.playerOverlapping && !this.endTrigger1) this.endCanvas.setFrame(1);
    else if (this.endBlueButton.playerOverlapping && !this.endTrigger1) this.endCanvas.setFrame(2);
    else {
      if(!this.endTrigger1) this.endCanvas.setFrame(0);
    }
  }

  getLocationOnGrid(obj){
    // Gets the obj's current location based on a grid
    let vector2 = new Phaser.Math.Vector2(Math.floor(obj.x/width), Math.floor(obj.y/height));
    return vector2;
  }

  updateCamera(){
    let playerGridPos = this.getLocationOnGrid(this.cameraTarget);
    let target = new Phaser.Math.Vector2(playerGridPos.x*width, playerGridPos.y*height);
    this.cameraInPosition = false;
    let tween = this.tweens.add({
      targets: this.cameras.main,
      scrollX: target.x,
      scrollY: target.y,
      ease: "Sine.easeOut",
      duration: 300,
      repeat: 0,
    })
    tween.on("complete", ()=>{ this.cameraInPosition = true; });
  }

  updateSpawnpoint(){
    let playerGridPos = this.getLocationOnGrid(this.playerManager.activePlayer);
    Phaser.Actions.Call(this.spawnPoints.getChildren(), (spawn)=>{ 
      let spawnPos = spawn.getPos();
      let spawnGridPos = this.getLocationOnGrid(spawnPos);
      if(playerGridPos.x == spawnGridPos.x && playerGridPos.y == spawnGridPos.y){
        this.currentSpawn.x = spawnPos.x;
        this.currentSpawn.y = spawnPos.y;
      }
    });
  }

  // When creating levels in Tiled, make sure the LEVELS and ID of buttons/doors are correct! Or else everything falls to shit :)
  loadSpecialTiles(){
    let interactables = this.levelJSON.layers[3].objects;
    let availableDoors = ["blueDoor", "redDoor", "purpleDoor"];
    let availableButtons = ["blueButton", "redButton", "purpleButton"];
    let offset = new Phaser.Math.Vector2(0, -8); // Not sure why I even need an offset, Tiled is wild

    for(const obj of interactables){
      let currentObj;
      // Buttons and Doors
      let currentId;
      let currentLevel;
      // Door specific
      let startOpen = false;

      // Parse the JSON correctly and set it to the variables above
      for(const property of obj.properties){
        if(availableDoors.includes(property.name) || availableButtons.includes(property.name)){
          currentId = property.value;
          currentObj = property.name;
        }

        if(property.name == "level") currentLevel = property.value;
        else if(property.name == "startOpen") startOpen = property.value;
        else if(property.name == "spawnpoint") currentObj = property.name;
        else if(property.name == "resetPanel") currentObj = property.name;
        
      }
      // console.log(currentObj, currentId, currentLevel, startOpen);

      // Instantiate prefabs based on parsed info
      if(availableButtons.includes(currentObj)){
        let color;
        if(currentObj == "blueButton") color = "blue";
        else if (currentObj == "redButton") color = "red";
        else if (currentObj == "purpleButton") color = "purple";
        else console.warn(`Button "${currentObj}" is invalid.`);
        let button = new Button(this, obj.x+offset.x, obj.y+offset.y, 'buttonSheet', 0, color, currentId, currentLevel);
        this.buttonGroup.add(button);
      }

      if(availableDoors.includes(currentObj)){
        let color;
        if(currentObj == "blueDoor") color = "blue";
        else if (currentObj == "redDoor") color = "red";
        else if (currentObj == "purpleDoor") color = "purple";
        else console.warn(`Door "${currentObj}" is invalid.`);
        let door = new Door(this, obj.x+offset.x, obj.y+offset.y, "blueDoorIdle", 0, color, currentId, currentLevel, startOpen);
        this.doorGroup.add(door);
      }

      if(currentObj == "resetPanel") {
        let resetPanel = new ResetPanel(this, obj.x+offset.x, obj.y+offset.y, currentObj, 0);
        this.resetPanels.add(resetPanel);
      }

      if(currentObj == "spawnpoint") {
        let spawnpoint = new Spawn(this, obj.x+offset.x, obj.y+offset.y, null, 0);
        this.spawnPoints.add(spawnpoint);
      }
    }
    // Now do stuff that requires everything to be loaded to work properly
    Phaser.Actions.Call(this.doorGroup.getChildren(), (door)=>{ 
      door.getTargets();
      if(door.startsOpen) door.open();
    });
  } 
}