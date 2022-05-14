class PlayerManager {
  constructor(scene){
    this.scene = scene;
    this.activePlayer = null;
    this.inactivePlayer = null;
    this.canSwap = true;
    this.swapDistance = 100;

    // How do you change the color of the line????? Hexcode doesn't work
    this.playerLine = this.scene.add.line(0, 0, 0, 0, 0, 0, "#468232");
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
    let duration = 300;
    
    this.playerLine.alpha = 0;
    this.tween = this.scene.tweens.add({
      targets: this.inactivePlayer,
      x: this.activePlayer.x,
      y: this.activePlayer.y,
      alpha: 0,
      ease: "Sine.easeInOut",
      duration: duration,
    })
    this.tween.on('complete', ()=>{
      this.canSwap = true;
      this.inactivePlayer.customDestroy()
      this.activePlayer.currentColor = "purple";
    })
  }

  teleport(target, x, y){
    this.canSwap = false;
    let duration = 300;
    this.tween = this.scene.tweens.add({
      targets: target,
      x: x,
      y: y,
      ease: "Sine.easeInOut",
      duration: duration,
    })
    this.tween.on('complete', ()=>{
      this.canSwap = true;
    })
  }

  throwRedCharacter(){
    this.refreshPlayers();
    if(!this.canSwap) return;

    this.scene.sound.play('split');
    // add red player
    let redPlayer = new Player(this.scene, this.activePlayer.x, this.activePlayer.y, 'player', 0);
    redPlayer.state = "THROWN";
    redPlayer.isActive = false;
    redPlayer.currentColor = 'red';
    this.scene.playerGroup.add(redPlayer);
    this.addVelocity(redPlayer);
    // change active character from purple to blue
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

  addVelocity(player){
    this.angleSave = Phaser.Math.Angle.Between(player.x, player.y, game.input.mousePointer.worldX,game.input.mousePointer.worldY);

    //North East
    if(this.angleSave < 0 && this.angleSave > -1.57079632679) {
      player.body.setVelocityX(Math.abs(Math.cos(this.angleSave)) * 500);
      player.body.setVelocityY(-Math.abs(Math.sin(this.angleSave)) * 500);
    }
    //North West
    if(this.angleSave > -3.14159265359 && this.angleSave < -1.57079632679) {
      player.body.setVelocityX(-Math.abs(Math.cos(this.angleSave)) * 500);
      player.body.setVelocityY(-Math.abs(Math.sin(this.angleSave)) * 500);
    }
    //South West
    if(this.angleSave < 3.14159265359 && this.angleSave > 1.57079632679) {
      player.body.setVelocityX(-Math.abs(Math.cos(this.angleSave)) * 500);
      player.body.setVelocityY(Math.abs(Math.sin(this.angleSave)) * 500);
    }
    //South East
    if(this.angleSave > 0 && this.angleSave < 1.57079632679) {
      player.body.setVelocityX(Math.abs(Math.cos(this.angleSave)) * 500);
      player.body.setVelocityY(Math.abs(Math.sin(this.angleSave)) * 500);
    }
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