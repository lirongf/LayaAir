import { Laya } from "Laya";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { NodeLoadInfo } from "./NodeLoadInfo";

export enum LoadFlag{
    Importance,
    secondary,
    unImportance
}
/**
 * 简单的加载管理工具
 */
export class LoaderEventList{
    static loader:LoaderEventList;
    static temp:Mesh[] = [];
    static ImportCommandList:Array<NodeLoadInfo> = new Array<NodeLoadInfo>();
    static mediuCommandList:Array<NodeLoadInfo> = new Array<NodeLoadInfo>();
    static ignorCommandList:Array<NodeLoadInfo> = new Array<NodeLoadInfo>();
    //处理个数
    static ImportanceHandleNums:number = 0;
    static mediuHandleNums:number = 0;
    static ignorHandleNums:number = 0;
    loaderList = {};
    constructor(){
       
        Laya.timer.frameLoop(1,this,this.handleCommandList);
    }
    //发射加载命令
    loaderData(loaderInfo:NodeLoadInfo){  
        switch(loaderInfo._importance){
            case LoadFlag.Importance:
                LoaderEventList.ImportCommandList.push(loaderInfo);
                break;
            case LoadFlag.secondary:
                LoaderEventList.mediuCommandList.push(loaderInfo);
                break;
            case LoadFlag.unImportance:
                LoaderEventList.ignorCommandList.push(loaderInfo);
                break;
        }
        //TODO:这个地方先拿到最简单的Mesh
       // let mesh = LoaderEventList.tempMesh[loaderInfo._type];
       // let mapRenderGeometry = loaderInfo._node.LodVertexBufferState[loaderInfo._type] = new MapRenderGeometry(25);
       // mapRenderGeometry.parse(mesh,loaderInfo._node._pos);
    }

    handleCommandList(){
        let handleNums = 0;
        while(LoaderEventList.ImportCommandList.length){
            let node:NodeLoadInfo = LoaderEventList.ImportCommandList.pop();
            node.do();
            handleNums++;
           if( handleNums>LoaderEventList.ImportanceHandleNums)
            return;
       
        }
        
        while(LoaderEventList.mediuCommandList.length){
            let node:NodeLoadInfo = LoaderEventList.mediuCommandList.pop();
            node.do();
            handleNums++;
           if( handleNums>LoaderEventList.mediuHandleNums)
            return;
         
        }

        while(LoaderEventList.ignorCommandList.length){
            let node:NodeLoadInfo = LoaderEventList.ignorCommandList.pop();
            node.do();
            handleNums++;
           if( handleNums>LoaderEventList.ignorHandleNums)
            return;
          
        }

    }

    

    
}