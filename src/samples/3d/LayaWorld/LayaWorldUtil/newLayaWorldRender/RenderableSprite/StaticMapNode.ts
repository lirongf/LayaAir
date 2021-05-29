import { Vector3 } from "laya/d3/math/Vector3";
import { Stat } from "laya/utils/Stat";
import { LayaWorldDynamicNodeConfig } from "../LayaWorldDynamicNodeConfig";
import { LoaderEventList, LoadFlag } from "../LoaderEventList";
import { NodeLoadInfo } from "../NodeLoadInfo";

import { StaticMapNodeRenderGeometry } from "./StaticMapNodeRenderGeometry";

/**
 * 静态地图节点
 * @author：miner
 */
export class StaticMapNode{
    
    //如果还未加载好渲染的最低LOD级，如果LOD大于此值，就不进行渲染
    static defaultRenderLOD:number = 3;
    /**渲染数据缩影 -1表示不可以渲染*/
    private _renderType:number;
    /**是否请求Lod渲染数据，避免重复请求 */
    private _preLodLodBuffer:Array<Boolean> = [];
    
    /**所有静态节点数据 */
    static StaticMapNodeMap = {};
    /**多级静态节点数据 */
    static StaticSecendNodeMap = {};
    static CommonCPUMemory:number = 0;
    static CommonGPUMemory:number = 0;
    static MaxMemory:number = 419430400/4*3;//400M
    static MaxDuringUpdate:number = 100;//世隔多少帧删除

    /**
     * 增加一个静态节点数据
     * @param pos 
     * @param layaWorldPos 
     * @returns 
     */
    static addMapBound(pos:Vector3,layaWorldPos:Vector3,extend:number,map:any):StaticMapNode{
        let mapBoundNode = new StaticMapNode(layaWorldPos,pos,extend);
        let key = layaWorldPos.x.toString()+","+layaWorldPos.y.toString()+","+layaWorldPos.z.toString();
        map[key] = mapBoundNode;
        return mapBoundNode;
    }

    static GCManager(cameraPos:Vector3){
        if(!(StaticMapNode.CommonCPUMemory>StaticMapNode.MaxMemory||StaticMapNode.CommonGPUMemory>StaticMapNode.MaxMemory))
            return;
        for(let i in StaticMapNode.StaticMapNodeMap){
           let staticMapNode:StaticMapNode =  StaticMapNode.StaticMapNodeMap[i];
           let distance:number = Vector3.distance( staticMapNode.renderPos,cameraPos);
           if(distance<LayaWorldDynamicNodeConfig.LODDistance[1]) continue;
           let lodGeometryArray = staticMapNode.LodGeometry;
           for(let j = 0;j<lodGeometryArray.length;j++){
                if(!lodGeometryArray[j]) continue;
                if(Stat.loopCount- lodGeometryArray[j].updateLoop>StaticMapNode.MaxDuringUpdate){
                    lodGeometryArray[j].destroy();
                    lodGeometryArray[j] = null;
                    staticMapNode._preLodLodBuffer[j] = false;
               }
           }
        }
        for(let i in StaticMapNode.StaticSecendNodeMap){
            let staticMapNode:StaticMapNode =  StaticMapNode.StaticSecendNodeMap[i];
            let lodGeometryArray = staticMapNode.LodGeometry;
            let distance:number = Vector3.distance( staticMapNode.renderPos,cameraPos);
            if(distance<LayaWorldDynamicNodeConfig.LODDistance[0]) continue;
            for(let j = 0;j<lodGeometryArray.length;j++){
                if(!lodGeometryArray[j]) continue;
                if(Stat.loopCount- lodGeometryArray[j].updateLoop>StaticMapNode.MaxDuringUpdate){
                     lodGeometryArray[j].destroy();
                     lodGeometryArray[j] = null;
                     staticMapNode._preLodLodBuffer[j] = false;
                }
            }
         }
    }

    //实际渲染位置，静态节点在客户端的位置
    renderPos:Vector3;
    //layaWorld世界中的位置，也就是静态节点相对于服务器的位置
    layaWorldPos:Vector3;
    //数量最少的面级数
    _defaultRender:number = 3;
    //Lod渲染器
    LodGeometry:StaticMapNodeRenderGeometry[] = [];
    //Node节点大小，节点大小将决定合面的单元以及合面速率，需要和动态节点大小一致
    extends:number;
   
    /**
     * 创建一个静态节点类
     * @param worldPos 
     * @param pos 
     */
    constructor(worldPos:Vector3,pos:Vector3,extend:number){
        this.renderPos = pos;
        this.layaWorldPos = worldPos;
        this.extends = extend;
        //创建加载的数据类
        if(!LoaderEventList.loader) LoaderEventList.loader = new LoaderEventList();
    }


    /**
     * 准备渲染数据，如果并没有数据 请求数据
     * @param type 
     */
    preRender(type:number):boolean{
        if(type == -1){
            this._renderType = -1;
            return false;
        }
        if(this.LodGeometry[type]){
            this._renderType = type;
            return true;
        }
        else{
            //加载组织
            if(!this._preLodLodBuffer[type]){
            
                LoaderEventList.loader.loaderData(NodeLoadInfo.create(type,type,this));
                this._preLodLodBuffer[type] = true;
            }
            while(true){
                if(this.LodGeometry[++type]){
                    this._renderType = type;
                    return true;
                }
                if(type ==StaticMapNode.defaultRenderLOD){
                    this._renderType = -1;
                    return false;
                }
            }
          
        }
        
    }

    /**
     * 渲染数据
     * @returns 
     */
    render(){
        if(this._renderType ==-1)
            return;
        this.LodGeometry[this._renderType].render();
    }

}

