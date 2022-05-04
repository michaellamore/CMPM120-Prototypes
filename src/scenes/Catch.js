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
    let text = "Split yourself in half. Can fit in smaller spaces, and the player can teleport back to their other half. Collect things? Buttons?"
    this.add.dom(width/2, 0, 'p', 'padding: 10px; background-color: black; color: white; width: 1280; height: 40px; font: 20px Arial; text-align: center;', text).setOrigin(0.5);

    // Variables and such
    this.physics.world.gravity.y = 3000;
    this.currentAction = "none";

    // Input
    cursors = this.input.keyboard.createCursorKeys();
    keyAction = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);

    // Set up Scene
    this.cameras.main.setBackgroundColor('#3256a8');
    
    // Ground
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

    this.physics.add.collider(this.player, this.ground);

    this.ballGroup = this.add.group({maxSize: 1, runChildUpdate: true});
    this.physics.add.collider(this.ballGroup, this.ground);
  }

  update(){
    this.player.update();

    if(cursors.left.isDown) {
      this.currentAction = "left";
    } else if(cursors.right.isDown) {
      this.currentAction = "right";
    } else {
      this.currentAction = "none";
    }

    if(Phaser.Input.Keyboard.JustDown(keyAction) && !this.ballGroup.isFull()){
      let ball = new Ball(this, this.player.x, this.player.y, 'player', 0, this.player);
      ball.throw(this.currentAction);
      this.ballGroup.add(ball);
      this.player.scale = 0.75;
    }
  }
}