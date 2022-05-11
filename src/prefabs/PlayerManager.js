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
      ease: "Sine.easeIn",
      duration: duration,
    })
    this.tween.on('complete', ()=>{
      this.canSwap = true;
      this.inactivePlayer.customDestroy()
      this.activePlayer.currentColor = "purple";
    })
  }

  throwRedCharacter(){
    this.refreshPlayers();

    // add red player
    let redPlayer = new Player(this.scene, this.activePlayer.x, this.activePlayer.y, 'player', 0);
    redPlayer.isActive = false;
    redPlayer.currentColor = 'red';
    this.scene.playerGroup.add(redPlayer);

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
    })
  }

  getInput(){
    // Should be 8 directions, plus no input = 9 possibilities
    if(cursors.left.isDown && cursors.up.isDown) { return "upLeft" } 
    else if(cursors.left.isDown && cursors.down.isDown) { return "downLeft" } 
    else if(cursors.right.isDown && cursors.up.isDown) { return "upRight" } 
    else if(cursors.right.isDown && cursors.down.isDown) { return "downRight" } 
    else if(cursors.up.isDown) { return "up" } 
    else if(cursors.down.isDown) { return "down" } 
    else if(cursors.left.isDown) { return "left"} 
    else if(cursors.right.isDown) { return "right";} 
    else { return "none"; }
  }
}