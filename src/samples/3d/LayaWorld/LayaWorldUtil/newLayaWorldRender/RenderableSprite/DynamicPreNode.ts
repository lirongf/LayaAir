import { Bounds } from "laya/d3/core/Bounds";
import { Camera } from "laya/d3/core/Camera";
import { BoundBox } from "laya/d3/math/BoundBox";
import { Vector3 } from "laya/d3/math/Vector3";
import { LayaWorldDynamicNodeConfig } from "../LayaWorldDynamicNodeConfig";

import { DynamicPreNodeManager } from "./DynamicPreNodeManager";
import { StaticMapNode } from "./StaticMapNode";



/**
 * @author miner 
 * 动态渲染节点
 */
export class DynamicPreNode{
    static tempPos:Vector3 = new Vector3();
    //动态节点的包围盒,预处理用
   
    //LOD级数,不需要改动
    private _type:number;
    //动态八叉树的坐标位置 1,2,3,4
    private _posCoord:Vector3;
    //相对位置
    private _localPos:Vector3;
    //LayaWorld世界位置
    _layaWorldpos:Vector3;
    //在队列中的位置
    id:number;
    //管理类
    manager:DynamicPreNodeManager;
    /** 动态节点包围盒 */
    bounds:BoundBox;
    //renderNode
    mapBoundNode:StaticMapNode;
    /** 节点半径，用来确定更新数据的大小 */
    nodeextends:number;

    /**节点中的预计算 */
    _secendDynamicPreNodeMap:Array<DynamicPreNode>;
    secendType:number;

    constructor(posCoord:Vector3,boundBox:BoundBox,nodeExtends:number){
        this._posCoord = posCoord;
        this.nodeextends = nodeExtends;
        let size = LayaWorldDynamicNodeConfig.architectSize;
        this._type = LayaWorldDynamicNodeConfig.caculateNodeType(Math.sqrt(Math.pow(posCoord.x*size,2)+Math.pow(posCoord.y*size,2)+Math.pow(posCoord.z*size,2)));
    
        this.bounds = boundBox;
        this._localPos = new Vector3()
        this._layaWorldpos = new Vector3();
        Vector3.scale(this._posCoord,size,this._localPos);
        if(this._type == 0&&nodeExtends==25){
            //再分级，创建新的节点
            this._secendDynamicPreNodeMap =[];
            let exnode = LayaWorldDynamicNodeConfig.architectSize/LayaWorldDynamicNodeConfig.secendarchitectLOD0Size;//注意要整除
            let delty = 1/exnode;
            let oriPosCoord = new Vector3(-0.5+delty/2,0,-0.5+delty/2);
            for(let x = 0;x<exnode;x++){
                for(let y = 0;y<1;y++){
                    for(let z = 0;z<exnode;z++){
                        let posC = new Vector3(posCoord.x+oriPosCoord.x+x*delty,posCoord.y+oriPosCoord.y+y*delty,posCoord.z+oriPosCoord.z+z*delty);
                        let node = new DynamicPreNode(posC,new BoundBox(new Vector3(),new Vector3()),LayaWorldDynamicNodeConfig.secendarchitectLOD0Size/2);
                        this._secendDynamicPreNodeMap.push(node);
                        node.secendType = Math.sqrt(Math.pow(posC.x*size,2)+Math.pow(posC.y*size,2)+Math.pow(posC.z*size,2))>LayaWorldDynamicNodeConfig.LOD0DIstanec?1:0;
                    }
                }
            }

        }
    }


    //绑定渲染节点
    preRender(pos:Vector3){
        //回收数据
        StaticMapNode.GCManager(pos);
        //更新LayaWorldPos
        //type为0会生成多级节点
        let mulCanRender = true;
        this.mapBoundNode = null;
        if(this._type==0){
           
            //多级节点渲染,
            for(let i = 0;i<this._secendDynamicPreNodeMap.length;i++){
               let dynamicNode = this._secendDynamicPreNodeMap[i];
               Vector3.add(this.manager.LayaworldPos,dynamicNode._localPos,dynamicNode._layaWorldpos);
               let map = StaticMapNode.StaticSecendNodeMap;
               let key = dynamicNode._layaWorldpos.x.toString()+","+dynamicNode._layaWorldpos.y.toString()+","+dynamicNode._layaWorldpos.z.toString();
               if(map[key]){
                dynamicNode.mapBoundNode = map[key];//设置渲染节点
                }else{
                    let position:Vector3 = new Vector3();
                    Vector3.subtract(dynamicNode._layaWorldpos, LayaWorldDynamicNodeConfig.architectNodemanager.primitiveLayaWorldPos,position);
                    dynamicNode.mapBoundNode = StaticMapNode.addMapBound(position,dynamicNode._layaWorldpos,dynamicNode.nodeextends,map);
                }
                DynamicPreNode.tempPos.setValue(pos.x,0,pos.z);
                let rendertype  = Vector3.distance(dynamicNode.mapBoundNode.renderPos,pos)>LayaWorldDynamicNodeConfig.LOD0DIstanec?1:0;
                mulCanRender = dynamicNode.mapBoundNode.preRender(rendertype)?mulCanRender:false;
            } 
        }
         
        if(this._type != 0||!mulCanRender){
            Vector3.add(this.manager.LayaworldPos,this._localPos,this._layaWorldpos);
            //重新绑定renderNode
            let map = StaticMapNode.StaticMapNodeMap;
            let key = this._layaWorldpos.x.toString()+","+this._layaWorldpos.y.toString()+","+this._layaWorldpos.z.toString();
            if(map[key]){
                this.mapBoundNode = map[key];//设置渲染节点
            }else{
                let position:Vector3 = new Vector3();
                Vector3.subtract(this._layaWorldpos,this.manager.primitiveLayaWorldPos,position);
                this.mapBoundNode = StaticMapNode.addMapBound(position,this._layaWorldpos,this.nodeextends,map);
            }
            if(!mulCanRender)
            this.mapBoundNode.preRender(1);
            else
            this.mapBoundNode.preRender(this._type);
        }
        //多级节点没有准备好
       

    }

    secondMapRender(){
        for(let i = 0;i<this._secendDynamicPreNodeMap.length;i++){
            let dynamicNode = this._secendDynamicPreNodeMap[i];
            dynamicNode.mapBoundNode.render();
        }
    }
}