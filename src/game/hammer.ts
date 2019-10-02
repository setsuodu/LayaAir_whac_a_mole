export default class hammer extends Laya.Script {
    
    private mImage: Laya.Image;

    constructor() {
        super();
    }
    
    onAwake(): void {
        this.mImage = this.owner as Laya.Image;
        this.mImage.visible = false;
    }

    onStart(): void {
        this.mImage.visible = true;
        // Laya.Mouse.hide();//报错
        Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
        Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
    }

    // 敲打动画
    onMouseDown(): void {
        var timeLine = Laya.TimeLine.to(this.mImage, {rotation: 15}, 50); //敲下
        timeLine.to(this.mImage, {rotation: -15}, 100); //反弹
        timeLine.to(this.mImage, {rotation: 0}, 50, Laya.Ease.sineOut, 100); //最终位置
        timeLine.play(0, false);
    }

    // 鼠标随动
    onMouseMove(): void {
        var posX = Laya.stage.mouseX - Laya.stage.width / 2 + this.mImage.width / 2;
        var posY = Laya.stage.mouseY - Laya.stage.height / 2 + this.mImage.height / 2;
        // this.mImage.x = posX;
        // this.mImage.y = posY;
        this.mImage.pos(posX, posY);
    }
}