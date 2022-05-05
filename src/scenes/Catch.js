class Catch extends Phaser.Scene{
  constructor(){
    super("Catch");
  }

  preload(){
    this.load.path = "./assets/";
    this.load.image('player', 'testPlayer.png');
    this.load.image('ground', 'testGround.png');
    this.load.image('button', 'button.png');
    this.load.image('door', 'door.png');

    // Test level
    this.load.image('tiles', "tiles.png");
    this.load.tilemapTiledJSON('tilemap', 'testLevel.json');
    this.load.json('levelJSON', 'testLevel.json')
  }

  create(){
    // Variables and such
    this.physics.world.gravity.y = 2000;
    this.levelJSON = this.cache.json.get('levelJSON');

    // Input
    cursors = this.input.keyboard.createCursorKeys();
    keyAction = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // Set up scene
    this.cameras.main.setBackgroundColor('#3256a8');
    this.cameraInPosition = true;
    
    // Ground and platforms
    const map = this.make.tilemap({key: "tilemap", tileWidth: 32, tileHeight: 32});
    const tileset = map.addTilesetImage("tempTileset", 'tiles', 32, 32, 0, 0);
    const ground = map.createLayer('ground', tileset, 0, 0);
    ground.setCollisionByProperty({collides: true});
    // Player
    this.player = new Player(this, 64, 64, 'player', 0);

    // Ball
    this.playerGroup = this.add.group({maxSize: 2, runChildUpdate: true});
    this.playerGroup.add(this.player);
    this.physics.add.collider(this.playerGroup, ground);

    this.loadInteractables();
  }

  update(){
    if(this.cameraInPosition) this.updateCamera();

    // Player wants to do something
    if(Phaser.Input.Keyboard.JustDown(keyAction)){
      // If there's no ball yet, throw one
      if(!this.playerGroup.isFull()){
        this.throwBall();
        this.player.changeScale(1, 0.5);
      } else if (this.playerGroup.isFull()){ // Teleport to ball
        let ball = this.playerGroup.getChildren()[1];
        let offset = 16; // Offset is to prevent player from clipping into the collision, letting them go through obstacles
        if(ball.currentAction == "right") this.player.teleport(ball.x-offset, ball.y-offset)
        else if(ball.currentAction == "left") this.player.teleport(ball.x+offset, ball.y-offset)
        else this.player.teleport(ball.x, ball.y-offset)
        this.player.changeScale(0.5, 1);
        ball.destroy();
      }
    }
    // Don't teleport to ball, instead revert back to normal
    if(Phaser.Input.Keyboard.JustDown(keyLeft) && this.playerGroup.isFull()){
      let ball = this.playerGroup.getChildren()[1];
      let offset = 16;
      this.player.teleport(this.player.x, this.player.y-offset);
      this.player.changeScale(0.5, 1);
      ball.destroy();
    }
  }

  throwBall(){
    let ball = new Ball(this, this.player.x, this.player.y, 'player', 0, this.player);
    ball.throw();
    this.playerGroup.add(ball);
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

  loadInteractables(){
    this.buttonGroup = this.add.group();
    this.doorGroup = this.add.group({runChildUpdate: true});
    this.physics.add.overlap(this.playerGroup, this.buttonGroup, (player, button)=> {button.playerPressed()});
    this.physics.add.collider(this.playerGroup, this.doorGroup);

    let interactables = this.levelJSON.layers[1].objects;
    for(const obj of interactables){
      let properties = obj.properties[0];
      let offset = new Phaser.Math.Vector2(512, 480); // idk why I even need the offset, Tiled is wild
      if(properties.name == "button"){
        let button = new Button(this, obj.x+offset.x, obj.y+offset.y, 'button', 0, properties.value)
        this.buttonGroup.add(button);
      }
      if(properties.name == "door"){
        // Get the targets of the door first, then create the door
        let targets = [];
        let buttons = this.buttonGroup.getChildren();
        for(const button of buttons){
          if(button.id == properties.value) targets.push(button);
        }
        let door = new Door(this, obj.x+offset.x, obj.y+offset.y, 'door', 0, properties.value, targets)
        this.doorGroup.add(door);
      }
    }
  } 
}