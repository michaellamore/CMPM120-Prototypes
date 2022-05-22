class PlayerManager {
  constructor(scene){
    this.scene = scene;
    this.activePlayer = null;
    this.inactivePlayer = null;
    this.canSwap = true;
    this.swapDistance = 100;
    this.playerLine = this.scene.add.line(0, 0, 0, 0, 0, 0, 0x402751).setDepth(4);
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
    this.inactivePlayer.anims.play(`${this.inactivePlayer.currentColor}PlayerDie`);
    this.activePlayer.currentColor = "purple";
    this.inactivePlayer.on('animationcomplete', (animation, frame)=>{
      if(animation.key == `${this.inactivePlayer.currentColor}PlayerDie`){
        this.canSwap = true;
        this.inactivePlayer.customDestroy()
        Phaser.Actions.Call(this.scene.buttonGroup.getChildren(), (button)=> button.validPlayer=null);
      }
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

  changeActivePlayer(){
    if(!this.canSwap) return;
    Phaser.Actions.Call(this.scene.playerGroup.getChildren(), (player)=>{
      player.isActive = !player.isActive
    })
  }

  refreshPlayers(){
    Phaser.Actions.Call(this.scene.playerGroup.getChildren(), (player)=>{
      if(player.isActive) this.activePlayer = player;
      if(!player.isActive) this.inactivePlayer = player;
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
}