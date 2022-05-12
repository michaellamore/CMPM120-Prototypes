class PlayerManager {
  constructor(scene){
    this.scene = scene;
    this.activePlayer = null;
    this.inactivePlayer = null;
    this.canSwap = true;
  }

  retrieveInactivePlayer(){
    if(!this.canSwap) return;
    this.canSwap = false;
    let duration = 300;
    this.refreshPlayers();
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

    // add red player
    let redPlayer = new Player(this.scene, this.activePlayer.x, this.activePlayer.y, 'player', 0);
    redPlayer.state = "THROWN";
    redPlayer.isActive = false;
    redPlayer.currentColor = 'red';
    this.scene.playerGroup.add(redPlayer);
    this.addVelocity(redPlayer);
    // change purple to blue
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
}