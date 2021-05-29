// import { Laya } from "Laya";
// import { Script3D } from "laya/d3/component/Script3D";
// import { Camera } from "laya/d3/core/Camera";
// import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
// import { Material } from "laya/d3/core/material/Material";
// import { PixelLineSprite3D } from "laya/d3/core/pixelLine/PixelLineSprite3D";
// import { Scene3D } from "laya/d3/core/scene/Scene3D";
// import { Sprite3D } from "laya/d3/core/Sprite3D";
// import { BoundBox } from "laya/d3/math/BoundBox";
// import { Color } from "laya/d3/math/Color";
// import { Vector3 } from "laya/d3/math/Vector3";
// import { Vector4 } from "laya/d3/math/Vector4";
// import { Stage } from "laya/display/Stage";
// import { Loader } from "laya/net/Loader";
// import { Handler } from "laya/utils/Handler";
// import { Stat } from "laya/utils/Stat";
// import { Laya3D } from "Laya3D";
// import { CameraMoveScript } from "../common/CameraMoveScript";
// import { TouchScriptSample } from "../LayaAir3D_MouseInteraction/TouchScriptSample";
// import { LayaWorldRenderConfig } from "./LayaWorldUtil/newLayaWorldRender/LayaWorldRenderConfig";
// import { LoaderEventList } from "./LayaWorldUtil/newLayaWorldRender/LoaderEventList";
// import { ArchitectNodeManager } from "./LayaWorldUtil/newLayaWorldRender/RenderableSprite/ArchitectNodeManager";
// import { ArchitectSprite3D } from "./LayaWorldUtil/newLayaWorldRender/RenderableSprite/ArchitectSprite3D";


// //动态八叉树渲染测试
// export class DynamicBondTest {

//     static tempBoundMax:Vector3 = new Vector3();
//     static tempBoundMin:Vector3 = new Vector3();

//     static yellow:Color = new Color(1,1,0);
//     static red:Color = new Color(1,0,0);
//     static green:Color = new Color(0,1,0);
//     static write:Color = new Color(1,1,1);

//     renderNodeLine:PixelLineSprite3D ;
//     OctreeNodeLine:PixelLineSprite3D ;
//     worldConfig:LayaWorldRenderConfig;
//     testScene:Scene3D;
//     camera:Camera;
//     scene:Scene3D

// 	constructor() {
// 		//初始化引擎
// 		Laya3D.init(0, 0);
// 		Stat.show();
// 		Laya.stage.scaleMode = Stage.SCALE_FULL;
// 		Laya.stage.screenMode = Stage.SCREEN_NONE;
//         this.renderNodeLine = new PixelLineSprite3D(30000);
//         this.OctreeNodeLine = new PixelLineSprite3D(30000);
//         this.PreloadingRes();
// 	}

//     //批量预加载方式
// 	PreloadingRes() {
// 		//预加载所有资源
// 		let resource: any[] = ["res/threeDimen/LayaScene_LayaWorldTest/Conventional/LayaWorldTest.ls",
// 								"res/threeDimen/LayaScene_LayaWorldTest/Conventional/voxAsset/test1gai-default.lm",
//                                 "res/threeDimen/LayaScene_LayaWorldTest/Conventional/voxAsset/test1-default.lm",
//                                 "res/threeDimen/LayaScene_LayaWorldTest/Conventional/voxAsset/test3-default.lm",
//                                 "res/threeDimen/LayaScene_LayaWorldTest/Conventional/voxAsset/VOXMaterials.lmat"
//                             ];
// 		Laya.loader.create(resource, Handler.create(this, this.onPreLoadFinish));
// 	}

//     onPreLoadFinish(){
//         let scene = Loader.getRes("res/threeDimen/LayaScene_LayaWorldTest/Conventional/LayaWorldTest.ls");
        

        
//         (<Scene3D>Laya.stage.addChild(scene));
//         //获取场景中的相机
//         this.camera= (<Camera>scene.getChildByName("Main Camera"));
        
        
//         //设置摄像机视野范围（角度）
//         this.camera.fieldOfView = 60;
//         //加入摄像机移动控制脚本
//         this.camera.addComponent(CameraMoveScript);
//         this.testScene = scene;
        
//         let yeulor = this.camera.aspectRatio*this.camera.fieldOfView/2;
//         //var left = <Sprite3D>scene.getChildByName("fakerCamera").getChildByName("left");
//         //var right = <Sprite3D>scene.getChildByName("fakerCamera").getChildByName("right");
//         //left.transform.rotationEuler = new Vector3(0,yeulor,0);
//         //right.transform.rotationEuler = new Vector3(0,-yeulor,0);
        
//         this.scene = scene;
//         //var fakerCamera = <Sprite3D>scene.getChildByName("fakerCamera");
//        // let testpreCull = this.camera.addComponent(testPreCull);
//        // testpreCull.boundManager = LayaWorldRenderConfig._layaWorldConfig.architectNodemanager;
//         //fakerCamera.addChild(testpreCull.lineSprite);
//        // scene.addChild(testpreCull.lineSprite);
//         //(scene as Scene3D).remo
//         this.endLoad();
//         //设置灯光环境色
//         //scene.ambientColor = new Vector3(2.5, 0, 0);
//     }

//     endLoad(){
//         this.testScene.addChild(this.renderNodeLine);
//         this.testScene.addChild(this.OctreeNodeLine);
//         this.worldConfig = LayaWorldRenderConfig._layaWorldConfig;
//         this.worldConfig.initArchitecNode(new Vector3(0,0,0),this.camera);

//         //传入Mesh
//       //  LoaderEventList.tempMesh.push(Loader.getRes("res/threeDimen/LayaScene_LayaWorldTest/Conventional/voxAsset/test1gai-default.lm"))
//       //  LoaderEventList.tempMesh.push(Loader.getRes("res/threeDimen/LayaScene_LayaWorldTest/Conventional/voxAsset/test1-default.lm"));
//       //  LoaderEventList.tempMesh.push(Loader.getRes("res/threeDimen/LayaScene_LayaWorldTest/Conventional/voxAsset/test3-default.lm"));
//         let testMaterial:BlinnPhongMaterial = Loader.getRes("res/threeDimen/LayaScene_LayaWorldTest/Conventional/voxAsset/VOXMaterials.lmat");
//         let worldSprite:ArchitectSprite3D = new ArchitectSprite3D("layaworld");
//         //@ts-ignore
//         worldSprite._render.sharedMaterial = testMaterial;
//         this.scene.addChild(worldSprite);
//         //画框
//         // let testpreCull = this.camera.addComponent(testPreCull);
//         // testpreCull.boundManager = LayaWorldRenderConfig._layaWorldConfig.architectNodemanager;
//         // this.scene.addChild(testpreCull.lineSprite);
//         this.drawRenderNode();
//         //画出所有Octree的Node
//         //this.drawOctreeNode();

//     }


//     drawRenderNode(){
//         let color = new Color(0.1,0.1,0.1);
//         for(let i = -3025;i<3025;i+=this.worldConfig.architectSize){
//             this.renderNodeLine.addLine(new Vector3(i,0,-3025),new Vector3(i,0,3025),color,color);
//             this.renderNodeLine.addLine(new Vector3(-3025,0,i),new Vector3(3025,0,i),color,color);
//         }
//     }

//     drawOctreeNode(){
//         this.OctreeNodeLine.clear();
//         let ar = this.worldConfig.architectNodemanager.nodeArray;
//         debugger;
//         ar.forEach(element => {
//             DynamicBondTest.drawOneOcreePlane(element.bounds,element._type,this.OctreeNodeLine,0.5);
//         });
        
//     }

    

//     static drawOneOcreePlane(boundBox:BoundBox,LOD:number,lineSPrite:PixelLineSprite3D,hight:number){
//         let xmax = boundBox.max.x;
//         let xmin = boundBox.min.x;
//         let zmax = boundBox.max.z;
//         let zmin = boundBox.min.z;

//         let color:Color;

//         switch(LOD){
//             case 0:
//                 color = this.red;
//                 break;
//             case 1:
//                 color = this.green;
//                 break;
//             case 2:
//                 color = this.yellow;
//                 break;
//         }

//         this.tempBoundMin.setValue(xmin,hight,zmin);
//         this.tempBoundMax.setValue(xmax,hight,zmin);
//         lineSPrite.addLine(this.tempBoundMin,this.tempBoundMax,color,color);
//         this.tempBoundMin.setValue(xmin,hight,zmax);
//         this.tempBoundMax.setValue(xmin,hight,zmin);
//         lineSPrite.addLine(this.tempBoundMin,this.tempBoundMax,color,color);
//         this.tempBoundMin.setValue(xmax,hight,zmin);
//         this.tempBoundMax.setValue(xmax,hight,zmax);
//         lineSPrite.addLine(this.tempBoundMin,this.tempBoundMax,color,color);
//         this.tempBoundMin.setValue(xmin,hight,zmax);
//         this.tempBoundMax.setValue(xmax,hight,zmax);
//         lineSPrite.addLine(this.tempBoundMin,this.tempBoundMax,color,color);
//     }



// }




// export class testPreCull extends Script3D{
//     ownerSprite:Sprite3D;
//     lineSprite:PixelLineSprite3D;
//     boundManager:ArchitectNodeManager;
//     constructor(){
//         super();
//         this.ownerSprite = <Sprite3D>this.owner;
//         this.lineSprite = new PixelLineSprite3D(30000);
       
//     }


//     onUpdate(){
//         let ori = (<Sprite3D>this.owner).transform.rotationEuler;
//         this.drawPreCull(this.boundManager.caculateRotateMap(ori.y)) ;
//     }

//     drawPreCull(arrayIndex:number){
//         this.lineSprite.clear();
//         let array = this.boundManager.preCullMap[arrayIndex];
//         for(var i = 0;i<array.length;i++){
//             let element = this.boundManager.nodeArray[ array[i]];
//             DynamicBondTest.drawOneOcreePlane(element.bounds,element._type,this.lineSprite,0.5);
//         }
//     }
// }