class Button extends ImmovableBody{
  constructor(scene, x, y, texture, frame, color="", id=0, level=0){
    super(scene, x, y, texture, frame);
    this.body.setSize(32, 28, false);
    this.x -= 8;
    this.y -= 24;
    this.color = color;
    this.id = id;
    this.level = level;
    this.validPlayer = null;

    let randInt = Phaser.Math.Between(0, 4);
    this.setFrame(`${this.color}${randInt}`);

    this.lightOffset = new Phaser.Math.Vector2(16, 16);
  }

  update(){
    this.body.debugBodyColor = 0xa53030;
    if(this.validPlayer == null) return;
    let touching = !this.validPlayer.body.touching.none;
    let wasTouching = !this.validPlayer.body.wasTouching.none;
    if (!touching && wasTouching){ // Exit button range
      this.validPlayer = null;
    }
  }

  isOverlapping(player){
    this.validPlayer = player;
    this.body.debugBodyColor = 0x468232;
  }
}