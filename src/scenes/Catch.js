class Catch extends Phaser.Scene{
  constructor(){
    super("Catch");
  }

  preload(){
    this.load.path = "./assets/";

    
  }

  create(){
    // Variables and such
    this.physics.world.gravity.y = 1400;
    this.levelJSON = this.cache.json.get('levelJSON');
    this.currentSpawn = new Phaser.Math.Vector2(32, 450); // Change this to X and Y of level you want to test
    this.doorGroup = this.add.group({runChildUpdate: true});
    this.buttonGroup = this.add.group({runChildUpdate: true});
    this.resetPanels = this.add.group();
    this.spawnPoints = this.add.group();  
    this.tutorialActiveCheck = true;
    this.tutorialActiveCheck2 = true;

    // Input
    keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    keyJump = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    keySwap = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    keySplit = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    keyReset = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    keyZoom = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

    // Camera + flags
    this.cameras.main.setBackgroundColor('#a8b5b2');
    this.cameraInPosition = true;
    this.cameraTarget;
    
    // Tileset stuff
    const map = this.make.tilemap({key: "tilemap", tileWidth: 8, tileHeight: 8});
    const tileset = map.addTilesetImage("tileset", 'tiles', 8, 8, 0, 0);
    map.createLayer('bg', tileset, 0, 0); // BG tiles
    map.createLayer('bg decor', tileset, 0, 0); // BG tiles
    this.add.image(0, 0, 'paintBG').setOrigin(0); // Paint background on top of the BG tiles
    this.ground = map.createLayer('ground', tileset, 0, 0);
    this.ground.setCollisionByProperty({collides: true});
    this.killArea = map.createLayer('killArea', tileset, 0, 0);
    this.killArea.setCollisionByProperty({kills: true});

    
    // Player
    this.playerGroup = this.add.group({maxSize: 2, runChildUpdate: true});
    this.player = new Player(this, this.currentSpawn.x, this.currentSpawn.y, 'player', 0, 'purple');
    this.playerGroup.add(this.player);
    this.playerManager = new PlayerManager(this);
    this.playerManager.refreshPlayers();

    // Player collisions
    this.physics.add.collider(this.playerGroup, this.ground);
    this.physics.add.collider(this.playerGroup, this.doorGroup);
    this.physics.add.overlap(this.playerGroup, this.buttonGroup, (player, button)=>{
      if(player.currentColor == button.color || player.currentColor == "purple") button.isOverlapping(player);
    });

    //kill area
    this.physics.add.overlap(this.playerGroup, this.killArea, (player, spike)=>{
      if(this.killArea.culledTiles.includes(spike)){
        if(this.tutorialActiveCheck) {
          this.playerManager.respawn(this.currentSpawn.x, this.currentSpawn.y);
          this.playerManager.spawnRedCharacterSpecial(1165,585);
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

    this.playerManager.spawnRedCharacterSpecial(1165,585);
    
    this.keySplitTimer = 0;
    this.keySplitBool = true;
  }

  update(){
    // Camera and spawn points will automatically change based on player position
    //if(this.tutorialActiveCheck == false) {
      if(this.cameraInPosition) this.updateCamera();
    //}
    this.updateSpawnpoint();
    this.playerManager.updateLine();

    // Input stuff

    // short-tap of S should swap
    // long-tap of S should split/combine
    if(Phaser.Input.Keyboard.DownDuration(keySplit, 750)) {
      this.keySplitTimer = keySplit.getDuration();  //set button down timer
    }else if(Phaser.Input.Keyboard.JustUp(keySplit) && this.keySplitTimer < 700){
      if(this.playerGroup.isFull()) this.playerManager.changeActivePlayer();
    }else if(this.keySplitTimer > 700 && this.keySplitBool) {
      this.keySplitBool = false;
      if(this.tutorialActiveCheck == false) {
        if(this.playerGroup.isFull()) this.playerManager.retrieveInactivePlayer();
        else if(!this.playerGroup.isFull()) this.playerManager.spawnRedCharacter();
      }

    }
    if(this.keySplitTimer < 500){
      this.keySplitBool = true;
    }

    if(Phaser.Input.Keyboard.JustDown(keyReset)){
      this.playerManager.respawn(this.currentSpawn.x, this.currentSpawn.y);
    }

    if(this.tutorialActiveCheck) {
      this.cameras.main.centerOn(160, 450);
      this.cameras.main.setZoom(2);
      if(this.player.x > 320 && this.player.y < 540) {
        this.cameras.main.centerOn(480, 450);
      }
      if(this.player.x > 640 && this.player.y < 540) {
        this.cameras.main.centerOn(800, 450);
      }
      if(this.player.x > 960 && this.player.y < 540) {
        this.cameras.main.centerOn(1120, 450);
      }
      if(this.player.x > 1280 && this.player.y < 540) {
        this.tutorialActiveCheck = false;
        this.cameras.main.setZoom(1);
      }
    }
    if(this.tutorialActiveCheck2 && this.tutorialActiveCheck == false) {
      if(this.player.x < 1280 && this.player.y < 730) {
        this.cameras.main.setZoom(2);
        this.cameras.main.centerOn(1120,640);
      }
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

  zoomCamera(){

  }

  updateSpawnpoint(){
    let playerGridPos = this.getLocationOnGrid(this.player);
    Phaser.Actions.Call(this.spawnPoints.getChildren(), (spawn)=>{ 
      let spawnPos = spawn.getPos();
      let spawnGridPos = this.getLocationOnGrid(spawnPos);
      if(playerGridPos.x == spawnGridPos.x && playerGridPos.y == spawnGridPos.y){
        this.currentSpawn.x = spawnPos.x;
        this.currentSpawn.y = spawnPos.y;
      }
    });
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