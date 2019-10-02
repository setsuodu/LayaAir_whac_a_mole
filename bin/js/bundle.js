(function () {
    'use strict';

    class mouse extends Laya.Script {
        constructor() {
            super();
            this.mouseType = 1;
            this.timeLine = null;
            this.isDead = false;
            this.mgr = null;
            this.holeIndex = 1;
            this.mouseType = 1;
        }
        onEnable() {
            this.mImage = this.owner;
        }
        showMouse(mgr, type, holeIndex) {
            this.mgr = mgr;
            this.mouseType = type;
            this.holeIndex = holeIndex;
            var imgName = "res/mouse_normal_" + this.mouseType + ".png";
            this.mImage.skin = imgName;
            this.mImage.scaleX = 0;
            this.mImage.scaleY = 0;
            var timeLine1 = Laya.TimeLine.to(this.mImage, { scaleX: 1, scaleY: 1 }, 300);
            timeLine1.to(this.mImage, { scaleX: 0, scaleY: 0 }, 300, null, 1000);
            timeLine1.play(0, false);
            timeLine1.on(Laya.Event.COMPLETE, this, function () {
                this.mImage.removeSelf();
            });
            this.timeLine = timeLine1;
        }
        playHitAnim() {
            if (this.timeLine != null) {
                this.timeLine = null;
            }
            var imgName = "res/mouse_hit_" + this.mouseType + ".png";
            this.mImage.skin = imgName;
            this.timeLine = Laya.TimeLine.to(this.mImage, { scaleX: 0, scaleY: 0 }, 300);
            this.timeLine.on(Laya.Event.COMPLETE, this, function () {
                this.mImage.removeSelf();
            });
        }
        onClick() {
            if (this.isDead) {
                return;
            }
            this.isDead = true;
            this.playHitAnim();
            this.mgr.onMouseHit(this.mouseType, this.holeIndex);
        }
    }

    class score extends Laya.Script {
        constructor() { super(); }
        onEnable() {
            this.mImage = this.owner;
        }
        onDisable() {
        }
        showScore(type, holeIndex) {
            this.mImage.skin = "res/score_" + type + ".png";
            var timeline = Laya.TimeLine.to(this.mImage, { y: this.mImage.y - 40 }, 400, Laya.Ease.cubicOut);
            timeline.to(this.mImage, { alpha: 0 }, 100, null, 200);
            timeline.play(0, false);
            timeline.on(Laya.Event.COMPLETE, this, function () {
                this.mImage.removeSelf();
            });
        }
    }

    class game_config {
    }
    game_config.config = {
        mouse_pos: [
            { x: -182, y: 0 }, { x: 5, y: 0 }, { x: 202, y: 0 },
            { x: -182, y: 90 }, { x: 5, y: 90 }, { x: 202, y: 90 },
            { x: -182, y: 190 }, { x: 5, y: 190 }, { x: 202, y: 190 }
        ],
        hammer_pos: [
            { x: -182, y: 7 }, { x: -182, y: 7 }, { x: -182, y: 7 },
            { x: -182, y: 7 }, { x: -182, y: 7 }, { x: -182, y: 7 },
            { x: -182, y: 7 }, { x: -182, y: 7 }, { x: -182, y: 7 }
        ],
        score_pos: [
            { x: -222, y: -80 }, { x: -35, y: -80 }, { x: 162, y: -80 },
            { x: -222, y: 10 }, { x: -35, y: 10 }, { x: 162, y: 10 },
            { x: -222, y: 110 }, { x: -35, y: 110 }, { x: 162, y: 110 }
        ]
    };

    var GameStatus;
    (function (GameStatus) {
        GameStatus[GameStatus["Free"] = 0] = "Free";
        GameStatus[GameStatus["Game"] = 1] = "Game";
        GameStatus[GameStatus["Settle"] = 2] = "Settle";
    })(GameStatus || (GameStatus = {}));
    class game_mgr extends Laya.Script {
        constructor() {
            super();
            this.CurrentStatus = GameStatus.Free;
            this.currentScore = 0;
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
        onStart() {
            this.CurrentStatus = GameStatus.Free;
            Laya.SoundManager.playMusic("res/sounds/bgm.mp3", 0);
            this.spWelcome = this.panelWelcome;
            this.spWelcome.visible = true;
            this.spGame = this.panelGame;
            this.spGame.visible = false;
            this.spSettle = this.panelSettle;
            this.spSettle.visible = false;
            this.progressTime = this.spGame.getChildByName("bg").getChildByName("TimeProgress");
            this.scoreClip = this.progressTime.getChildByName("GameScore");
            this.btnStart = this.spWelcome.getChildByName("StartGame");
            this.btnStart.on(Laya.Event.CLICK, this, this.onStartGame);
            this.btnRestart = this.spSettle.getChildByName("background").getChildByName("RestartGame");
            this.btnRestart.on(Laya.Event.CLICK, this, this.onRestartGame);
            this.settleScore = this.spSettle.getChildByName("background").getChildByName("SettleScore");
        }
        onStartGame() {
            this.CurrentStatus = GameStatus.Game;
            console.log("开始游戏!");
            this.spWelcome.visible = false;
            this.spGame.visible = true;
            this.spSettle.visible = false;
            this.currentScore = 0;
            this.progressTime.value = 1;
            this.scoreClip.value = this.currentScore.toString();
            this.settleScore.value = this.currentScore.toString();
            this.onTimerRun();
            this.spawnMouse();
        }
        onSettleGame() {
            this.CurrentStatus = GameStatus.Settle;
            this.spWelcome.visible = false;
            this.spGame.visible = true;
            this.spSettle.visible = true;
        }
        onRestartGame() {
            this.CurrentStatus = GameStatus.Free;
            console.log("重新开始!");
            this.spWelcome.visible = true;
            this.spGame.visible = false;
            this.spSettle.visible = false;
        }
        spawnMouse() {
            if (this.CurrentStatus != GameStatus.Game) {
                console.error("游戏未开始：", this.CurrentStatus);
                return;
            }
            var m = this.mousePrefab.create();
            this.mouseRoot.addChild(m);
            var holeIndex = Math.random() * 9;
            holeIndex = Math.floor(holeIndex);
            m.x = game_config.config.mouse_pos[holeIndex].x;
            m.y = game_config.config.mouse_pos[holeIndex].y;
            var mouseType = (Math.random() < 0.5) ? 1 : 2;
            var script = m.getComponent(mouse);
            script.showMouse(this, mouseType, holeIndex);
            var time = (1 + Math.random() * 2) * 1000;
            time = Math.floor(time);
            Laya.timer.once(time, this, this.spawnMouse);
        }
        onMouseHit(mouseType, holeIndex) {
            if (this.CurrentStatus != GameStatus.Game)
                return;
            var m = this.scorePrefab.create();
            this.scoreRoot.addChild(m);
            m.x = game_config.config.score_pos[holeIndex].x;
            m.y = game_config.config.score_pos[holeIndex].y;
            var script = m.getComponent(score);
            script.showScore(mouseType, holeIndex);
            var addScore = mouseType == 1 ? -100 : 100;
            this.currentScore += addScore;
            this.currentScore = (this.currentScore > 0) ? this.currentScore : 0;
            this.scoreClip.value = this.currentScore.toString();
            this.settleScore.value = this.currentScore.toString();
        }
        onTimerRun() {
            if (this.progressTime.value <= 0) {
                this.onSettleGame();
                return;
            }
            this.progressTime.value -= 0.01;
            Laya.timer.once(100, this, this.onTimerRun);
        }
    }

    class hammer extends Laya.Script {
        constructor() {
            super();
        }
        onAwake() {
            this.mImage = this.owner;
            this.mImage.visible = false;
        }
        onStart() {
            this.mImage.visible = true;
            Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
        }
        onMouseDown() {
            var timeLine = Laya.TimeLine.to(this.mImage, { rotation: 15 }, 50);
            timeLine.to(this.mImage, { rotation: -15 }, 100);
            timeLine.to(this.mImage, { rotation: 0 }, 50, Laya.Ease.sineOut, 100);
            timeLine.play(0, false);
        }
        onMouseMove() {
            var posX = Laya.stage.mouseX - Laya.stage.width / 2 + this.mImage.width / 2;
            var posY = Laya.stage.mouseY - Laya.stage.height / 2 + this.mImage.height / 2;
            this.mImage.pos(posX, posY);
        }
    }

    class GameConfig {
        constructor() { }
        static init() {
            var reg = Laya.ClassUtils.regClass;
            reg("game/game_mgr.ts", game_mgr);
            reg("game/hammer.ts", hammer);
            reg("game/mouse.ts", mouse);
            reg("game/score.ts", score);
        }
    }
    GameConfig.width = 960;
    GameConfig.height = 640;
    GameConfig.scaleMode = "fixedwidth";
    GameConfig.screenMode = "none";
    GameConfig.alignV = "top";
    GameConfig.alignH = "left";
    GameConfig.startScene = "game_scene.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = false;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;
    GameConfig.init();

    class Main {
        constructor() {
            if (window["Laya3D"])
                Laya3D.init(GameConfig.width, GameConfig.height);
            else
                Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
            Laya["Physics"] && Laya["Physics"].enable();
            Laya["DebugPanel"] && Laya["DebugPanel"].enable();
            Laya.stage.scaleMode = GameConfig.scaleMode;
            Laya.stage.screenMode = GameConfig.screenMode;
            Laya.stage.alignV = GameConfig.alignV;
            Laya.stage.alignH = GameConfig.alignH;
            Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
            if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true")
                Laya.enableDebugPanel();
            if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"])
                Laya["PhysicsDebugDraw"].enable();
            if (GameConfig.stat)
                Laya.Stat.show();
            Laya.alertGlobalError = true;
            Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
        }
        onVersionLoaded() {
            Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
        }
        onConfigLoaded() {
            GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);
        }
    }
    new Main();

}());
