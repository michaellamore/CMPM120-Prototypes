class Catch extends Phaser.Scene{
  constructor(){
    super("Catch");
  }

  preload(){
    this.load.path = "./assets/";
    this.load.image('player', 'testPlayer.png');
    this.load.image('playerInactive', 'testPlayerInactive.png');
    this.load.image('purpleButton', 'purpleButton.png');
    this.load.image('purpleDoor', 'purpleDoor.png');
    this.load.image('blueButton', 'blueButton.png');
    this.load.image('blueDoor', 'blueDoor.png');
    this.load.image('redButton', 'redButton.png');
    this.load.image('redDoor', 'redDoor.png');
    this.load.image('resetPanel', 'resetPanel.png');

    // Test level
    this.load.image('tiles', "tiles.png");
    this.load.tilemapTiledJSON('tilemap', 'levels.json');
    this.load.json('levelJSON', 'levels.json')
  }

  create(){
    // Variables and such
    this.physics.world.gravity.y = 1400;
    this.levelJSON = this.cache.json.get('levelJSON');
    this.currentSpawn = new Phaser.Math.Vector2(1248, 336); // Change this to X and Y of level you want to test
    this.doorGroup = this.add.group({runChildUpdate: true});
    this.buttonGroup = this.add.group({runChildUpdate: true});
    this.resetPanels = this.add.group();
    this.spawnPoints = this.add.group();  

    // Input
    keyReset = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    keyAction = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

    // Camera + flags
    this.cameras.main.setBackgroundColor('#577277');
    this.cameraInPosition = true;
    this.cameraTarget;
    
    // Tileset stuff
    const map = this.make.tilemap({key: "tilemap", tileWidth: 8, tileHeight: 8});
    const tileset = map.addTilesetImage("tilesetNew", 'tiles', 8, 8, 0, 0);
    this.ground = map.createLayer('ground', tileset, 0, 0);
    this.ground.setCollisionByProperty({collides: true});
    this.killArea = map.createLayer('killArea', tileset, 0, 0);
    this.killArea.setCollisionByProperty({kills: true});
    
    // Player
    this.playerGroup = this.add.group({maxSize: 2, runChildUpdate: true});
    this.player = new Player(this, this.currentSpawn.x, this.currentSpawn.y, 'player', 0);
    this.playerGroup.add(this.player);
    this.playerManager = new PlayerManager(this);
    this.playerManager.refreshPlayers();

    // Collision stuff
    this.physics.add.collider(this.playerGroup, this.ground);
    this.physics.add.collider(this.playerGroup, this.doorGroup);
    this.physics.add.overlap(this.playerGroup, this.buttonGroup, (player, button)=>{
      if(player.currentColor == button.color || player.currentColor == "purple") button.isOverlapping();
    })

    this.physics.add.overlap(this.playerGroup, this.killArea, (player, spike)=>{
      if(this.killArea.culledTiles.includes(spike)){
        if(player.currentColor == "purple"){
          this.playerManager.teleport(player, this.currentSpawn.x, this.currentSpawn.y);
        } else {
          if(player.isActive) this.playerManager.changeActivePlayer();
          this.playerManager.retrieveInactivePlayer(true);
        }
      }
    });
    this.physics.add.overlap(this.playerGroup, this.resetPanels, (player, panel)=>{
      if(player.currentColor == "purple") return;
      if(player.isActive) this.playerManager.changeActivePlayer();
      this.playerManager.retrieveInactivePlayer(true);
    })

    // Load custom tiles that use JS prefabs from Tiled
    this.loadSpecialTiles();
    
    // Mouse inputs
    this.input.mouse.disableContextMenu();
    this.input.on('pointerdown', (pointer)=>{
      if(pointer.rightButtonDown()){
        if(this.playerGroup.isFull()) this.playerManager.retrieveInactivePlayer();
      } 
      else if(pointer.leftButtonDown()){
        if(this.playerGroup.isFull()) this.playerManager.changeActivePlayer();
        else if(!this.playerGroup.isFull()) this.playerManager.throwRedCharacter();
      }
    })
  }

  update(){
    // Camera and spawn points will automatically change based on player position
    if(this.cameraInPosition) this.updateCamera();
    this.updateSpawnpoint();
    this.playerManager.updateLine();

    if(Phaser.Input.Keyboard.JustDown(keyReset)){
      if(this.playerGroup.isFull()) this.playerManager.retrieveInactivePlayer(true);
      this.playerManager.teleport(this.playerManager.activePlayer, this.currentSpawn.x, this.currentSpawn.y);
    }
  }

  getLocationOnGrid(obj){
    // Gets the obj's current location based on a grid
    let vector2 = new Phaser.Math.Vector2(Math.floor(obj.x/width), Math.floor(obj.y/height));
    return vector2;
  }

  updateCamera(){
    let playerGridPos = this.getLocationOnGrid(this.cameraTarget);
    let target = new Phaser.Math.Vector2(playerGridPos.x*width, playerGridPos.y*height + (4*playerGridPos.y));
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

  // When creating levels in Tiled, make sure the LEVELS and ID of buttons/doors are correct! Or else everything falls to shit :)
  loadSpecialTiles(){
    let interactables = this.levelJSON.layers[1].objects;
    let availableDoors = ["blueDoor", "redDoor", "purpleDoor"];
    let availableButtons = ["blueButton", "redButton", "purpleButton"];
    let offset = new Phaser.Math.Vector2(0, -8); // Not sure why I even need an offset, Tiled is wild

    for(const obj of interactables){
      let currentObj;
      let currentId;
      let currentLevel;
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
        let button = new Button(this, obj.x+offset.x, obj.y+offset.y, currentObj, 0, color, currentId, currentLevel);
        this.buttonGroup.add(button);
      }

      if(availableDoors.includes(currentObj)){
        let color;
        if(currentObj == "blueDoor") color = "blue";
        else if (currentObj == "redDoor") color = "red";
        else if (currentObj == "purpleDoor") color = "purple";
        else console.warn(`Door "${currentObj}" is invalid.`);
        let door = new Door(this, obj.x+offset.x, obj.y+offset.y, currentObj, 0, color, currentId, currentLevel, startOpen);
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
    Phaser.Actions.Call(this.doorGroup.getChildren(), (door)=>{ door.getTargets() })
  } 
}