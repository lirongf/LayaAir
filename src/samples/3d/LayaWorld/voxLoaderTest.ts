import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Matrix4x4 } from "laya/d3/math/Matrix4x4";
import { Vector3 } from "laya/d3/math/Vector3";
import { Shader3D } from "laya/d3/shader/Shader3D";
import { Stage } from "laya/display/Stage";
import { Loader } from "laya/net/Loader";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { CombinatCube } from "./LayaCube/CombinatCube";
import { CombinatManager } from "./LayaCube/CombinatManager";
import { LayaWorldDynamicNodeConfig } from "./LayaWorldUtil/newLayaWorldRender/LayaWorldDynamicNodeConfig";
import { LayaWorldSprite3D } from "./LayaWorldUtil/newLayaWorldRender/RenderableSprite/LayaWorldSprite3D";
import { StaticMapNodeRenderGeometry } from "./LayaWorldUtil/newLayaWorldRender/RenderableSprite/StaticMapNodeRenderGeometry";
import { VoxFileData } from "./voxFile/VoxFileData";

export class voxLoaderTest{
    material:BlinnPhongMaterial;
    scene:Scene3D;
    camera:Camera;
    voxFileData:VoxFileData;
    deltyVector:Vector3 = new Vector3();
    combination:CombinatManager;
    constructor() {
		//初始化引擎
		Laya3D.init(0, 0);
		Stat.show();
        Shader3D.debugMode = true;
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
      
        this.scene= (<Scene3D>Laya.stage.addChild(new Scene3D()));
		this.scene.ambientColor = new Vector3(0.5, 0.5, 0.5);



		this.camera= (<Camera>this.scene.addChild(new Camera(0, 0.1, 2000)));
		this.camera.transform.translate(new Vector3(2, 7, 1));
		this.camera.transform.rotate(new Vector3(0, 0, 0), true, false);
		this.camera.addComponent(CameraMoveScript);
        this.camera.fieldOfView = 60;
        //创建方向光
		var directionLight: DirectionLight = (<DirectionLight>this.scene.addChild(new DirectionLight()));
		//方向光的颜色
		directionLight.color.setValue(0.2, 0.2, 0.2);
		//设置平行光的方向
		var mat: Matrix4x4 = directionLight.transform.worldMatrix;
		mat.setForward(new Vector3(-1.0, -0.8, -1.0));
		directionLight.transform.worldMatrix = mat;

   
        this.material= new BlinnPhongMaterial();
        this.material.enableVertexColor = true;
        this.material.renderMode= BlinnPhongMaterial.RENDERMODE_OPAQUE;
        this.voxFileData = new VoxFileData();
        this.LayaWorldInit();
        this.combination = new CombinatManager();
        this.combination.setStartCombineManager(new Vector3(),new Vector3());
        this.PreloadingRes();
	}
    //批量预加载方式
	PreloadingRes() {
		//预加载所有资源
		let resource: any[] = [//下面都是
								"res/threeDimen/LayaScene_LayaWorldTest/voxData/5-0.vox",
                                "res/threeDimen/LayaScene_LayaWorldTest/voxData/5-1.vox",
                                "res/threeDimen/LayaScene_LayaWorldTest/voxData/teapot.vox"
                            ];
		Laya.loader.create(resource, Handler.create(this, this.onPreLoadFinish),null,Loader.BUFFER);
	}

    onPreLoadFinish(){
        this.deltyVector.setValue(0,0,0);
        this.voxFileData.LoadVoxFile("res/threeDimen/LayaScene_LayaWorldTest/voxData/5-0.vox",Handler.create(this,this.getCubeInfoArray),this.deltyVector.clone());
        this.deltyVector.setValue(120,0,0);
        this.voxFileData.LoadVoxFile("res/threeDimen/LayaScene_LayaWorldTest/voxData/5-1.vox",Handler.create(this,this.getCubeInfoArray),this.deltyVector.clone());
    }



    LayaWorldInit(){
        //this.layaWorldConfig = LayaWorldRenderConfig._layaWorldConfig;
        LayaWorldDynamicNodeConfig.initArchitecNode(new Vector3(),this.camera);
        CombinatCube.__init__();
        StaticMapNodeRenderGeometry.__init__();
    }

    /**
     * 获得所有的数据
     * @param cubeInfoArray 
     */
    getCubeInfoArray(cubeInfoArray:any,pos:Vector3){
        debugger;
        let colorArray = cubeInfoArray.colorArray;
        let PositionArray = cubeInfoArray.PositionArray;
        for(let i = 0,n = colorArray.length;i<n;i++){
            let posIndex = i*3;
            this.addCube(PositionArray[posIndex],PositionArray[posIndex+1],PositionArray[posIndex+2],pos,colorArray[i]);
        }
        this.combination.createMeshsprite(this.scene,this.material);
    }

    

    addCube(x:number,y:number,z:number,delty:Vector3,color:number){
        this.combination.addcube(delty.x+x,delty.y+y,delty.z+z,color);
    }
}