class Catch extends Phaser.Scene{
  constructor(){
    super("Catch");
    this.tileSize = 48;
  }

  preload(){
    this.load.path = "./assets/";
    this.load.image('player', 'testPlayer.png');
    this.load.image('ground', 'testGround.png');
  }

  create(){
    // Variables and such
    this.physics.world.gravity.y = 3000;

    // Input
    cursors = this.input.keyboard.createCursorKeys();
    keyAction = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);

    // Set up scene
    this.cameras.main.setBackgroundColor('#3256a8');
    
    // Ground and platforms
    this.ground = this.add.group();
    for(let i = 0; i < game.config.width; i += this.tileSize) {
      let groundTile = new Obstacle(this, i, height-this.tileSize, 'ground', 0);
      this.ground.add(groundTile);
    }
    for(let i = this.tileSize*7; i < game.config.width; i += this.tileSize) {
      let groundTile = new Obstacle(this, i, this.tileSize*3, 'ground', 0);
      this.ground.add(groundTile);
    }
    let obstacle1 = new Obstacle(this, this.tileSize*7, 0, 'ground', 0);
    let obstacle2 = new Obstacle(this, this.tileSize*7, this.tileSize*1, 'ground', 0);
    this.ground.add(obstacle1);
    this.ground.add(obstacle2);


    this.player = new Player(this, width/2, height-100, 'player', 0);
    this.player.body.setCollideWorldBounds();
    this.physics.add.collider(this.player, this.ground);

    this.ballGroup = this.add.group({maxSize: 1, runChildUpdate: true});
    this.physics.add.collider(this.ballGroup, this.ground);
  }

  update(){
    this.player.update();

    // Player wants to do something
    if(Phaser.Input.Keyboard.JustDown(keyAction)){
      // If there's no ball yet, throw one
      if(!this.ballGroup.isFull()){
        this.throwBall();
        this.player.changeScale(1, 0.75);
      } else if (this.ballGroup.isFull()){ // If there's already a ball, teleport to it
        let ball = this.ballGroup.getChildren()[0];
        let offset = 10; // Offset is to prevent player from clipping into the collision, letting them go through obstacles
        if(ball.currentAction == "right") this.player.teleport(ball.x-offset, ball.y)
        else if(ball.currentAction == "left") this.player.teleport(ball.x+offset, ball.y)
        else this.player.teleport(ball.x, ball.y-offset)
        this.player.changeScale(0.75, 1);
        ball.destroy();
      }
    }
  }

  throwBall(){
    let ball = new Ball(this, this.player.x, this.player.y, 'player', 0, this.player);
    ball.throw();
    this.ballGroup.add(ball);
  }
}