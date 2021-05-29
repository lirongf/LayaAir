import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { PixelLineSprite3D } from "laya/d3/core/pixelLine/PixelLineSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Matrix4x4 } from "laya/d3/math/Matrix4x4";
import { Vector3 } from "laya/d3/math/Vector3";
import { Shader3D } from "laya/d3/shader/Shader3D";
import { Stage } from "laya/display/Stage";
import { Loader } from "laya/net/Loader";
import { Byte } from "laya/utils/Byte";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { CombinatCube } from "./LayaCube/CombinatCube";
import { LayaWorldDynamicNodeConfig } from "./LayaWorldUtil/newLayaWorldRender/LayaWorldDynamicNodeConfig";
import { NodeLoadInfo } from "./LayaWorldUtil/newLayaWorldRender/NodeLoadInfo";
import { LayaWorldSprite3D } from "./LayaWorldUtil/newLayaWorldRender/RenderableSprite/LayaWorldSprite3D";
import { StaticMapNodeRenderGeometry } from "./LayaWorldUtil/newLayaWorldRender/RenderableSprite/StaticMapNodeRenderGeometry";

export class LayaWorldTest{
    renderNodeLine:PixelLineSprite3D ;
    OctreeNodeLine:PixelLineSprite3D ;
    material:BlinnPhongMaterial;
    scene:Scene3D;
    camera:Camera;
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

      this.LayaWorldInit();
        
        this.PreloadingRes();
	}
    //批量预加载方式
	PreloadingRes() {
		//预加载所有资源
		let resource: any[] = ["res/threeDimen/LayaScene_LayaWorldTest/Conventional/LayaWorldTest.ls",//下面都是
								"res/threeDimen/LayaScene_LayaWorldTest/datas/cubelod0.aa",
                                "res/threeDimen/LayaScene_LayaWorldTest/datas/cubelod2.aa",
                                "res/threeDimen/LayaScene_LayaWorldTest/datas/cubelod5.aa",
                                "res/threeDimen/LayaScene_LayaWorldTest/datas/cubelod10.aa",
                                "res/threeDimen/LayaScene_LayaWorldTest/datas/cubelod25.aa",
                                "res/threeDimen/LayaScene_LayaWorldTest/datas/cubelod50.aa",

                                "res/threeDimen/LayaScene_LayaWorldTest/datas/Floorlod0.aa",
                                "res/threeDimen/LayaScene_LayaWorldTest/datas/Floorlod2.aa",
                                "res/threeDimen/LayaScene_LayaWorldTest/datas/Floorlod5.aa",
                                "res/threeDimen/LayaScene_LayaWorldTest/datas/Floorlod10.aa",
                                "res/threeDimen/LayaScene_LayaWorldTest/datas/Floorlod25.aa",
                                "res/threeDimen/LayaScene_LayaWorldTest/datas/Floorlod50.aa",

                                "res/threeDimen/LayaScene_LayaWorldTest/datas/spherelod0.aa",
                                "res/threeDimen/LayaScene_LayaWorldTest/datas/spherelod2.aa",
                                "res/threeDimen/LayaScene_LayaWorldTest/datas/spherelod5.aa",
                                "res/threeDimen/LayaScene_LayaWorldTest/datas/spherelod10.aa",
                                "res/threeDimen/LayaScene_LayaWorldTest/datas/spherelod25.aa",
                                "res/threeDimen/LayaScene_LayaWorldTest/datas/spherelod50.aa"
                                
                                
                            ];
		Laya.loader.create(resource, Handler.create(this, this.onPreLoadFinish),null,Loader.BUFFER);
	}

    onPreLoadFinish(){
        this.tempRenderData();        


        let worldSprite:LayaWorldSprite3D = new LayaWorldSprite3D("layaWorld");
        //@ts-ignore
        worldSprite._render.sharedMaterial = this.material;
        this.scene.addChild(worldSprite);

       
        
    }
    //组建临时数据
    tempRenderData(){
        let _faceData:Array<Array<Byte>> = NodeLoadInfo._faceData;
        let araybyte = _faceData[0] = new Array<Byte>();
        araybyte.push(new Byte(Loader.getRes("res/threeDimen/LayaScene_LayaWorldTest/datas/Floorlod0.aa")),
        new Byte(Loader.getRes("res/threeDimen/LayaScene_LayaWorldTest/datas/Floorlod2.aa")),
        new Byte(Loader.getRes("res/threeDimen/LayaScene_LayaWorldTest/datas/Floorlod5.aa")),
        new Byte(Loader.getRes("res/threeDimen/LayaScene_LayaWorldTest/datas/Floorlod10.aa")),
        new Byte(Loader.getRes("res/threeDimen/LayaScene_LayaWorldTest/datas/Floorlod25.aa")),
        new Byte(Loader.getRes("res/threeDimen/LayaScene_LayaWorldTest/datas/Floorlod50.aa")));

        araybyte = _faceData[1] = new Array<Byte>();
        araybyte.push(
        new Byte(Loader.getRes("res/threeDimen/LayaScene_LayaWorldTest/datas/cubelod0.aa")),
        new Byte(Loader.getRes("res/threeDimen/LayaScene_LayaWorldTest/datas/cubelod2.aa")),
        new Byte(Loader.getRes("res/threeDimen/LayaScene_LayaWorldTest/datas/cubelod5.aa")),
        new Byte(Loader.getRes("res/threeDimen/LayaScene_LayaWorldTest/datas/cubelod10.aa")),
        new Byte(Loader.getRes("res/threeDimen/LayaScene_LayaWorldTest/datas/cubelod25.aa")),
        new Byte(Loader.getRes("res/threeDimen/LayaScene_LayaWorldTest/datas/cubelod50.aa")));

        araybyte = _faceData[2] = new Array<Byte>();
        araybyte.push(
        new Byte(Loader.getRes("res/threeDimen/LayaScene_LayaWorldTest/datas/spherelod0.aa")),
        new Byte(Loader.getRes("res/threeDimen/LayaScene_LayaWorldTest/datas/spherelod2.aa")),
        new Byte(Loader.getRes("res/threeDimen/LayaScene_LayaWorldTest/datas/spherelod5.aa")),
        new Byte(Loader.getRes("res/threeDimen/LayaScene_LayaWorldTest/datas/spherelod10.aa")),
        new Byte(Loader.getRes("res/threeDimen/LayaScene_LayaWorldTest/datas/spherelod25.aa")),
        new Byte(Loader.getRes("res/threeDimen/LayaScene_LayaWorldTest/datas/spherelod50.aa")));

    }

    LayaWorldInit(){
        //this.layaWorldConfig = LayaWorldRenderConfig._layaWorldConfig;
        LayaWorldDynamicNodeConfig.initArchitecNode(new Vector3(),this.camera);
        CombinatCube.__init__();
        StaticMapNodeRenderGeometry.__init__();
    }

    

}