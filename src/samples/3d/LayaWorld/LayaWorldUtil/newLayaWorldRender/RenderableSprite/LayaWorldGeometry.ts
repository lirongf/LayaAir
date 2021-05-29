import { GeometryElement } from "laya/d3/core/GeometryElement";
import { RenderContext3D } from "laya/d3/core/render/RenderContext3D";
import { LayaWorldDynamicNodeConfig } from "../LayaWorldDynamicNodeConfig";
import { DynamicPreNodeManager } from "./DynamicPreNodeManager";

/**
 * miner
 */
export class LayaWorldGeometry extends GeometryElement{

    //@ts-ignore
    private static _tpye:number = GeometryElement._typeCounter++;

    //动态裁剪管理
    architectNodeManager:DynamicPreNodeManager;

    renderNodeArray:Array<number>;

    constructor(){
        super();
        this.architectNodeManager = LayaWorldDynamicNodeConfig.architectNodemanager;
    }


    /**
	 * 获取几何体类型。
	 */
    _getType():number{
        return LayaWorldGeometry._tpye;
    }


    /**
     * 渲染前准备 获得所有的已经裁剪好的动态节点，每个节点取得渲染数据
     * @param state 
     * @returns 
     */
    _prepareRender(state:RenderContext3D):boolean{
        //@ts-ignore
        this.architectNodeManager.updateLayaWorldPos(state.camera);
        //@ts-ignore
        let arrayIndex = this.architectNodeManager.caculateRotateMap(state.camera.transform.rotationEuler.y);
        this.renderNodeArray =DynamicPreNodeManager.preCullMap[arrayIndex];
        for(var i = 0;i<this.renderNodeArray.length;i++){
            let element = DynamicPreNodeManager.dynamicPreNodeMap[this.renderNodeArray[i]];
              //@ts-ignore
            element.preRender(state.camera.transform.position);
        }
        return true;
    }

    /**
     * 渲染
     * @param state 
     */
    _render(state:RenderContext3D):void{
        for(var i = 0;i<this.renderNodeArray.length;i++){
            let element = DynamicPreNodeManager.dynamicPreNodeMap[this.renderNodeArray[i]];
            if(element.mapBoundNode)
                element.mapBoundNode.render();
            else{
                element._secendDynamicPreNodeMap && element.secondMapRender();
            }
        }
    }

    destroy(){

    }
}