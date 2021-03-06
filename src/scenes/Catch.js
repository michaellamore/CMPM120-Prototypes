class Catch extends Phaser.Scene{
  constructor(){
    super("Catch");
  }

  preload(){
    // Tileset stuff
    const map = this.make.tilemap({key: "tilemap", tileWidth: 8, tileHeight: 8});
    const tileset = map.addTilesetImage("tileset", 'tiles', 8, 8, 0, 0);
    map.createLayer('bg decor', tileset, 0, 0);
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
    this.currentSpawn = new Phaser.Math.Vector2(56,127); // Change this to X and Y of level you want to test
    //this.currentSpawn = new Phaser.Math.Vector2(560,515);
    this.doorGroup = this.add.group({runChildUpdate: true});
    this.buttonGroup = this.add.group({runChildUpdate: true});
    this.resetPanels = this.add.group();
    this.spawnPoints = this.add.group();  
    this.tutorialActiveCheck = true;
    this.tutorialActiveCheck2 = true;
    this.tutorialActiveCheck3 = true; 
    this.specialRedSpawn1 = true;
    this.specialRedSpawn2 = false;
    this.specialRedSpawn3 = false;

    // Input
    keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    keyJump = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    keyJump2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    keySwap = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    keySplit = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    keyReset = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    keyZoom = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

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

    //kill area
    this.physics.add.overlap(this.playerGroup, this.killArea, (player, spike)=>{
      if(this.killArea.culledTiles.includes(spike)){
        if(this.tutorialActiveCheck) {
          this.playerManager.respawn(this.currentSpawn.x, this.currentSpawn.y);
          this.playerManager.spawnRedCharacterSpecial(1375,505);
        }
        else if(player.currentColor == "purple"){
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

    this.playerManager.spawnRedCharacterSpecial(1199,240);
    
    this.keySplitTimer = 0;
    this.keySplitBool = true;

    // Ending stuff pls ignore :)
    this.endTrigger1 = false;
    this.endTrigger2 = false;
    this.endCanvas = this.add.sprite(width/2 + width, height/2 + (height*2), 'endCanvas', 0);
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
    if(this.tutorialActiveCheck == false) {
      if(this.cameraInPosition) this.updateCamera();
    }
    this.updateSpawnpoint();
    this.playerManager.update();

    // Input stuff
    // short-tap of S should swap
    // long-tap of S should split/combine
    if(Phaser.Input.Keyboard.DownDuration(keySplit, 750)) {
      this.keySplitTimer = keySplit.getDuration();  //set button down timer
    }else if(Phaser.Input.Keyboard.JustUp(keySplit) && this.keySplitTimer < 700){
      if(this.tutorialActiveCheck2 == false) {
        if(this.playerGroup.isFull()) this.playerManager.changeActivePlayer();
      }
    }else if(this.keySplitTimer > 700 && this.keySplitBool) {
      this.keySplitBool = false;
      if(this.tutorialActiveCheck3 == false) {
        if(this.playerGroup.isFull()) this.playerManager.retrieveInactivePlayer();
        else if(!this.playerGroup.isFull()) this.playerManager.spawnRedCharacter(this.playerManager.activePlayer.x, this.playerManager.activePlayer.y);
      }

    }
    if(this.keySplitTimer < 500){
      this.keySplitBool = true;
    }

    if(Phaser.Input.Keyboard.JustDown(keyReset)){
      this.playerManager.respawn(this.currentSpawn.x, this.currentSpawn.y);
    }

    if(this.tutorialActiveCheck) {
      this.cameras.main.centerOn(160, 90);
      this.cameras.main.setZoom(2);
      if(this.player.x > 320 && this.player.y < 180) {
        this.cameras.main.centerOn(480, 90);
      }
      if(this.player.x > 640 && this.player.y < 180) {
        this.cameras.main.centerOn(800, 90);
      }
      if(this.player.x > 960 && this.player.y < 180) {
        this.cameras.main.centerOn(1120, 90);
      }
      if(this.player.x > 1280 && this.player.y < 180) {
        this.cameras.main.centerOn(1440, 90);
      }
      if(this.player.x > 1600 && this.player.y < 180) {
        this.cameras.main.centerOn(1760, 90);
      }
      if(this.player.x > 1600 && this.player.y < 640 && this.player.y > 180) {
        this.cameras.main.centerOn(1760, 270);
      }
      if(this.player.x > 1280 && this.player.x < 1600 && this.player.y < 360 && this.player.y > 180) {
        this.cameras.main.centerOn(1440, 270);
      }
      if(this.player.x > 960 && this.player.x < 1280 && this.player.y < 360 && this.player.y > 180) {
        this.tutorialActiveCheck2 = false;
        this.cameras.main.centerOn(1120, 270);
        if(this.specialRedSpawn1 == true) {
          this.specialRedSpawn1 = false;
          this.specialRedSpawn2 = true;
          this.playerManager.inactivePlayer.customDestroy();
          this.playerManager.spawnRedCharacterSpecial(1199,240);
        }
      }
      if(this.player.x > 640 && this.player.x < 960 && this.player.y < 360 && this.player.y > 180) {
        this.cameras.main.setZoom(2);
        this.cameras.main.centerOn(800, 270);
        if(this.specialRedSpawn2 == true) {
          this.specialRedSpawn1 = true;
          this.specialRedSpawn2 = false;
          this.specialRedSpawn3 = true;
          this.playerManager.inactivePlayer.customDestroy();
          this.playerManager.spawnRedCharacterSpecial(800,240);
        }
      }
      if(this.player.x < 640 && this.player.y < 640 && this.player.y > 180) {
        this.cameras.main.setZoom(1);
        this.cameras.main.centerOn(320, 360);
        if(this.specialRedSpawn3 == true) {
          this.specialRedSpawn1 = false;
          this.specialRedSpawn2 = true;
          this.specialRedSpawn3 = false;
          this.playerManager.inactivePlayer.customDestroy();
          this.playerManager.spawnRedCharacterSpecial(560,230);
        }
      }
      if(this.player.y > 376) {
        this.tutorialActiveCheck3 = false;
      }
      if(this.playerManager.activePlayer.x > 640 && this.playerManager.activePlayer.x < 960 && this.playerManager.activePlayer.y < 720 && this.playerManager.activePlayer.y > 400) {
        this.cameras.main.setZoom(1);
        this.tutorialActiveCheck = false;
      }
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

  findSound(soundKey){
    for (const sound of this.sound.sounds){
      if (sound.key == soundKey) return true
    }
    return false;
  }

  // When creating levels in Tiled, make sure the LEVELS and ID of buttons/doors are correct! Or else everything falls to shit :) - RN: XD will do
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