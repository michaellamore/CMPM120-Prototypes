class Tetris extends Phaser.Scene{
  constructor(){
    super("Tetris");
    this.tileSize = 48;
  }

  preload(){
    this.load.path = "./assets/";
    this.load.image('player', 'testPlayer.png');
    this.load.image('ground', 'testGround.png');
  }

  create(){
    let text = `Player can add a "body part" and launch it. Could be used for buttons, collecting things, etc`
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
      let groundTile = new Obstacle(this, i, this.tileSize*4, 'ground', 0);
      this.ground.add(groundTile);
    }

    this.player = new Player(this, width/2, height-100, 'player', 0);
    this.playerGroup = this.add.group({ runChildUpdate: true});

    this.cube1 = new StickyCube(this, this.tileSize*8, this.tileSize, 'player', 0, this.player);
    this.playerGroup.add(this.cube1);

    this.physics.add.collider(this.player, this.ground); 
    this.physics.add.collider(this.playerGroup, this.ground); 
    this.physics.add.overlap(this.player, this.playerGroup, this.pickUpCube);
  }

  update(){
    this.player.update();

    if(Phaser.Input.Keyboard.JustDown(keyAction)){
      Phaser.Actions.Call(this.playerGroup.getChildren(), (cube)=>{ 
        if(!cube.taken) return;
        this.player.resetBodySize();
        cube.taken = false;
        cube.throw();
      });
    } 
  }

  pickUpCube(player, cube){
    if(cube.taken) return;
    let tileSize = 48
    if(keyAction.isDown){
      if(cursors.left.isDown) {
        player.changeBodySize(tileSize*2, tileSize, -tileSize, 0);
        cube.setTarget(-tileSize, 0);
        cube.taken = true;
      } else if(cursors.right.isDown) {
        player.changeBodySize(tileSize*2, tileSize, 0, 0);
        cube.setTarget(tileSize, 0);
        cube.taken = true;
      } else if (cursors.up.isDown){
        player.changeBodySize(tileSize, tileSize*2, 0, -tileSize);
        cube.setTarget(0, -tileSize);
        cube.taken = true;
      }
    }
  }
}