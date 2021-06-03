import { Vector3 } from "laya/d3/math/Vector3";
import { CombinatCube } from "./CombinatCube";
import { CubeBox4, CubeBox4features } from "./CubeBox4";
import { CubeFaceUtil } from "./CubeFaceUtil";
import { FaceInfo } from "./FaceInfo";

/**
 * 面管理类
 */
export class FaceManager{
    static tempVec:Vector3 = new Vector3();
    cubeBox:CubeBox4;
    combinatCube:CombinatCube
    cubeBoxIndex:number;
    pos:Vector3;//实际的位置 
    
    faceInfoMap = {};
    faceInfoArray:Array<FaceInfo> = [];
    boundsize:number = 4;
    cubeBox8Pos:Vector3;
    constructor(position:Vector3){
      //this.cubeBox = _cubeBox4;
      this.pos = new Vector3();
      //生成FaceInfo
      //this.creatFaceInfo();
    }

    /**
     * 
     * @param dir 方向
     * @param index 索引
     */
    addFaceIndex(dir:number,index:number){
        let updownIndex:number;
        switch(dir){
            case 4://up down
            case 2:
                updownIndex = index
                break;
            case 0://front Back
            case 5:
                updownIndex = CubeFaceUtil.transfrontBack2Updown[index];
                break;
            case 3://left right
            case 1:
                updownIndex = CubeFaceUtil.transleftRight2Updown[index];
                break;
            }
        let faceInfo = this.getFaceInfo(updownIndex);
        //if(this.cubeBoxIndex == 0)
        //    faceInfo.addface(updownIndex,dir);
        //else{
            //需要重新转换Index给大的Box
            Vector3.add(this.cubeBox8Pos,CubeBox4.IndexPos[updownIndex],FaceManager.tempVec);
            faceInfo.addface(this.combinatCube.getbox1Index(FaceManager.tempVec.x,FaceManager.tempVec.y,FaceManager.tempVec.z),dir);
        //}
    }

    /**
     * 创建所有的FaceInfo
     */
    private creatFaceInfo(){
        let map = this.faceInfoMap;
        let propertyArray = this.cubeBox.propertyDataArray;
        
            for(let index = 0;index<CubeBox4.BOX4COUNT;index++){
                if(!propertyArray[0][index])
                continue;
                let tempArray:Array<number> = new Array(CubeBox4features.length);
                for(let i = 0;i<CubeBox4features.length;i++){
                    tempArray[i] = propertyArray[i][index];
                }
                //组织好FaceInfo的Map
                for(let i = 0;i<CubeBox4features.length-1;i++){
                    if(!map[tempArray[i]])
                        map[tempArray[i]] = [];
                    map = map[tempArray[i]];
                }
                if(!map[tempArray[CubeBox4features.length-1]]){
                    map[tempArray[CubeBox4features.length-1]] = new FaceInfo(tempArray);
                    this.faceInfoArray.push(map[tempArray[CubeBox4features.length-1]]);
                }
                    
            }
            
    }


    /**
     * 获得索引对应的FaceInfo
     * @param index 
     * @returns 
     */
    getFaceInfo(index:number):FaceInfo{
        let map =this.faceInfoMap;
        let propertyArray = this.cubeBox.propertyDataArray;
        for(let i = 0;i<CubeBox4features.length;i++){
            map = map[propertyArray[i][index]];
            //如果暂时没有，直接跳出
            if(!map)
                break;
        }
        if(!map){
            map = this.faceInfoMap;
            //重新组织FaceInfo
            let tempArray:Array<number> = new Array(CubeBox4features.length);
            for(let i = 0;i<CubeBox4features.length;i++){
                tempArray[i] = propertyArray[i][index];
            }
            //组织好FaceInfo的Map
            for(let i = 0;i<CubeBox4features.length-1;i++){
            if(!map[tempArray[i]])
                map[tempArray[i]] = [];
                map = map[tempArray[i]];
            }
            if(!map[tempArray[CubeBox4features.length-1]]){
                map[tempArray[CubeBox4features.length-1]] = new FaceInfo(tempArray);
                this.faceInfoArray.push(map[tempArray[CubeBox4features.length-1]]);
            }
            map = map[tempArray[CubeBox4features.length-1]];
        }
        return <FaceInfo>map;
    }


    //生成面数据
    getRenderVertices():Array<any>{
        let faceArray = FaceManager.createFaceArray();
        this.faceInfoArray.forEach(element => {
            element.mergeFace(this.pos,this.boundsize,faceArray);
        });
        return faceArray;
    }

    static createFaceArray():Array<any>{
        let faceArray:Array<any> = [];
        for(var i = 0;i<6;i++){
            let onedirFaceArray = {};
            onedirFaceArray["startPos"] = new Array<Vector3>();
            onedirFaceArray["heightWidth"] = new Array<number>();
            onedirFaceArray["property"] = new Array<number>();
            faceArray.push(onedirFaceArray);
        }
        return faceArray;
    }

    static getFaceManagerRenderVertices(faceArray:Array<any>,faceManager:FaceManager){
        faceManager.faceInfoArray.forEach(element => {
            element.mergeFace(faceManager.pos,faceManager.boundsize,faceArray);
        });
        return faceArray;
    }


    





}