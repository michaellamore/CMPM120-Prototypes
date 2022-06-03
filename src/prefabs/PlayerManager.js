class PlayerManager {
  constructor(scene){
    this.scene = scene;
    this.activePlayer = null;
    this.inactivePlayer = null;
    this.canSwap = true;
    this.swapDistance = 100;

    this.refreshPlayers();

    // QOL stuff
    // Merge line between two players
    this.playerLine = this.scene.add.line(0, 0, 0, 0, 0, 0, 0xebede9).setDepth(4);
    // Player indicator
    this.indicatorOffset = new Phaser.Math.Vector2(0, -24);
    this.indicator = this.scene.add.sprite(this.activePlayer.x+this.indicatorOffset.x, this.activePlayer.y+this.indicatorOffset.y, 'playerIndicator', 0).setOrigin(0.5).setDepth(5);
    this.indicator.anims.play('playerIndicator');
  }

  update(){
    this.updateLine();
    this.updatePlayerIndicator();

    if(this.playerMergeTween != null){
      this.playerMergeTween.updateTo('x', this.activePlayer.x, true);
      this.playerMergeTween.updateTo('y', this.activePlayer.y, true);
    }
  }

  retrieveInactivePlayer(bypass=false){
    this.refreshPlayers();
    if(!this.canSwap) return;
    // If players are too far away, you can't merge back together
    if(!bypass){ // if bypass is true, you can merge players from any distance (useful for resetPanel collision);
      let distance = Phaser.Math.Distance.BetweenPoints(this.activePlayer, this.inactivePlayer);
      if(distance > this.swapDistance) return;
    }
    
    this.canSwap = false;
    this.playerLine.alpha = 0;
    this.inactivePlayer.body.setEnable(false);
    this.inactivePlayer.state = "BUSY";
    this.activePlayer.currentColor = "purple";

    this.inactivePlayer.anims.play(`${this.inactivePlayer.currentColor}PlayerDie`);
    this.inactivePlayer.on('animationcomplete', (animation, frame)=>{
      if(animation.key == `${this.inactivePlayer.currentColor}PlayerDie`){
        this.inactivePlayer.customDestroy();
        this.canSwap = true;
      }
    })
    this.playerMergeTween = this.scene.tweens.add({
      targets: this.inactivePlayer,
      x: this.activePlayer.x,
      y: this.activePlayer.y,
      ease: "Sine.easeInOut",
      duration: 700,
      onComplete: ()=>{ this.playerMergeTween = null; }
    })
  }

  respawn(x, y){
    this.refreshPlayers();
    if(this.scene.playerGroup.isFull()) this.retrieveInactivePlayer(true);
    this.canSwap = false;
    this.activePlayer.body.setEnable(false);
    this.activePlayer.state = "BUSY";
    this.activePlayer.anims.play(`${this.activePlayer.currentColor}PlayerDie`);
    this.activePlayer.on('animationcomplete', (animation, frame)=>{
      if(animation.key == `${this.activePlayer.currentColor}PlayerDie`){
        this.activePlayer.customDestroy();
        Phaser.Actions.Call(this.scene.buttonGroup.getChildren(), (button)=> button.validPlayer=null);
        let player = new Player(this.scene, x, y, 'purplePlayerIdle', 0, 'purple');
        this.scene.playerGroup.add(player);
        this.canSwap = true;
        this.refreshPlayers();
      }
    })
  }

  spawnRedCharacter(){
    this.refreshPlayers();
    if(!this.canSwap) return;
    this.scene.sound.play('split');

    // add red player
    let redPlayer = new Player(this.scene, this.activePlayer.x, this.activePlayer.y, 'player', 0, 'red');
    redPlayer.isActive = false;
    this.scene.playerGroup.add(redPlayer);

    // update active player
    this.activePlayer.currentColor = "blue";
  }

  spawnRedCharacterSpecial(targetX, targetY){
    this.refreshPlayers();
    if(!this.canSwap) return;
    this.scene.sound.play('split');

    // add red player
    let redPlayer = new Player(this.scene, targetX, targetY, 'player', 0, 'red');
    redPlayer.isActive = false;
    this.scene.playerGroup.add(redPlayer);

    // update active player
    this.activePlayer.currentColor = "blue";
  }

  changeActivePlayer(){
    if(!this.canSwap) return;
    Phaser.Actions.Call(this.scene.playerGroup.getChildren(), (player)=>{
      player.isActive = !player.isActive
    })
    this.refreshPlayers();
    this.tweenPlayerIndicator();
  }

  refreshPlayers(){
    Phaser.Actions.Call(this.scene.playerGroup.getChildren(), (player)=>{
      if(player.isActive){
        this.activePlayer = player;
        player.setDepth(6);
      }
      if(!player.isActive) {
        this.inactivePlayer = player;
        player.setDepth(5);
      }
      this.scene.cameraTarget = this.activePlayer;
    })
  }

  updateLine(){
    this.refreshPlayers();
    // Disappear if there's only 1 player, too far away, or if getting teleported
    if(!this.scene.playerGroup.isFull() || !this.canSwap ||
      Phaser.Math.Distance.BetweenPoints(this.activePlayer, this.inactivePlayer) > this.swapDistance){
      return this.playerLine.alpha = 0;
    } else {
      this.playerLine.setTo(this.activePlayer.x, this.activePlayer.y, this.inactivePlayer.x, this.inactivePlayer.y);
      this.playerLine.alpha = 1;
    }
  }

  tweenPlayerIndicator(){
    this.indicatorTween = this.scene.tweens.add({
      targets: this.indicator,
      x: {from: this.indicator.x, to: this.activePlayer.x + this.indicatorOffset.x},
      y: {from: this.indicator.y, to: this.activePlayer.y + this.indicatorOffset.y},
      scale: {from: 2, to: 1},
      ease: "Sine.easeInOut",
      duration: 500,
      onComplete: ()=>{ this.indicatorTween = null; }
    })
  }

  updatePlayerIndicator(){
    let indicatorX = this.activePlayer.x + this.indicatorOffset.x;
    let indicatorY = this.activePlayer.y + this.indicatorOffset.y;
    // If indicator is in tween, change tween's target dynamically
    if(this.indicatorTween != null){
      this.indicatorTween.updateTo('x', indicatorX, true);
      this.indicatorTween.updateTo('y', indicatorY, true);
      return;
    }  
    // If not in tween, let it hover over active player's head
    this.indicator.setPosition(indicatorX, indicatorY);
  }
}