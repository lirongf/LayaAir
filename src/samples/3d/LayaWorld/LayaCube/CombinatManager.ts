import { Material } from "laya/d3/core/material/Material";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { CombinatCube } from "./CombinatCube";
import { CubeBox4features } from "./CubeBox4";
import { CubeFaceUtil } from "./CubeFaceUtil";

export class CombinatManager{
    static tempVector:Vector3 = new Vector3();
    static NodeSize = 50;//50m
    static OneLineCubeNums;//一个Node多少个Cube
    static OneLineSampleNums;//一个Node有多少个单元
    static OnePowLineSampleNums;
    NodeCubeMap:any = {};
    startLayaWorldPos:Vector3;//哪个Node节点
    startCubePos:Vector3;//Node中的哪个Cube的位置开始


    constructor(){
        CombinatManager.OneLineCubeNums = CombinatManager.NodeSize/(CombinatCube.CombineOneMeter);
        CombinatManager.OneLineSampleNums =CombinatManager.NodeSize/CombinatCube.CombineOneSampleMeter;
        CombinatManager.OnePowLineSampleNums = CombinatManager.OneLineSampleNums *CombinatManager.OneLineSampleNums ;
    }

    /**
     * 设置初始Pos
     * @param layaWorldPos 
     */
    setStartCombineManager(layaWorldPos:Vector3,startPos:Vector3){
        this.startLayaWorldPos = layaWorldPos;
        this.startCubePos = startPos;
    }

    addcube(x:number,y:number,z:number,color:number){
        //StartCubePos
        let cubePosx = this.startCubePos.x+x;
        let cubePosy = this.startCubePos.x+y;
        let cubePosz = this.startCubePos.x+z;
        CombinatManager.tempVector.setValue(
         this.startLayaWorldPos.x+(cubePosx/CombinatManager.OneLineCubeNums|0),
         this.startLayaWorldPos.y+(cubePosy/CombinatManager.OneLineCubeNums|0),
         this.startLayaWorldPos.z+(cubePosz/CombinatManager.OneLineCubeNums|0)
        )
        let key =  CombinatManager.tempVector.x.toString()+","+CombinatManager.tempVector.y.toString()+","+CombinatManager.tempVector.z.toString();
        //获得单元数据
        let node = this.NodeCubeMap[key]
        if(!node){
            //TODO：服务器请求  先创建
            node = this.NodeCubeMap[key] = {};
        }
        
        let combineCubeIndex = (cubePosx/CombinatCube.CombineSize|0)+
        (cubePosy/CombinatCube.CombineSize|0)*CombinatManager.OnePowLineSampleNums+
        (cubePosz/CombinatCube.CombineSize|0)*CombinatManager.OneLineSampleNums;
        let combineCube:CombinatCube = node[combineCubeIndex] = node[combineCubeIndex] ?node[combineCubeIndex] :new CombinatCube(CombinatManager.tempVector.clone(),new Vector3(cubePosx/CombinatCube.CombineSize|0,cubePosy/CombinatCube.CombineSize|0,cubePosz/CombinatCube.CombineSize|0));
        combineCube.set1x1x1(cubePosx%CombinatCube.CombineSize,cubePosy%CombinatCube.CombineSize,cubePosz%CombinatCube.CombineSize,CubeBox4features.color,color);
    }


    createMeshsprite(scene:Scene3D,material:Material){
        let array:Array<MeshSprite3D> = [];
        //get All CubeCombine
        for(let i in this.NodeCubeMap){
            let node = this.NodeCubeMap[i]
            for(let j in node){
                let combine:CombinatCube = node[j];
                let faceArray = combine.getAllRender();
                let pos:Vector3 = new Vector3();
                debugger;
                Vector3.scale(combine._samplePos,CombinatCube.CombineOneSampleMeter,pos);
                let vertex = CubeFaceUtil.CreateVertexData(faceArray,pos,CombinatCube.CombineOneMeter);
                let sprite = new MeshSprite3D(this.mergeFloat32Array(vertex));
                sprite.meshRenderer.sharedMaterial = material;
                scene.addChild(sprite);
            }
        }
    }

    mergeFloat32Array(obj:any):Mesh{
        let arraylength = 0;
        for(var i in obj){
            let floatArray:Float32Array = obj[i];
            arraylength+=floatArray.length;
        }
        let newFloat = new Float32Array(arraylength);
        let offset = 0;
        for(var i in obj){
            let floatArray:Float32Array = obj[i];
            newFloat.set(floatArray,offset);
            offset+=floatArray.length;
        }
        let faceNum = newFloat.length/48;
        //faceNum
        let indices = new Uint16Array(faceNum*6);
        for (let j = 0; j < faceNum; j++) {
            var indexOffset:number = j * 6;
            var pointOffset:number = j * 4;
            indices[indexOffset] = pointOffset;
            indices[indexOffset + 1] = 2 + pointOffset;
            indices[indexOffset + 2] = 1 + pointOffset;
            indices[indexOffset + 3] = pointOffset;
            indices[indexOffset + 4] = 3 + pointOffset;
            indices[indexOffset + 5] = 2 + pointOffset;
        }
        return CubeFaceUtil.createDebugMesh(CubeFaceUtil.vertexDeclaration,newFloat,indices);
    }


}