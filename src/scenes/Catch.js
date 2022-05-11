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

    // Test level
    this.load.image('tiles', "tiles.png");
    this.load.tilemapTiledJSON('tilemap', 'levels.json');
    this.load.json('levelJSON', 'levels.json')
  }

  create(){
    // Variables and such
    this.physics.world.gravity.y = 1400;
    this.levelJSON = this.cache.json.get('levelJSON');
    this.currentSpawn = new Phaser.Math.Vector2(32, 128); // Change this to X and Y of level you want to test
    this.doorGroup = this.add.group({runChildUpdate: true});
    this.buttonGroup = this.add.group({runChildUpdate: true});
    
    this.spawnPoints = this.add.group();  

    // Input
    cursors = this.input.keyboard.createCursorKeys();
    keyReset = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    keyAction = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

    // Camera + flags
    this.cameras.main.setBackgroundColor('#577277');
    this.cameraInPosition = true;
    
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
    this.player.alpha = 1;
    this.playerGroup.add(this.player);
    this.playerManager = new PlayerManager(this);

    // Collision stuff
    this.physics.add.collider(this.playerGroup, this.ground);
    this.physics.add.collider(this.playerGroup, this.doorGroup);
    this.physics.add.overlap(this.playerGroup, this.buttonGroup, (player, button)=>{
      if(player.currentColor == button.color || player.currentColor == "purple") button.isOverlapping();
    })
    this.physics.add.overlap(this.playerGroup, this.killArea, this.collideWithKillArea, null, this);

    // Load custom tiles that use JS prefabs from Tiled
    this.loadSpecialTiles();
  }

  update(){
    // Camera and spawn points will automatically change based on player position
    if(this.cameraInPosition) this.updateCamera();
    // this.updateSpawnpoint();
    if(Phaser.Input.Keyboard.JustDown(cursors.up) && !this.playerGroup.isFull()) this.playerManager.throwRedCharacter();
    if(Phaser.Input.Keyboard.JustDown(cursors.right) && this.playerGroup.isFull()) this.playerManager.changeActivePlayer();
    if(Phaser.Input.Keyboard.JustDown(cursors.down) && this.playerGroup.isFull()) this.playerManager.retrieveInactivePlayer();
  }

  getLocationOnGrid(obj){
    // Gets the obj's current location based on a grid
    let vector2 = new Phaser.Math.Vector2(Math.floor(obj.x/width), Math.floor(obj.y/height));
    return vector2;
  }

  updateCamera(){
    let gridLocation = this.getLocationOnGrid(this.player);
    let target = new Phaser.Math.Vector2(gridLocation.x * width, gridLocation.y * height);
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

  collideWithKillArea(player, tile){
    if(this.killArea.culledTiles.includes(tile)){
      if(player.isBall) { // If the ball hit the kill area, just make the player get it back
        this.player.retrieveBall(); 
      } else if (player.isBall == null){ // If player hit the kill area, go back to spawn. If ball was out, take it too
        if(this.playerGroup.isFull()) this.player.retrieveBall();
        this.player.teleport(this.currentSpawn.x, this.currentSpawn.y);
      }
    }
  }

  // When creating levels in Tiled, create the buttons first THEN the door. This code stops working if you do it the other way around
  loadSpecialTiles(){
    let interactables = this.levelJSON.layers[1].objects;
    let availableDoors = ["blueDoor", "redDoor", "purpleDoor"];
    let availableButtons = ["blueButton", "redButton", "purpleButton"];
    let offset = new Phaser.Math.Vector2(0, -8); // Not sure why I even need an offset, but it doesn't work without it..

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
        
      }
      console.log(currentObj, currentId, currentLevel, startOpen);

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
      if(currentObj == "spawnpoint") {
        let spawnpoint = new Spawn(this, obj.x+offset.x, obj.y+offset.y, null, 0);
        this.spawnPoints.add(spawnpoint);
      }

      // Now do stuff that requires everything to be loaded to work properly
      Phaser.Actions.Call(this.doorGroup.getChildren(), (door)=>{ door.getTargets() })
    }
  } 
}