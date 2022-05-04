class MissingDocuments extends Phaser.Scene{
  constructor(){ 
    super("MissingDocuments") 
  }

  preload(){
    this.load.path = "./assets/";
    this.load.image('paper', 'paper.png');
    this.load.image('paper2', 'paper2.png');
  }

  create(){
    let text = "Someone keeps telling you to find something specific, so you have to look through your desk to find it. Can make these objects keep spawning, or reduce amount, etc. "
    this.add.dom(width/2, 10, 'p', 'padding: 10px; background-color: black; color: white; width: 1280; height: 60px; font: 20px Arial; text-align: center;', text).setOrigin(0.5);

    this.cameras.main.setBackgroundColor('#d18e19');
    this.paperGroup = this.add.group({maxSize: 40});

    // Make the goal document
    const randX = Phaser.Math.Between(padding, width-padding);
    const randY = Phaser.Math.Between(padding, height-padding);
    const randAngle = Phaser.Math.Between(-30, 30);
    let document = new Paper(this, randX, randY, "paper2", 0, randAngle);
    document.on('pointerdown', (pointer) => {
      console.log("You found the right one! Now find the next.")
      Phaser.Actions.Call(this.paperGroup.getChildren(), (paper)=>{ paper.destroy(); });
      this.makeRandomDocuments();
      document.x = Phaser.Math.Between(padding, width-padding);
      document.y = Phaser.Math.Between(padding, height-padding);
    });

    // Make a bunch of scattered documents
    this.makeRandomDocuments();
  }

  makeNewDocument(x, y, sprite, angle){
    if(this.paperGroup.isFull()) return
    let document = new Paper(this, x, y, sprite, 0, angle);
    this.paperGroup.add(document);
  }

  makeRandomDocuments(){
    for(let i=0; i<35; i++){
      const randX = Phaser.Math.Between(padding, width-padding);
      const randY = Phaser.Math.Between(padding, height-padding);
      const randAngle = Phaser.Math.Between(-30, 30);
      this.makeNewDocument(randX, randY, 'paper', randAngle);
    }
  }
}