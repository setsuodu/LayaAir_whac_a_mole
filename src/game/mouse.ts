import game_mgr from "./game_mgr";

export default class mouse extends Laya.Script {

    /** @prop {name:mouseType, tips:"老鼠类型", type:number, default:1}1好鼠，2海盗鼠*/
    public mouseType: number = 1;
    
    /** @prop {name:mImage, tips:"该脚本挂载的组件", type:Laya.Image}*/
    private mImage: Laya.Image;

    private timeLine: Laya.TimeLine = null;

    /** @prop {name:isDead, tips:"是否已经死了", type:boolean, default:false}*/
    private isDead: boolean = false;

    private mgr: game_mgr = null;
    private holeIndex: number = 1;

    constructor() {
        super();
        this.mouseType = 1; //构造函数中，设置默认值（先跑构造函数，再跑Inspector中设置的值）
    }

    onEnable(): void {
        this.mImage = this.owner as Laya.Image;
    }

    // 钻出地面
    showMouse(mgr: game_mgr, type: number, holeIndex: number): void {
        this.mgr = mgr;
        this.mouseType = type;
        this.holeIndex = holeIndex;

        var imgName = "res/mouse_normal_" + this.mouseType + ".png";
        this.mImage.skin = imgName;

        // 老鼠怎么出来的？
        this.mImage.scaleX = 0;
        this.mImage.scaleY = 0;

        // TimeLine --->
        var timeLine1 = Laya.TimeLine.to(this.mImage, {scaleX: 1, scaleY: 1}, 300);
        timeLine1.to(this.mImage, {scaleX: 0, scaleY: 0}, 300, null, 1000);
        timeLine1.play(0, false);
        timeLine1.on(Laya.Event.COMPLETE, this, function() {
            this.mImage.removeSelf(); //动画播完都没打到
        }); //监听播放结束

        this.timeLine = timeLine1;
    }

    // 死亡动画
    playHitAnim(): void {
        // 停止动画
        if(this.timeLine != null) {
            // this.timeLine.destroy();
            // this.timeLine.gotoTime(1);
            this.timeLine = null;
        }
        // 打中更换图片
        var imgName = "res/mouse_hit_" + this.mouseType + ".png";
        this.mImage.skin = imgName;
        // 缩放
        this.timeLine = Laya.TimeLine.to(this.mImage, {scaleX: 0, scaleY: 0}, 300);
        this.timeLine.on(Laya.Event.COMPLETE, this, function() {
            this.mImage.removeSelf();
        });
    }

    onClick(): void {
        if(this.isDead) {
            return;
        }

        this.isDead = true;
        this.playHitAnim();
        
        // 统计分数
        this.mgr.onMouseHit(this.mouseType, this.holeIndex);
        //game_mgr.GetInstance().onMouseHit(this.mouseType, this.holeIndex);
    }
}