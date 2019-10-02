export default class score extends Laya.Script {
    
    public mImage: Laya.Image;

    constructor() { super(); }
    
    onEnable(): void {
        this.mImage = this.owner as (Laya.Image);
    }

    onDisable(): void {
    }

    // 显示分数
    showScore(type: number, holeIndex: number): void {
        // console.log("格子", holeIndex, ", ", type == 1? "好老鼠":"坏老鼠");
        this.mImage.skin = "res/score_" + type + ".png";
        
        var timeline = Laya.TimeLine.to(this.mImage, {y: this.mImage.y - 40}, 400, Laya.Ease.cubicOut);
        timeline.to(this.mImage, {alpha: 0}, 100, null, 200);
        timeline.play(0, false);
        timeline.on(Laya.Event.COMPLETE, this, function() {
            this.mImage.removeSelf(); //动画播完都没打到
        }); //监听播放结束
    }
}