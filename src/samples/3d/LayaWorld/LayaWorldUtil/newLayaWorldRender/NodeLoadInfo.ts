
import { Vector3 } from "laya/d3/math/Vector3";
import { Byte } from "laya/utils/Byte";
import { CubeDataUtils } from "../../LayaCube/CubeDataUtils";
import { CubeFaceUtil } from "../../LayaCube/CubeFaceUtil";
import { LayaWorldDynamicNodeConfig } from "./LayaWorldDynamicNodeConfig";
import { LoadFlag } from "./loaderEventList";
import { StaticMapNode } from "./RenderableSprite/StaticMapNode";
import { StaticMapNodeRenderGeometry } from "./RenderableSprite/StaticMapNodeRenderGeometry";

export class NodeLoadInfo{

    static _pool:Array<NodeLoadInfo> = [];
    //TODO: 临时组织 0是地板  12是cube和球
    static _faceData:Array<Array<Byte>> = [];
    static _TypeArray:Array<number> = [1,2,4];
    static cubeSizeArray:Array<number> = [0.2,0.5,2.5];
    public static create(type:number,importance:LoadFlag,node:StaticMapNode):NodeLoadInfo {
        if (NodeLoadInfo._pool.length) {
            let nodeInfo = NodeLoadInfo._pool.pop();
            nodeInfo._inpool = false;
            nodeInfo._type = type;
            nodeInfo._node = node;
            nodeInfo._importance = importance;
        } else {
            return new NodeLoadInfo(type,importance, node);
        }
    }
    public static recover( nodeInfo:NodeLoadInfo){
        if (nodeInfo)
        {
            if (!nodeInfo._inpool){
                nodeInfo._inpool = true;
                NodeLoadInfo._pool.push(nodeInfo);
            }
        }
    }

    _type:number;
    _importance:LoadFlag;
    _node:StaticMapNode;
    _inpool:boolean = false;
	

    constructor(type:number,importance:LoadFlag,node:StaticMapNode){
        this._type = type;
        this._importance = importance;
        this._node = node;
    }


    do(){
        let geometry = this._node.LodGeometry[this._type] = new StaticMapNodeRenderGeometry();
        let centerlayaWorld = this._node.layaWorldPos;
        let pos:Vector3 = this._node.renderPos;
        let boundSize = 5;
        let faceMap:Array<any> = [];
        let fors = this._node.extends/LayaWorldDynamicNodeConfig.unitSize;
        for(var x = -fors;x<fors;x++){
            for(var y = 0;y<2;y++){
                for(var z = -fors;z<fors;z++){
                    let danyuanPos = new Vector3(x*boundSize,y*boundSize,z*boundSize);
                    let LayaWorldPos = new Vector3();
                    Vector3.add(danyuanPos,centerlayaWorld,LayaWorldPos);
                    Vector3.add(danyuanPos,pos,danyuanPos);
                    
                    let faceData = this.getRenderData(danyuanPos,y,LayaWorldPos,NodeLoadInfo._TypeArray[this._type]);
                    if(faceData){
                        faceMap.push(faceData);
                    }
                }
            }
        }
        geometry.parse(faceMap);
    }

    getRenderData(pos:Vector3,y:number,layaWorld:Vector3,dataIdnex:number){
        let byte:Byte;
        if(y==0)
         byte = NodeLoadInfo._faceData[0][dataIdnex];
        else{
            if((pos.x+pos.z)%2==0)
            byte = Math.random()>0.5?NodeLoadInfo._faceData[1][dataIdnex]:NodeLoadInfo._faceData[2][dataIdnex];
            else
            return null;
        }
        byte.pos = 0;
        let faceData = CubeDataUtils.parseFaceData(byte);
        if(y == 0){
            faceData[1] = null;
            faceData[0] = null;
            faceData[3] = null;
            faceData[4] = null;
            faceData[5] = null;
        }
        return CubeFaceUtil.CreateVertexData(faceData,pos,NodeLoadInfo.cubeSizeArray[this._type]);
         


    }

}