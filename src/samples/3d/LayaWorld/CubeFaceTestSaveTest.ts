import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { PixelLineSprite3D } from "laya/d3/core/pixelLine/PixelLineSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Color } from "laya/d3/math/Color";
import { Matrix4x4 } from "laya/d3/math/Matrix4x4";
import { Vector3 } from "laya/d3/math/Vector3";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { Stage } from "laya/display/Stage";
import { Browser } from "laya/utils/Browser";
import { Byte } from "laya/utils/Byte";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { Tool } from "../common/Tool";
import { CombinatCube } from "./LayaCube/CombinatCube";
import { CubeBox4features } from "./LayaCube/CubeBox4";
import { CubeDataUtils } from "./LayaCube/CubeDataUtils";
import { CubeFaceUtil } from "./LayaCube/CubeFaceUtil";

export class CubeFaceTestSaveTest{
    testMeshsprite:MeshSprite3D;
    faceData:any;
    combineCUbe:CombinatCube;
    //是否保存文件
    saveFile:boolean = true;
    //
    saveTitle:string = "sphere";
    constructor(){
        Laya3D.init(0, 0);
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		Stat.show();
        var scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()));
		scene.ambientColor = new Vector3(0.5, 0.5, 0.5);

        CombinatCube.__init__();

		var camera: Camera = (<Camera>scene.addChild(new Camera(0, 0.1, 100)));
		camera.transform.translate(new Vector3(0, 0.5, 1));
		camera.transform.rotate(new Vector3(-15, 0, 2), true, false);
		camera.addComponent(CameraMoveScript);
        //创建方向光
		var directionLight: DirectionLight = (<DirectionLight>scene.addChild(new DirectionLight()));
		//方向光的颜色
		directionLight.color.setValue(0.2, 0.2, 0.2);
		//设置平行光的方向
		var mat: Matrix4x4 = directionLight.transform.worldMatrix;
		mat.setForward(new Vector3(-1.0, -0.8, -1.0));
		directionLight.transform.worldMatrix = mat;
        var faceOBJ = this.createCombineCube();

        
        //create Ori Cube
        this.testMeshsprite = new MeshSprite3D();
        scene.addChild(this.testMeshsprite);
        let mate:BlinnPhongMaterial = this.testMeshsprite.meshRenderer.sharedMaterial = new BlinnPhongMaterial();
        mate.enableVertexColor = true;
        
        this.testMeshsprite.meshFilter.sharedMesh = this.mergeFloat32Array(faceOBJ);
        //创建像素线渲染精灵
		var layaMonkeyLineSprite3D: PixelLineSprite3D = (<PixelLineSprite3D>this.testMeshsprite.addChild(new PixelLineSprite3D(200000)));
		//设置像素线渲染精灵线模式
		Tool.linearModel(this.testMeshsprite, layaMonkeyLineSprite3D, Color.BLACK);
        layaMonkeyLineSprite3D.active = true;
        //this.testMeshsprite.active = false;
        //test save faceData
        if(true){
            //faceFile test
            this.testFaceFile(this.faceData,this.combineCUbe,scene,mate);
            //combineCUbe test
            this.testCombineCubeData(this.combineCUbe,scene,mate);
        }
        //lod test
        if(true){
            this.testLodCombineCubeData(this.combineCUbe,scene,mate,20,2);
            this.testLodCombineCubeData(this.combineCUbe,scene,mate,40,5);
            this.testLodCombineCubeData(this.combineCUbe,scene,mate,60,10);
            this.testLodCombineCubeData(this.combineCUbe,scene,mate,80,25);
            this.testLodCombineCubeData(this.combineCUbe,scene,mate,100,50);
            //this.testLodCombineCubeData(this.combineCUbe,scene,mate,25,50);
        }
        //scene.addChild(new MeshSprite3D(PrimitiveMesh.createBox()));
        
    }


    createCombineCube(){
        this.combineCUbe = new CombinatCube(new Vector3(),new Vector3());
        //this.createBox(this.combineCUbe);
        this.creatSphere(this.combineCUbe);
        //this.createFlor(this.combineCUbe);
     
        this.faceData = this.combineCUbe.getLOD0Box4AllRender();
        let obj = CubeFaceUtil.CreateVertexData(this.faceData,this.combineCUbe._samplePos);
        return obj
    }
    creatSphere(combineCube:CombinatCube){
        let sphere = new Vector3(25,25,25);
        let pos = new Vector3();
        for(let x = 0;x<50;x++){
            for(let y = 0;y<50;y++){
                for(let z = 0;z<50;z++){
                    pos.setValue(x,y,z);
                    
                    if(Vector3.distance(pos,sphere)<23) {
                       if(Math.random()>0.5)
                       combineCube.set1x1x1(x,y,z,CubeBox4features.color,0x00ff00);         
                       else
                        combineCube.set1x1x1(x,y,z,CubeBox4features.color,0xff0000);         
                    }
                    
                }
            }
        }
    }
    createBox(combineCube){
        let boxSize = 42;
        for(let x =0;x<boxSize;x++){
            for(let y = 0;y<boxSize;y++){
                for(let z = 0;z<boxSize;z++){
                    if(Math.random()>0.5)
                    combineCube.set1x1x1(x,y,z,CubeBox4features.color,0x00ff00);         
                    else
                    combineCube.set1x1x1(x,y,z,CubeBox4features.color,0xff0000);         
                }
            }
        }
    }

    createFlor(combineCube){
        let boxSize = 50;
        for(let x =0;x<boxSize;x++){
            for(let y = 0;y<25;y++){
                for(let z = 0;z<boxSize;z++){
                    if(Math.random()>0.5)
                    combineCube.set1x1x1(x,y,z,CubeBox4features.color,0x00ff00);         
                    else
                    combineCube.set1x1x1(x,y,z,CubeBox4features.color,0xff0000);         
                }
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


    //testFaceFile
    testFaceFile(faceData:any,combieCube:CombinatCube,scene:Scene3D,material:BlinnPhongMaterial){
        let facebyte =  CubeDataUtils.saveFaceData(faceData,combieCube._LayaWorldPos,0,0.1,combieCube);
        if(this.saveFile)
        this.createFile(facebyte,this.saveTitle+"lod0");
       facebyte.pos = 0;
       let praseFaceData = CubeDataUtils.parseFaceData(facebyte);
       let faceOBJ = CubeFaceUtil.CreateVertexData(praseFaceData,new Vector3(5,0,0));
       let mesh:Mesh = this.mergeFloat32Array(faceOBJ);
       let meshsprite = new MeshSprite3D(mesh);
       meshsprite.meshRenderer.sharedMaterial = material;
       scene.addChild(meshsprite);
        return;
    }


    testCombineCubeData(combieCube:CombinatCube,scene:Scene3D,material:BlinnPhongMaterial){
        let CombineCubeData:Byte = CubeDataUtils.saveCubeData(combieCube);
        if(this.saveFile)
        this.createFile(CombineCubeData,this.saveTitle+"CubeFile");
        let newCombineCube:CombinatCube = CubeDataUtils.parseCubeData(CombineCubeData);
        let faceOBJ = newCombineCube.getAllRender();
        faceOBJ = CubeFaceUtil.CreateVertexData(faceOBJ,new Vector3(10,0,0));
        let mesh:Mesh = this.mergeFloat32Array(faceOBJ);
        let meshsprite = new MeshSprite3D(mesh);
        meshsprite.meshRenderer.sharedMaterial = material;
        scene.addChild(meshsprite);
    }

    testLodCombineCubeData(combieCube:CombinatCube,scene:Scene3D,material:BlinnPhongMaterial,pos:number,lod:number){
        let CombineCube:CombinatCube= combieCube.getLODCombinatCube(lod);
    
        let faceOBJ = CombineCube.getAllRender();
        if(this.saveFile)
        this.createFile(CubeDataUtils.saveFaceData(faceOBJ,CombineCube._LayaWorldPos,lod,0.1*lod,CombineCube),this.saveTitle+"lod"+lod.toString());
        faceOBJ = CubeFaceUtil.CreateVertexData(faceOBJ,new Vector3(pos,0,0),CubeFaceUtil.creatModelScalse*lod);

        let mesh:Mesh = this.mergeFloat32Array(faceOBJ);
        let meshsprite = new MeshSprite3D(mesh);
        meshsprite.meshRenderer.sharedMaterial = material;
        scene.addChild(meshsprite);
    }


    //生成二进制文件
    createFile(byte:Byte,fileName:string){
            var Blob = window.Blob;
            var binFileAsBlob = new Blob([byte.buffer], { type: 'application/octet-stream' });
            var downloadLink = Browser.document.createElement("a");
            downloadLink.download =fileName+".aa";
            downloadLink.href = window.URL.createObjectURL(binFileAsBlob);
            downloadLink.click();
    }


  
}