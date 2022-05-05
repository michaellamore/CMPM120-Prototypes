class Text extends Phaser.GameObjects.Text {
  constructor(scene, x, y, text, style) {
    super(scene, x, y, text, style);
    scene.add.existing(this);
    this.setOrigin(0.5);
    this.setDepth(11);
  }
}

class Button extends Phaser.GameObjects.Sprite{
  constructor(scene, x, y, texture, frame, string="", paramFunc){
    super(scene, x, y, texture, frame);
    scene.add.existing(this);
    this.setOrigin(0);
    this.setDepth(10);
    this.setInteractive();
    this.setTint(0x7d7d7d);
    this.text = new Text(scene, x, y, string);

    this.on("pointerover", () => {
      this.setTint(0xffffff);
    })
    this.on("pointerout", () => {
      this.setTint(0x7d7d7d);
    })
    this.on("pointerup", () => {
      this.anims.play('pressedPlay')
      if(paramFunc && (typeof paramFunc == "function")) paramFunc();
    })
  }
}

class MenuManager {
  constructor(scene){
    this.scene = scene;
  }
  createButtons(buttonNames=[]){
    let output = [];
    for(const button of buttonNames){
      output.push(new Button(this.scene, 0, 0, 'button', 0, button, ()=>{console.log(`${button} was pressed`)}))
    }
    this.placeButtons(output);
  }

  placeButtons(buttons=[]){
    let textOffset = 10;
    let padding = 48;
    let availableY = height-(padding*2);
    let buttonWidth = buttons[0].width;
    let buttonHeight = buttons[0].height;
    let numOfButtons = buttons.length;
    let spaceBetween = (availableY-(buttonHeight*numOfButtons))/((numOfButtons*2)-1);
    for(let i=0; i<numOfButtons; i++){
      let newX = padding;
      let newY = padding + (spaceBetween*(i+1)) + (buttonHeight*(i));
      buttons[i].x = newX;
      buttons[i].y = newY;
      buttons[i].text.x = newX + (buttonWidth/2);
      buttons[i].text.y = newY + (buttonHeight/2)-(buttons[i].text.height/2)-textOffset;
    }
  }

  tweenDownOnClick(duration=500, paramFunc){
    for(let button of this.btnGroup.getChildren()){
      button.on("pointerup", () => {
        let tween = this.scene.tweens.add({
          targets: button,
          y: '+=400',
          ease: "Sine.easeInOut",
          duration: duration,
          repeat: 0,
          yoyo: false
        })
        tween.on('complete', () => {
          if(paramFunc && (typeof paramFunc == "function")) paramFunc(); 
        });
      })
    }
  }
}