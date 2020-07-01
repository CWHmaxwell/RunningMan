// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

const jumpIntervalTime = 0.075;
const v0 = 1;
//通过 creatorBlockTime/Vt 来获取当前是否需要创建block
const creatBlockTime = [1.25,1,0.75];
const freshI = 0.01;
@ccclass
export default class GameView extends cc.Component {

    @property(cc.Node)
    playerRoot: cc.Node = null;

    @property([cc.Node])
    position: cc.Node[] = [];



    @property([cc.Node])
    startPosition:cc.Node[] = [];

    @property([cc.Node])
    endPosition:cc.Node[] = [];

    @property([cc.Sprite])
    blockTmp:cc.Sprite[] = [];

    @property(cc.Node)
    blocksRoot:cc.Node = null;

    @property(cc.Label)
    gover:cc.Label = null;

    @property(cc.Animation)
    gameStart:cc.Animation = null;
    //动画没有结束不接受按键事件;
    animFinish:boolean = true;
    //当前速度;
    speed = v0;
    //目前界面中存在的障碍物
    blocks= [];
    //最后面空石块的位置0,1,2分别为左中右;
    direction = 1;
    //
    //roots = [];
    interval = 0;
    nowBlock = 0;
    creatInterval =0;
    onLoad() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        this.schedule(()=>{this.blockStart(freshI)},freshI);
        // this.schedule(()=>{
        //     this.creatBlocks();
        // },creatBlockTime[1]);
        
    }

    start() {
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;
        manager.enabledDebugDraw = true;
        manager.enabledDrawBoundingBox = true;
        this.gameStart.play('gameStart');
    }

    update(dt){
        this.interval +=dt;
        this.creatInterval +=dt;
        if(this.interval -5 >0){
            this.interval = 0;
            if(this.speed <20){this.speed +=1;}
        }
        //这里控制障碍物生成的快慢
        if(this.creatInterval - 6/this.speed > 0){
            console.log(this.creatInterval);
            this.creatInterval -= 6/this.speed;
            this.creatBlocks();
        }
        //怎么定义时间间隔来实现速度不同创建障碍物的速度不同;
        // this.interval +=dt;
        // if(this.speed <15){
        //     if(this.interval > 5){
        //         this.speed +=1;
        //         this.interval = 0;
        //         this.schedule(()=>{this.creatBlocks(15/this.speed)},15/this.speed,Math.floor(this.speed/3));
        //     }
        // } 
    }

    onDestroy() {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        this.unscheduleAllCallbacks();
    }

    onKeyDown(event) {
        console.log("keyDown:", event.keyCode);
        if (this.playerRoot.x <= this.position[0].x + 0.5) {
            console.log('left');
            if (event.keyCode == 39) {
                //this.playerRoot.x = this.position[1].x;
                this.jumpRightAnim(this.playerRoot);
            }
        }  else if(this.playerRoot.x >= this.position[2].x-0.5){
            console.log('right');
            if (event.keyCode == 37) {
                //this.playerRoot.x = this.position[1].x;
                this.jumpLeftAnim(this.playerRoot);
            }
        }else {
            console.log('mid');
            if (event.keyCode == 37) {
                //this.playerRoot.x = this.position[0].x;
                this.jumpLeftAnim(this.playerRoot);
            } else if (event.keyCode == 39) {
                this.jumpRightAnim(this.playerRoot);
                //this.playerRoot.x = this.position[2].x;
            }
        }
    }

    jumpLeftAnim(Node:cc.Node){
        if(this.animFinish){
            this.animFinish = false;
            let action1 = cc.moveTo(jumpIntervalTime,cc.v2(Node.x-125,Node.y+30));
            let action2 = cc.moveTo(jumpIntervalTime,cc.v2(Node.x-125-125,Node.y));
            let callFun = cc.callFunc(
                ()=>{
                    this.animFinish = true;
                }
            );
            Node.runAction(cc.sequence([action1,action2,callFun]));
        }
        
    }

    jumpRightAnim(Node:cc.Node){
        if(this.animFinish){
            this.animFinish = false;
            let action1 = cc.moveTo(jumpIntervalTime,cc.v2(Node.x+125,Node.y+30));
            let action2 = cc.moveTo(jumpIntervalTime,cc.v2(Node.x+125+125,Node.y));
            let callFun = cc.callFunc(
                ()=>{
                    this.animFinish = true;
                }
            );
            Node.runAction(cc.sequence([action1,action2,callFun]));
        }
    }

    blockStart(dt){
        //let actioin1 = cc.scaleBy()
        // if(this.speed < 3 ){
        //     this.intervation +=dt;
        //     if(this.intervation >= 5){
        //         this.speed +=1;
        //         this.intervation = 0;
        //         this.unscheduleAllCallbacks();
        //         if(this.speed == 2){
        //             this.schedule(()=>{
        //                 this.creatBlocks(creatBlockTime[1])
        //             },creatBlockTime[1]);
        //         }else {
                    
        //             this.schedule(()=>{
        //                 this.creatBlocks(creatBlockTime[2]);
        //             },creatBlockTime[2]);
        //         }
        //         this.schedule(()=>{this.blockStart(freshI)},freshI);
        //     }
        // }
        let dele = 0;
        this.blocks.forEach(list=>{
            if(list[0].node.y < -500){
                dele +=1;
            }
            list.forEach((element,idx)=>{
                //这里调节障碍物移动的快慢
                element.node.y = element.node.y - 100*dt*(this.speed/5);    
                //加个弥补速度;s
                element.node.y = element.node.y - 500*dt*Math.abs(element.node.y/this.endPosition[idx].y);//*(this.speed);
                element.node.x = this.startPosition[idx].x + (this.endPosition[idx].x - this.startPosition[idx].x)* Math.abs(element.node.y)/(this.startPosition[idx].y - this.endPosition[idx].y);
            if (element.node.y - this.endPosition[idx].y >0){
                element.node.scale = 0.8 * Math.max(0,Math.abs(element.node.y)/(this.startPosition[idx].y - this.endPosition[idx].y));
            }
            else {
                element.node.scale = 0.8;
            }
            });
        });
        if(dele != 0){
            let block = this.blocks.splice(0,dele);
            block.forEach(Element=>{
                Element[0].node.getParent().removeFromParent();
                Element[0].node.getParent().destroy();
                //console.log(Element);
            });
            //block[0].node.parent.removeFromParent();
            // block[0].node.getParent().removeFromParent();
            // block[0].node.getParent().destroy();
            //console.log(this.blocks);
        }
        
    }

    creatBlocks(){
        let root =  cc.instantiate(this.blockTmp[0].node.getParent());
        //this.roots.push(root);
        let block = root.getComponentsInChildren(cc.Sprite);
        
        if(this.direction <0.5){
            this.direction = 1;
            block[1].node.active = false;
        }else if(this.direction >=1.5){
            this.direction = 1;
            block[1].node.active = false;
        }else {
            let way = Math.random()*2;
            if(way <1){
                block[0].node.active = false;
                this.direction = 0;
            }else {
                block[2].node.active = false;
                this.direction = 2;
            }
            // this.direction += way-1.5;
            // block[2].node.active = false;
        }
        this.blocks.push(block);//root.getComponentsInChildren(cc.Sprite));
        this.blocksRoot.addChild(root);
    }

    public initSpeed(){
        this.gover.node.active = false;
        this.speed = v0;
        this.blocks.forEach(Element=>{
            Element[0].node.getParent().removeFromParent();
            Element[0].node.getParent().destroy();
        })
        this.blocks.splice(0,this.blocks.length);
        console.log(this.blocks.length);
        this.gameStart.play('gameStart');
    }
    // update (dt) {}
}
