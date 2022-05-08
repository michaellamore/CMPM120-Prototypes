class Catch extends Phaser.Scene{
  constructor(){
    super("Catch");
  }

  preload(){
    this.load.path = "./assets/";
    this.load.image('player', 'testPlayer.png');
    this.load.image('button', 'button.png');
    this.load.image('door', 'door.png');

    // Test level
    this.load.image('tiles', "tiles.png");
    this.load.tilemapTiledJSON('tilemap', 'testLevel.json');
    this.load.json('levelJSON', 'testLevel.json')
  }

  create(){
    // Variables and such
    this.physics.world.gravity.y = 1400;
    this.levelJSON = this.cache.json.get('levelJSON');
    this.currentSpawn = new Phaser.Math.Vector2(32, 128);

    // Input
    cursors = this.input.keyboard.createCursorKeys();
    keyReset = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    keyAction = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

    // Camera + flags
    this.cameras.main.setBackgroundColor('#253a5e');
    this.cameraInPosition = true;
    
    // Tileset stuff
    const map = this.make.tilemap({key: "tilemap", tileWidth: 8, tileHeight: 8});
    const tileset = map.addTilesetImage("tempTileset", 'tiles', 8, 8, 0, 0);
    this.ground = map.createLayer('ground', tileset, 0, 0);
    this.ground.setCollisionByProperty({collides: true});
    this.killArea = map.createLayer('killArea', tileset, 0, 0);
    this.killArea.setCollisionByProperty({kills: true});
    
    // Player
    this.playerGroup = this.add.group({maxSize: 2, runChildUpdate: true});
    this.player = new Player(this, this.currentSpawn.x, this.currentSpawn.y, 'player', 0, this.playerGroup, this.ground);
    this.playerGroup.add(this.player);

    // Collision stuff
    this.physics.add.collider(this.playerGroup, this.ground);
    this.physics.add.overlap(this.playerGroup, this.killArea, this.collideWithKillArea, null, this);

    // Load custom tiles that use JS prefabs from Tiled
    this.loadSpecialTiles();
  }

  update(){
    // Camera and spawn points will automatically change based on player position
    if(this.cameraInPosition) this.updateCamera();
    this.updateSpawnpoint();
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
    tween.on("complete", ()=>{
      this.cameraInPosition = true;
    });
  }

  updateSpawnpoint(){
    let playerGridPos = this.getLocationOnGrid(this.player);
    Phaser.Actions.Call(this.spawnGroup.getChildren(), (spawn)=>{ 
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
    this.doorGroup = this.add.group({runChildUpdate: true});
    this.buttonGroup = this.add.group({runChildUpdate: true});
    this.spawnGroup = this.add.group();
    this.physics.add.overlap(this.playerGroup, this.buttonGroup, (player, button)=> { button.isColliding(); });
    this.physics.add.collider(this.playerGroup, this.doorGroup);

    let interactables = this.levelJSON.layers[1].objects;
    for(const obj of interactables){
      let properties = obj.properties[0];
      let offset = new Phaser.Math.Vector2(0, -8); // idk why I even need the offset, Tiled is wild
      if(properties.name == "button"){
        let button = new Button(this, obj.x+offset.x, obj.y+offset.y, 'button', 0, this.playerGroup.getChildren(), properties.value);
        this.buttonGroup.add(button);
      }
      if(properties.name == "door"){
        // Get the targets of the door first, then create the door
        let targets = [];
        let buttons = this.buttonGroup.getChildren();
        for(const button of buttons){
          if(button.id == properties.value) targets.push(button);
        }
        let door = new Door(this, obj.x+offset.x, obj.y+offset.y, 'door', 0, properties.value, targets);
        this.doorGroup.add(door);
        if(obj.properties[1] != null){
          let staysOpen = obj.properties[1].value;
          if(staysOpen) door.stayOpen = true;
        }
      }

      if(properties.name == "spawnpoint"){
        let spawn = new Spawn(this, obj.x + offset.x, obj.y+offset.y, null, 0);
        this.spawnGroup.add(spawn);
      }
    }
  } 
}