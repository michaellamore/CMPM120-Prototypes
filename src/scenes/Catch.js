class Catch extends Phaser.Scene{
  constructor(){
    super("Catch");
  }

  preload(){
    this.load.path = "./assets/";
    this.load.image('player', 'testPlayer.png');
    this.load.image('ground', 'testGround.png');
    this.load.image('button', 'button.png');

    // Test level
    this.load.image('tiles', "tiles.png");
    this.load.tilemapTiledJSON('tilemap', 'testLevel.json');
  }

  create(){
    // Variables and such
    this.physics.world.gravity.y = 2000;
    // Input
    cursors = this.input.keyboard.createCursorKeys();
    keyAction = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);

    // Set up scene
    this.cameras.main.setBackgroundColor('#3256a8');
    this.cameraInPosition = true;
    
    // Ground and platforms
    const map = this.make.tilemap({key: "tilemap", tileWidth: 32, tileHeight: 32});
    const tileset = map.addTilesetImage("tempTileset", 'tiles', 32, 32, 0, 0);
    const ground = map.createLayer('ground', tileset, 0, 0);
    ground.setCollisionByProperty({collides: true});

    this.player = new Player(this, 64, 64, 'player', 0);
    this.physics.add.collider(this.player, ground);
    

    this.camera = this.cameras.main;
    this.camera.setLerp(0.2, 0.2);

    this.ballGroup = this.add.group({maxSize: 1, runChildUpdate: true});
    this.physics.add.collider(this.ballGroup, ground);
  }

  update(){
    if(this.cameraInPosition) this.updateCamera();
    this.player.update();

    // Player wants to do something
    if(Phaser.Input.Keyboard.JustDown(keyAction)){
      // If there's no ball yet, throw one
      if(!this.ballGroup.isFull()){
        this.throwBall();
        this.player.changeScale(1, 0.5);
      } else if (this.ballGroup.isFull()){ // If there's already a ball, teleport to it
        let ball = this.ballGroup.getChildren()[0];
        let offset = 16; // Offset is to prevent player from clipping into the collision, letting them go through obstacles
        if(ball.currentAction == "right") this.player.teleport(ball.x-offset, ball.y-offset)
        else if(ball.currentAction == "left") this.player.teleport(ball.x+offset, ball.y-offset)
        else this.player.teleport(ball.x, ball.y-offset)
        this.player.changeScale(0.5, 1);
        ball.destroy();
      }
    }
  }

  throwBall(){
    let ball = new Ball(this, this.player.x, this.player.y, 'player', 0, this.player);
    ball.throw();
    this.ballGroup.add(ball);
  }

  updateCamera(){
    // currently only moves along x. I think it'll be easy to let it scroll in Y too
    let currentLevel = Math.floor(this.player.x / width);
    let target = width*currentLevel;
    this.cameraInPosition = false;
    let tween = this.tweens.add({
      targets: this.camera,
      scrollX: target,
      ease: "Sine.easeOut",
      duration: 300,
      repeat: 0,
    })
    tween.on("complete", ()=>{
      this.cameraInPosition = true;
    });
  }
}