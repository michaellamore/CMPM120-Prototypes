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

    // Input
    cursors = this.input.keyboard.createCursorKeys();
    keyAction = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

    // Camera + flags
    this.cameras.main.setBackgroundColor('#253a5e');
    this.cameraInPosition = true;
    
    // Tileset stuff
    const map = this.make.tilemap({key: "tilemap", tileWidth: 8, tileHeight: 8});
    const tileset = map.addTilesetImage("tempTileset", 'tiles', 8, 8, 0, 0);
    this.ground = map.createLayer('ground', tileset, 0, 0);
    this.ground.setCollisionByProperty({collides: true});
    this.killArea = map.createLayer('killArea', tileset, 0, 8*16);
    this.killArea.setCollisionByProperty({kills: true});
    
    // Player
    this.currentSpawn = new Phaser.Math.Vector2(64, 64);
    this.player = new Player(this, this.currentSpawn.x, this.currentSpawn.y, 'player', 0, this.ground);
    this.playerGroup = this.add.group({maxSize: 2, runChildUpdate: true});
    this.playerGroup.add(this.player);
    this.physics.add.collider(this.playerGroup, this.ground);
    this.physics.add.overlap(this.playerGroup, this.killArea, (player, tile)=>{
      if(this.killArea.culledTiles.includes(tile)) this.resetPlayer();
    });

    this.loadInteractables();
  }

  update(){
    if(this.cameraInPosition) this.updateCamera();
    this.updateSpawnpoint();
    if(Phaser.Input.Keyboard.JustDown(keyDown)){ 
      console.log(this.currentSpawn);
    };
    // Player wants to do something
    if(Phaser.Input.Keyboard.JustDown(keyAction)){
      // If there's no ball yet, throw one
      if(!this.playerGroup.isFull()){
        this.throwBall();
        this.player.changeScale(1, 0.5);
      } else if (this.playerGroup.isFull()){
        this.teleportToBall();
      }
    }
    // Don't teleport to ball, instead revert back to normal
    if(Phaser.Input.Keyboard.JustDown(keyLeft) && this.playerGroup.isFull()){
      this.retrieveBall();
    }
  }

  throwBall(){
    let ball = new Ball(this, this.player.x, this.player.y, 'player', 0, this.player, this.ground);
    ball.throw();
    this.playerGroup.add(ball);
  }

  teleportToBall(){
    let ball = this.playerGroup.getChildren()[1];
    let raycastColl = ball.checkRaycasts();
    if((raycastColl[0] && raycastColl[1]) || (raycastColl[2] && raycastColl[3])){
      return;
    }
    ball.destroyRaycasts();

    let inc = 4
    let offset = new Phaser.Math.Vector2(0, 0);
    if(raycastColl[0]) offset.x += inc;
    if(raycastColl[1]) offset.x -= inc;
    if(raycastColl[2]) offset.y += inc;
    if(raycastColl[3]) offset.y -= inc;

    this.player.teleport(ball.x + offset.x, ball.y + offset.y);
    this.player.changeScale(0.5, 1);
    ball.destroy();
  }

  retrieveBall(){
    let raycastColl = this.player.checkRaycasts();
    if((raycastColl[0] && raycastColl[1]) || (raycastColl[2] && raycastColl[3])){
      return;
    }
    let ball = this.playerGroup.getChildren()[1];
    ball.destroyRaycasts();

    let inc = 4
    let offset = new Phaser.Math.Vector2(0, 0);
    if(raycastColl[0]) offset.x += inc;
    if(raycastColl[1]) offset.x -= inc;
    if(raycastColl[2]) offset.y += inc;
    if(raycastColl[3]) offset.y -= inc;

    this.player.teleport(this.player.x + offset.x, this.player.y + offset.y);
    this.player.changeScale(0.5, 1);
    ball.destroy();
  }

  

  getInput(){
    // Should be 8 directions, plus no input = 9 possibilities
    if(cursors.left.isDown && cursors.up.isDown) { return "upLeft" } 
    else if(cursors.left.isDown && cursors.down.isDown) { return "downLeft" } 
    else if(cursors.right.isDown && cursors.up.isDown) { return "upRight" } 
    else if(cursors.right.isDown && cursors.down.isDown) { return "downRight" } 
    else if(cursors.up.isDown) { return "up" } 
    else if(cursors.down.isDown) { return "down" } 
    else if(cursors.left.isDown) { return "left"} 
    else if(cursors.right.isDown) { return "right";} 
    else { return "none"; }
  }

  getLocationOnGrid(obj){
    // Gets the obj's current location based on a grid
    let vector2 = new Phaser.Math.Vector2(Math.floor(obj.x/width), Math.floor(obj.y/height));
    return vector2;
  }

  updateCamera(){
    // currently only moves along x. I think it'll be easy to let it scroll in Y too
    let currentLevel = Math.floor(this.player.x / width);
    let target = width*currentLevel;
    this.cameraInPosition = false;
    let tween = this.tweens.add({
      targets: this.cameras.main,
      scrollX: target,
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

  resetPlayer(){
    if(this.playerGroup.isFull())this.retrieveBall();
    this.player.x = this.currentSpawn.x;
    this.player.y = this.currentSpawn.y;
  }

  loadInteractables(){
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