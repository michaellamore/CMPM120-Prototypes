class ResetPanel extends Obstacle{
  constructor(scene, x, y, texture, frame){
    super(scene, x, y, texture, frame);
    this.scene = scene;
    this.body.setSize(8, 24, false);
    this.body.debugBodyColor = 0xa53030;
  }
}