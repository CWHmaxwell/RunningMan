// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import GameView from "./GameView";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CrashManager extends cc.Component {
    @property(cc.Label)
    overLabel:cc.Label = null;

    restart  = false;
    @property(GameView)
    mainView:GameView = null;
    onCollisionEnter(other:any,self:any) {
        console.log('crash');
        
        //restart为锁;
        
        if(!this.restart){
            this.overLabel.node.active = !this.overLabel.node.active;
            this.restart = true;
            this.scheduleOnce(()=>{
                this.mainView.initSpeed();
                this.restart = false;
            },5);
        }

        
    }
}
