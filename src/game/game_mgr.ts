import mouse from "./mouse";
import score from "./score";
import game_config from "./game_config";

enum GameStatus {
    Free = 0,
    Game = 1,
    Settle = 2
}

export default class game_mgr extends Laya.Script {
    // private static instance: game_mgr;
    // public static GetInstance(): game_mgr
    // {
    //     if(this.instance == null)
    //         this.instance = new game_mgr();
    //     return this.instance;
    // }

    public CurrentStatus: GameStatus = GameStatus.Free;

    /** @prop {name:panelWelcome, tips:"欢迎页", type:Node, default:null}*/
    public panelWelcome: Laya.Node;
    public spWelcome: Laya.Sprite;
    
    /** @prop {name:panelGame, tips:"游戏页", type:Node, default:null}*/
    public panelGame: Laya.Node;
    public spGame: Laya.Sprite;
    
    /** @prop {name:panelSettle, tips:"结算页", type:Node, default:null}*/
    public panelSettle: Laya.Node;
    public spSettle: Laya.Sprite;
    
    /** @prop {name:mouseRoot, tips:"老鼠根节点", type:Node, default:null}*/
    public mouseRoot: Laya.Node;
    
    /** @prop {name:mousePrefab, tips:"老鼠预制体", type:Prefab, default:null}*/
    public mousePrefab: Laya.Prefab;

    /** @prop {name:scoreRoot, tips:"得分根节点", type:Node, default:null}*/
    public scoreRoot: Laya.Node;
    
    /** @prop {name:scorePrefab, tips:"得分预制体", type:Prefab, default:null}*/
    public scorePrefab: Laya.Prefab;

    // 游戏ui
    private progressTime: Laya.ProgressBar;
    private currentScore: number = 0;
    public scoreClip: Laya.FontClip;

    // 结算ui
    private btnStart: Laya.Button;
    private btnRestart: Laya.Button;
    public settleScore: Laya.FontClip;

    constructor() {
        super();
        this.CurrentStatus = GameStatus.Free;
        this.panelWelcome = null;
        this.panelGame = null;
        this.panelSettle = null;
        this.mouseRoot = null;
        this.mousePrefab = null;
        this.scoreRoot = null;
        this.scorePrefab = null;
        this.progressTime = null;
    }
    
    onStart(): void {
        this.CurrentStatus = GameStatus.Free;
        Laya.SoundManager.playMusic("res/sounds/bgm.mp3", 0);

        this.spWelcome = this.panelWelcome as Laya.Sprite;
        this.spWelcome.visible = true;

        this.spGame = this.panelGame as Laya.Sprite;
        this.spGame.visible = false;

        this.spSettle = this.panelSettle as Laya.Sprite;
        this.spSettle.visible = false;
        
        this.progressTime = this.spGame.getChildByName("bg").getChildByName("TimeProgress") as Laya.ProgressBar;
        this.scoreClip = this.progressTime.getChildByName("GameScore") as Laya.FontClip;

        this.btnStart = this.spWelcome.getChildByName("StartGame") as Laya.Button;
        this.btnStart.on(Laya.Event.CLICK, this, this.onStartGame);

        this.btnRestart = this.spSettle.getChildByName("background").getChildByName("RestartGame") as Laya.Button;
        this.btnRestart.on(Laya.Event.CLICK, this, this.onRestartGame);
        this.settleScore = this.spSettle.getChildByName("background").getChildByName("SettleScore") as Laya.FontClip;
    }

    //#region 流程控制

    onStartGame(): void {
        this.CurrentStatus = GameStatus.Game;
        console.log("开始游戏!");

        this.spWelcome.visible = false;
        this.spGame.visible = true;
        this.spSettle.visible = false;

        this.currentScore = 0;
        this.progressTime.value = 1;
        this.scoreClip.value = "0";
        this.settleScore.value = "0";
        this.onTimerRun();
        this.spawnMouse();
    }

    onSettleGame(): void {
        this.CurrentStatus = GameStatus.Settle;

        this.spWelcome.visible = false;
        this.spGame.visible = true; //不隐藏，但是停止逻辑
        this.spSettle.visible = true;
    }

    onRestartGame(): void {
        this.CurrentStatus = GameStatus.Free;
        console.log("重新开始!");

        this.spWelcome.visible = true;
        this.spGame.visible = false;
        this.spSettle.visible = false;
    }

    //#endregion

    // 创建老鼠
    spawnMouse(): void {
        if(this.CurrentStatus != GameStatus.Game) {
            console.error("游戏未开始：", this.CurrentStatus);
            return;
        }

        var m = this.mousePrefab.create(); //克隆预制体
        this.mouseRoot.addChild(m); //移动克隆体到根物体下

        // 随机索引
        var holeIndex = Math.random() * 9; //0-8随机
        holeIndex = Math.floor(holeIndex);
        m.x = game_config.config.mouse_pos[holeIndex].x;
        m.y = game_config.config.mouse_pos[holeIndex].y;

        var mouseType = (Math.random() < 0.5) ? 1 : 2; //ts语法糖
        var script = m.getComponent(mouse);
        script.showMouse(this, mouseType, holeIndex);

        // 定时器
        var time = (1 + Math.random() * 2) * 1000; //0-1随机 //Laya的时间单位是毫秒
        time = Math.floor(time);
        Laya.timer.once(time, this, this.spawnMouse);
    }

    // 显示得分
    onMouseHit(mouseType: number, holeIndex: number): void {
        if(this.CurrentStatus != GameStatus.Game) return;
        
        // 分数动画
        var m = this.scorePrefab.create(); //克隆预制体
        this.scoreRoot.addChild(m); //移动克隆体到根物体下
        
        m.x = game_config.config.score_pos[holeIndex].x;
        m.y = game_config.config.score_pos[holeIndex].y;

        var script = m.getComponent(score);
        script.showScore(mouseType, holeIndex);

        var addScore = mouseType == 1? -100 : 100;
        this.currentScore += addScore;
        this.currentScore = (this.currentScore > 0)? this.currentScore: 0;
        this.scoreClip.value = this.currentScore.toString();
        this.settleScore.value = this.currentScore.toString();
    }

    // 倒计时
    onTimerRun(): void {
        if(this.progressTime.value <= 0) {
            // alert("游戏结束!");
            this.onSettleGame();
            return;
        }
        this.progressTime.value -= 0.01;
        // 定时器
        Laya.timer.once(100, this, this.onTimerRun);
    }
}