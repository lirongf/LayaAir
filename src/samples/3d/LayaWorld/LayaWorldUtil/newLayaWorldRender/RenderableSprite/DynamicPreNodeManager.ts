import { Camera } from "laya/d3/core/Camera";
import { Vector3 } from "laya/d3/math/Vector3";
import { LayaWorldDynamicNodeConfig } from "../LayaWorldDynamicNodeConfig";
import { DynamicPreNode } from "./DynamicPreNode";

/**
 * 用来管理动态节点，多级动态节点
 */
export class DynamicPreNodeManager{
    /** 动态预处理节点管理 */
    static dynamicPreNodeMap:Array<DynamicPreNode> = new Array();
    /** 预处理裁剪 */
    static preCullMap:Array<Array<number>> = [];
    //TODO:必须是最开始的位置所在的那个LayaWorld的盒子原点
    primitiveLayaWorldPos:Vector3 = new Vector3();
    /** 动态预处理节点长度 */
    dynaicPreNodeLength:number = 0;
    /** 动态节点记录 */
    nodeMap = {};
    
    
    //目前所在的LayaWorld的位置格子
    LayaworldPos:Vector3;
    
    constructor(LayaWorldPos:Vector3){
        this.LayaworldPos = LayaWorldPos;
    }

    addNode(CoordPos:Vector3,node:DynamicPreNode){
        this.nodeMap[CoordPos.x.toString()+","+CoordPos.y+","+CoordPos.z.toString()] = node;
        DynamicPreNodeManager.dynamicPreNodeMap[this.dynaicPreNodeLength] = node;
        node.id = this.dynaicPreNodeLength;
        this.dynaicPreNodeLength++;
    }

    /**
     * 移动LayaWorldPos所在位置
     */
    updateLayaWorldPos(camera:Camera){
        //先进行2D的计算
        let pos = camera.transform.position;
        let size = LayaWorldDynamicNodeConfig.architectSize;
        this.LayaworldPos.x = Math.round( pos.x/size)*size +this.primitiveLayaWorldPos.x;
        this.LayaworldPos.z = Math.round(pos.z/size)*size+this.primitiveLayaWorldPos.z;
    }


    /**
     * 根据Camera方向取得需要渲染的数据
     * @param rotateHorizontal 
     * @returns 
     */
    caculateRotateMap(rotateHorizontal:number){
        //保持在0-360
        let cullStep = LayaWorldDynamicNodeConfig.cullStep
        if(rotateHorizontal>=360) rotateHorizontal-=360;
        if(rotateHorizontal<0) rotateHorizontal+=360;
        let yushu= rotateHorizontal%cullStep;
        rotateHorizontal=rotateHorizontal-yushu+Math.round(yushu/cullStep)*cullStep;
        if(rotateHorizontal==360)
            return 0;
        return rotateHorizontal;
    }
}