class Menu extends Phaser.Scene {
  constructor() {
    super ("Menu");
  }

  preload(){
    let progressBar = this.add.graphics();
    let progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(80, 240, 480, 30);
    this.load.on('progress', function(value){
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(90, 250, 460*value, 10);
    });
    this.load.on('complete', function(){
      progressBar.destroy();
      progressBox.destroy();
    });

    this.load.path = './assets/';

    // Audio
    this.load.audio('bgm01', 'bgm01.ogg');
    this.load.audio('sfxActivate', 'mc_activateSFX.ogg');
    this.load.audio('sfxDeactivate', 'mc_deactivateSFX.ogg');
    this.load.audio('sfxMerge', 'mc_mergeShortSFX.ogg');
    this.load.audio('sfxWin', 'mc_winSFX.ogg');
    this.load.audio('sfxContact', 'mc_contactSFX.ogg');
    this.load.audio('sfxSplit', 'mc_splitSFX.ogg');
    this.load.audio('sfxStart', 'mc_startSFX.ogg');
    this.load.audio('sfxJump', 'mc_jumpSFX.ogg');

    // Menu 
    this.load.image('logo', 'logo.png');
    this.load.image('menuLevel', 'menuLevel.png');
    this.load.image('sceneTransition', 'sceneTransition.png');
    this.load.image('creditLevel', 'creditLevel.png');

    // Player
    this.load.spritesheet('playerBlueSheet', 'playerBlueSheet.png', {frameWidth: 48, frameHeight: 48});
    this.load.spritesheet('playerPurpleSheet', 'playerPurpleSheet.png', {frameWidth: 48, frameHeight: 48});
    this.load.spritesheet('playerRedSheet', 'playerRedSheet.png', {frameWidth: 48, frameHeight: 48});
    this.load.spritesheet('playerIndicatorSheet', 'playerIndicatorSheet.png', {frameWidth: 8, frameHeight: 10});
    this.load.image('smoke', 'smoke.png');

    // Buttons, doors, and other objects
    this.load.image('resetPanel', 'resetPanel.png');
    this.load.spritesheet('paintDoorSheet', 'paintDoorSheet.png', {frameWidth: 24, frameHeight: 24});
    this.load.spritesheet('buttonAnimsSheet', 'buttonAnimsSheet.png', {frameWidth: 32, frameHeight: 34});
    this.load.spritesheet('endCanvas', 'endingCanvasSheet.png', {frameWidth: 374, frameHeight: 208});

    // Tileset things
    this.load.image('paint', "paint.png");
    this.load.image('tiles', "tiles.png");
    this.load.tilemapTiledJSON('tilemap', 'newLevels.json');
    this.load.json('levelJSON', 'newLevels.json')
  }

  create() {
    this.generateAnims();

    // Audio
    if(!this.findSound('bgm01')){
      this.sound.add('bgm01', {volume: 0.1, loop: true}).play();
    }

    // Input
    keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    keyJump = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    keyJump2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    keySwap = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    keySplit = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    keyReset = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    // Scene transition
    this.sceneTransition = this.add.image(-width, 0, 'sceneTransition').setOrigin(0).setDepth(10);
    this.sceneTransition.scale = 10;
    this.tweens.add({
      targets: this.sceneTransition,
      x: width,
      ease: "Sine.easeOut",
      duration: 2000,
    });

    // Level
    this.menuLevel = this.add.image(0, 0, 'menuLevel').setOrigin(0);
    this.tempTitle = this.add.image(width/2, 100, 'logo').setOrigin(0.5);
    this.tweens.add({
      targets: this.tempTitle,
      scale: 1.2,
      ease: "Sine.easeInOut",
      duration: 1000,
      repeat: -1,
      yoyo: true
    })
    this.transitionFlag = false;

    // Player
    this.player = new Player(this, width/2, 300, 'player', 0, 'blue');
    this.player.body.setCollideWorldBounds(true);

    // Create collisions for player
    this.bodyGroup = this.add.group();
    this.physics.add.collider(this.player, this.bodyGroup);
    this.physics.add.overlap(this.player.playerRaycasts, this.bodyGroup, (raycast, body)=>{ raycast.isColliding() });
    for(let i=0; i<4; i++){
      let body = new ImmovableBody(this, 0, 0, null, 0);
      body.alpha = 0;
      this.bodyGroup.add(body);
    }
    let bodyArr = this.bodyGroup.getChildren();
    bodyArr[0].setSize(640, 8).setPosition(width/2-16, height-28);
    bodyArr[1].setSize(640, 8).setPosition(width/2-16, 188);  
    bodyArr[2].setSize(8, 200).setPosition(-4, 240);   
    bodyArr[3].setSize(8, 200).setPosition(612, 240); 

    this.button = new Button(this, 535, 336, 'blueButtonIdle', 0, "blue", 1, 1);
    this.buttonGroup = this.add.group({runChildUpdate: true});
    this.buttonGroup.add(this.button);
    this.door = new Door(this, 0, 400, 'blueDoorIdle', 0, "blue", 1, 1, false);
    this.door.targets.push(this.button);

    this.physics.add.overlap(this.player, this.button, (player, button)=>{
      button.isOverlapping();
      if(this.transitionFlag) return;
      this.transitionFlag = true;
      this.transitionToPlay();
    });
  }

  update() {
    this.player.update();
    this.door.update();
  }

  transitionToPlay(){
    this.tween = this.tweens.add({
      targets: this.sceneTransition,
      x: {from: -width*3, to: -width},
      ease: "Sine.easeOut",
      duration: 2000,
      onComplete: ()=> {this.scene.start("Catch");}
    });
  }

  findSound(soundKey){
    for (const sound of this.sound.sounds){
      if (sound.key == soundKey) return true
    }
    return false;
  }

  generateAnims(){
    // Players
    this.anims.create({
      key: 'playerIndicator', 
      frames: this.anims.generateFrameNumbers('playerIndicatorSheet', {start: 0, end: 7, first: 0}),
      frameRate: 16,
      repeat: -1
    });

    // Blue
    this.anims.create({
      key: 'bluePlayerIdle', 
      frames: this.anims.generateFrameNumbers('playerBlueSheet', {start: 0, end: 2, first: 0}),
      frameRate: 2,
      repeat: -1
    });
    this.anims.create({
      key: 'bluePlayerRun', 
      frames: this.anims.generateFrameNumbers('playerBlueSheet', {start: 4, end: 7, first: 4}),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'bluePlayerJump', 
      frames: this.anims.generateFrameNumbers('playerBlueSheet', {start: 8, end: 9, first: 8}),
      frameRate: 8,
    });
    this.anims.create({
      key: 'bluePlayerWalljump', 
      frames: this.anims.generateFrameNumbers('playerBlueSheet', {start: 12, end: 13, first: 12}),
      frameRate: 8,
    });
    this.anims.create({
      key: 'bluePlayerInactive', 
      frames: this.anims.generateFrameNumbers('playerBlueSheet', {start: 16, end: 16, first: 16}),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'bluePlayerDie', 
      frames: this.anims.generateFrameNumbers('playerBlueSheet', {start: 20, end: 23, first: 20}),
      frameRate: 10,
    });

    // Purple
    this.anims.create({
      key: 'purplePlayerIdle', 
      frames: this.anims.generateFrameNumbers('playerPurpleSheet', {start: 0, end: 2, first: 0}),
      frameRate: 2,
      repeat: -1
    });
    this.anims.create({
      key: 'purplePlayerRun', 
      frames: this.anims.generateFrameNumbers('playerPurpleSheet', {start: 4, end: 7, first: 4}),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'purplePlayerJump', 
      frames: this.anims.generateFrameNumbers('playerPurpleSheet', {start: 8, end: 9, first: 8}),
      frameRate: 8,
    });
    this.anims.create({
      key: 'purplePlayerWalljump', 
      frames: this.anims.generateFrameNumbers('playerPurpleSheet', {start: 12, end: 13, first: 12}),
      frameRate: 8,
    });
    this.anims.create({
      key: 'purplePlayerInactive', 
      frames: this.anims.generateFrameNumbers('playerPurpleSheet', {start: 16, end: 16, first: 16}),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'purplePlayerDie', 
      frames: this.anims.generateFrameNumbers('playerPurpleSheet', {start: 20, end: 23, first: 20}),
      frameRate: 10,
    });

    // Red
    this.anims.create({
      key: 'redPlayerIdle', 
      frames: this.anims.generateFrameNumbers('playerRedSheet', {start: 0, end: 2, first: 0}),
      frameRate: 2,
      repeat: -1
    });
    this.anims.create({
      key: 'redPlayerRun', 
      frames: this.anims.generateFrameNumbers('playerRedSheet', {start: 4, end: 7, first: 4}),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'redPlayerJump', 
      frames: this.anims.generateFrameNumbers('playerRedSheet', {start: 8, end: 9, first: 8}),
      frameRate: 8,
    });
    this.anims.create({
      key: 'redPlayerWalljump', 
      frames: this.anims.generateFrameNumbers('playerRedSheet', {start: 12, end: 13, first: 12}),
      frameRate: 8,
    });
    this.anims.create({
      key: 'redPlayerInactive', 
      frames: this.anims.generateFrameNumbers('playerRedSheet', {start: 16, end: 16, first: 16}),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'redPlayerDie', 
      frames: this.anims.generateFrameNumbers('playerRedSheet', {start: 20, end: 23, first: 20}),
      frameRate: 10,
    });


    // Doors
    this.anims.create({
      key: 'blueDoorIdle', 
      frames: this.anims.generateFrameNumbers('paintDoorSheet', {start: 0, end: 6, first: 0}),
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: 'blueDoorOpen', 
      frames: this.anims.generateFrameNumbers('paintDoorSheet', {start: 7, end: 12, first: 7}),
      frameRate: 16,
    });
    this.anims.create({
      key: 'blueDoorClose', 
      frames: this.anims.generateFrameNumbers('paintDoorSheet', {start: 12, end: 7, first: 12}),
      frameRate: 16,
    });
    this.anims.create({
      key: 'redDoorIdle', 
      frames: this.anims.generateFrameNumbers('paintDoorSheet', {start: 14, end: 20, first: 14}),
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: 'redDoorOpen', 
      frames: this.anims.generateFrameNumbers('paintDoorSheet', {start: 21, end: 26, first: 21}),
      frameRate: 16,
    });
    this.anims.create({
      key: 'redDoorClose', 
      frames: this.anims.generateFrameNumbers('paintDoorSheet', {start: 26, end: 21, first: 26}),
      frameRate: 16,
    });
    this.anims.create({
      key: 'purpleDoorIdle', 
      frames: this.anims.generateFrameNumbers('paintDoorSheet', {start: 28, end: 34, first: 28}),
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: 'purpleDoorOpen', 
      frames: this.anims.generateFrameNumbers('paintDoorSheet', {start: 35, end: 40, first: 35}),
      frameRate: 16,
    });
    this.anims.create({
      key: 'purpleDoorClose', 
      frames: this.anims.generateFrameNumbers('paintDoorSheet', {start: 40, end: 35, first: 40}),
      frameRate: 16,
    });

    // Buttons
    this.anims.create({
      key: 'blueButtonActive', 
      frames: this.anims.generateFrameNumbers('buttonAnimsSheet', {start: 0, end: 5, first: 0}),
      frameRate: 6,
      repeat:-1
    });
    this.anims.create({
      key: 'redButtonActive', 
      frames: this.anims.generateFrameNumbers('buttonAnimsSheet', {start: 6, end: 11, first: 6}),
      frameRate: 6,
      repeat:-1
    });
    this.anims.create({
      key: 'purpleButtonActive', 
      frames: this.anims.generateFrameNumbers('buttonAnimsSheet', {start: 12, end: 17, first: 12}),
      frameRate: 10,
    });
  }
}