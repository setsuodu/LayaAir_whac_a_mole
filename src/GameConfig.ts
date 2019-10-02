/**This class is automatically generated by LayaAirIDE, please do not make any modifications. */
import game_mgr from "./game/game_mgr"
import hammer from "./game/hammer"
import mouse from "./game/mouse"
import score from "./game/score"
/*
* 游戏初始化配置;
*/
export default class GameConfig{
    static width:number=960;
    static height:number=640;
    static scaleMode:string="fixedwidth";
    static screenMode:string="none";
    static alignV:string="top";
    static alignH:string="left";
    static startScene:any="game_scene.scene";
    static sceneRoot:string="";
    static debug:boolean=false;
    static stat:boolean=false;
    static physicsDebug:boolean=false;
    static exportSceneToJson:boolean=true;
    constructor(){}
    static init(){
        var reg: Function = Laya.ClassUtils.regClass;
        reg("game/game_mgr.ts",game_mgr);
        reg("game/hammer.ts",hammer);
        reg("game/mouse.ts",mouse);
        reg("game/score.ts",score);
    }
}
GameConfig.init();