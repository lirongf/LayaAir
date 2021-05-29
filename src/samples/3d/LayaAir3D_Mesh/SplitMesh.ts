import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { PixelLineSprite3D } from "laya/d3/core/pixelLine/PixelLineSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Color } from "laya/d3/math/Color";
import { Matrix4x4 } from "laya/d3/math/Matrix4x4";
import { Vector3 } from "laya/d3/math/Vector3";
import { Vector2 } from "laya/d3/math/Vector2";
import { Vector4 } from "laya/d3/math/Vector4";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Shader3D } from "laya/d3/shader/Shader3D";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Button } from "laya/ui/Button";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { Tool } from "../common/Tool";
import { Mesh } from "../../../layaAir/laya/d3/resource/models/Mesh";
import { VertexDeclaration } from "../../../layaAir/laya/d3/graphics/VertexDeclaration";
import { VertexMesh } from "../../../layaAir/laya/d3/graphics/Vertex/VertexMesh";
import { AprilConstructive } from "../LayaApril/AprilConstructive";
/**
 * ...
 * @author
 */
export class SplitMesh {

	private sprite3D: Sprite3D;
	private lineSprite3D: Sprite3D;

	// constructor() {
	// 	Laya3D.init(0, 0);
	// 	Laya.stage.scaleMode = Stage.SCALE_FULL;
	// 	Laya.stage.screenMode = Stage.SCREEN_NONE;
	// 	Stat.show();

	// 	var scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()));

	// 	var camera: Camera = (<Camera>scene.addChild(new Camera(0, 0.1, 100)));
	// 	camera.transform.translate(new Vector3(0, 2, 5));
	// 	camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
	// 	camera.addComponent(CameraMoveScript);
	// 	camera.clearColor = new Vector4(0.2, 0.2, 0.2, 1.0);

	// 	var directionLight: DirectionLight = (<DirectionLight>scene.addChild(new DirectionLight()));
	// 	//设置平行光的方向
	// 	var mat: Matrix4x4 = directionLight.transform.worldMatrix;
	// 	mat.setForward(new Vector3(-1.0, -1.0, -1.0));
	// 	directionLight.transform.worldMatrix = mat;

	// 	this.sprite3D = (<Sprite3D>scene.addChild(new Sprite3D()));
	// 	this.lineSprite3D = (<Sprite3D>scene.addChild(new Sprite3D()));

		


	// 	// //测试3 
	// 	// //球体
	// 	var sphereMesh:Mesh=PrimitiveMesh.createSphere(0.5, 12, 12);
	// 	var sphere: MeshSprite3D = (<MeshSprite3D>this.sprite3D.addChild(new MeshSprite3D(sphereMesh)));
	// 	sphere.transform.position = new Vector3(0.0, 0.0, 0.0);
	// 	var sphereLineSprite3D: PixelLineSprite3D = (<PixelLineSprite3D>this.lineSprite3D.addChild(new PixelLineSprite3D(20000)));
	// 	Tool.linearModel(sphere, sphereLineSprite3D, Color.GREEN);
	// 	//正方体
	// 	var boxMesh1:Mesh=PrimitiveMesh.createBox(0.8, 0.8, 0.8);
	// 	var box1: MeshSprite3D = (<MeshSprite3D>this.sprite3D.addChild(new MeshSprite3D(boxMesh1)));
	// 	box1.transform.position = new Vector3(0, 0, 0);
	// 	var boxLineSprite3D: PixelLineSprite3D = (<PixelLineSprite3D>this.lineSprite3D.addChild(new PixelLineSprite3D(20000)));
	// 	Tool.linearModel(box1, boxLineSprite3D, Color.RED);
	// 	// nList[0]=[boxMesh1,box1];
	// 	// nList[1]=[sphereMesh,sphere];
	// 	// //测试3 end
	// 	this.getSplitMesh(box1,sphere);
	// 	//测试2
	// 	//圆柱体
	// 	// var cylinderMesh:Mesh=PrimitiveMesh.createCylinder(0.25, 1, 20);
	// 	// var cylinder: MeshSprite3D = (<MeshSprite3D>this.sprite3D.addChild(new MeshSprite3D(PrimitiveMesh.createCylinder(0.25, 1, 20))));
	// 	// cylinder.transform.position = new Vector3(0, 0, 0);
	// 	// var cylinderLineSprite3D: PixelLineSprite3D = (<PixelLineSprite3D>this.lineSprite3D.addChild(new PixelLineSprite3D(1000)));
	// 	// Tool.linearModel(cylinder, cylinderLineSprite3D, Color.GREEN);


	// 	// //正方体
	// 	// var boxMesh1:Mesh=PrimitiveMesh.createBox(0.8, 0.8, 0.8);
	// 	// var box1: MeshSprite3D = (<MeshSprite3D>this.sprite3D.addChild(new MeshSprite3D(boxMesh1)));
	// 	// box1.transform.position = new Vector3(0, 0, 0);
	// 	// //box1.transform.rotate(new Vector3(0, 0, 0), false, false);
	// 	// //为正方体添加像素线渲染精灵
	// 	// var boxLineSprite3D: PixelLineSprite3D = (<PixelLineSprite3D>this.lineSprite3D.addChild(new PixelLineSprite3D(100)));
	// 	// //设置像素线渲染精灵线模式
	// 	// Tool.linearModel(box1, boxLineSprite3D, Color.RED);

		
	// 	// nList[0]=[boxMesh1,box1];
	// 	// nList[1]=[cylinderMesh,cylinder];
	// 	// //测试2 end

	// 	//测试1
	// 	//正方体
	// 	// var boxMesh1:Mesh=PrimitiveMesh.createBox(0.5, 0.5, 0.5);
	// 	// var box1: MeshSprite3D = (<MeshSprite3D>this.sprite3D.addChild(new MeshSprite3D(boxMesh1)));
	// 	// box1.transform.position = new Vector3(1.3, 1.3, 1.3);
	// 	// //box1.transform.rotate(new Vector3(0, 0, 0), false, false);
	// 	// //为正方体添加像素线渲染精灵
	// 	// var boxLineSprite3D: PixelLineSprite3D = (<PixelLineSprite3D>this.lineSprite3D.addChild(new PixelLineSprite3D(100)));
	// 	// //设置像素线渲染精灵线模式
	// 	// Tool.linearModel(box1, boxLineSprite3D, Color.GREEN);

	// 	// var boxMesh2:Mesh=PrimitiveMesh.createBox(0.5, 0.5, 0.5);
	// 	// var box2: MeshSprite3D = (<MeshSprite3D>this.sprite3D.addChild(new MeshSprite3D(boxMesh2)));
	// 	// box2.transform.position = new Vector3(1, 1, 1);
	// 	// //box2.transform.rotate(new Vector3(0, 0, 0), false, false);
	// 	// //为正方体添加像素线渲染精灵
	// 	// var boxLineSprite3D1: PixelLineSprite3D = (<PixelLineSprite3D>this.lineSprite3D.addChild(new PixelLineSprite3D(100)));
	// 	// //设置像素线渲染精灵线模式
	// 	// Tool.linearModel(box2, boxLineSprite3D1, Color.RED);
	// 	// nList[0]=[boxMesh1,box1];
	// 	// nList[1]=[boxMesh2,box2];
	// 	//测试1 end
	// 	//组织缓冲区数据
	// // 	var a:number = 10;
	// // 	var b:number =20;
	// // 	var c:number = a|b;
	// // 	var d:number = b|a;

	// // 	console.log(a);
	// // 	console.log(b);
	// // 	console.log(c);
	// // 	console.log(d);

	

	
	// }

	constructor() {
		//初始化引擎
		Laya3D.init(0, 0);
		Stat.show();
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		//加载场景
		Scene3D.load("res/LayaScene_New Scene/Conventional/New Scene.ls", Handler.create(this, function (scene: Scene3D): void {
			(<Scene3D>Laya.stage.addChild(scene));

			//获取场景中的相机
			var camera: Camera = (<Camera>scene.getChildByName("Camera"));
			//加入摄像机移动控制脚本
			camera.addComponent(CameraMoveScript);

			
			this.sprite3D = (<Sprite3D>scene.addChild(new Sprite3D()));
		 	this.lineSprite3D = (<Sprite3D>scene.addChild(new Sprite3D()));
			 

			 var meshSprite0 = scene.getChildAt(0);
			 var sphereLineSprite3D: PixelLineSprite3D = (<PixelLineSprite3D>this.lineSprite3D.addChild(new PixelLineSprite3D(20000)));
		     Tool.linearModel(<Sprite3D>meshSprite0, sphereLineSprite3D, Color.GREEN);
			

			 var meshSprite1 = scene.getChildAt(1);
			 var boxLineSprite3D: PixelLineSprite3D = (<PixelLineSprite3D>this.lineSprite3D.addChild(new PixelLineSprite3D(20000)));
			 Tool.linearModel(<Sprite3D>meshSprite1, boxLineSprite3D, Color.RED);

			 this.getSplitMesh(meshSprite0,meshSprite1);
			
		}));
	}
	

	private curStateIndex: number = 0;


	getSplitMesh(meshSprite0:MeshSprite3D,meshsprite1:MeshSprite3D){
		var nList=[[],[]];
		nList[0]=[meshSprite0.meshFilter.sharedMesh,meshSprite0];
		nList[1]=[meshsprite1.meshFilter.sharedMesh,meshsprite1];
		var mat1 = [1,0,0,0,
			0,1,0,0,
			0,0,1,0,
			0,0,0,1];

		

		var nVB1:number[][]=[],nVB2:number[][]=[],nVI1:number[]=[],nVI2:number[]=[];
		this.GetBuf(nList[0][0],nList[0][1],nVB1,nVI1);
		this.GetBuf(nList[1][0],nList[1][1],nVB2,nVI2);

	
		
		var BC:AprilConstructive = new AprilConstructive();
		//nVB的数据是
		var nPolyMap = BC.AprilGetOutSub(nVB1,nVI1,nVB2,nVI2);
		//var nPolyMap = BC.AprilGeoSubtract(nVB2,nVI2,nVB1,nVI1);
		//var nPolyMap = BC.AprilGeoIntersect(nVB1,nVI1,nVB2,nVI2);
		//var nPolyMap = BC.AprilGeoUnion(nVB1,nVI1,nVB2,nVI2);
		//var nPolyMap = BC.Test1();
		var colorAy = [Color.GREEN,Color.RED,Color.BLUE,Color.YELLOW];
		//正方体
		for (let key of nPolyMap.keys()) {
			var nVBBI =  nPolyMap.get(key);
			console.log(nVBBI);
			if(nVBBI.ver==null || nVBBI.ver.length<=0)
				continue;

			console.log(nVBBI.ver);
			console.log(nVBBI.index);
			
			var vertexDeclaration: VertexDeclaration = VertexMesh.getVertexDeclaration("POSITION,NORMAL,UV");
			var vertices: Float32Array = new Float32Array(nVBBI.ver);
			var indices: Uint16Array = new Uint16Array(nVBBI.index);
			//@ts-ignore
			var nCustomObj:Mesh =PrimitiveMesh._createMesh(vertexDeclaration,vertices,indices);
	        var boxTemp: MeshSprite3D = (<MeshSprite3D>this.sprite3D.addChild(new MeshSprite3D(nCustomObj)));
			//boxTemp.transform.position = new Vector3(-5, 0, 0);
			boxTemp.transform.position = new Vector3(-5-key*2.0, 0, 0);
	        //box2.transform.rotate(new Vector3(0,0, 0), false, false);
	        //box2.transform.worldMatrix.elements
			//为正方体添加像素线渲染精灵
	        var boxLineSprite3D2: PixelLineSprite3D = (<PixelLineSprite3D>this.lineSprite3D.addChild(new PixelLineSprite3D(1000000)));
	        //设置像素线渲染精灵线模式
	        Tool.linearModel(boxTemp, boxLineSprite3D2,colorAy[key]);

		}

		this.lineSprite3D.active = false;
		this.loadUI();
		
	}


	GetBuf(pMesh:Mesh,mBox:MeshSprite3D,outVer:number[][],outIndex:number[]) 
	{
		var pos:Vector3[] = [];
		var nor:Vector3[]= [];
		var uv:Vector2[]= [];
		var indexAr;
		pMesh.getPositions(pos);
		pMesh.getNormals(nor);
		pMesh.getUVs(uv);
		indexAr = pMesh.getIndices();
		for(var i=0;i<pos.length; ++i)
		{
			var TempPos:Vector3 = new Vector3();
			Vector3.transformCoordinate(pos[i],mBox.transform.worldMatrix,TempPos);
			var numAr:number[]=[TempPos.x,TempPos.y,TempPos.z,
			nor[i].x,nor[i].y,nor[i].z,
			uv[i].x,uv[i].y];
			outVer.push(numAr);
		}

		//原始数据过来是顺时针的，更改成逆时针
		for(var i=0;i<indexAr.length; i+=3)
		{
			outIndex.push(indexAr[i]);				
			outIndex.push(indexAr[i+1]);
			outIndex.push(indexAr[i+2]);
		}
			
	}

	private loadUI(): void {

		Laya.loader.load(["res/threeDimen/ui/button.png"], Handler.create(this, function (): void {

			var changeActionButton: Button = (<Button>Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "正常模式")));
			changeActionButton.size(160, 40);
			changeActionButton.labelBold = true;
			changeActionButton.labelSize = 30;
			changeActionButton.sizeGrid = "4,4,4,4";
			changeActionButton.scale(Browser.pixelRatio, Browser.pixelRatio);
			changeActionButton.pos(Laya.stage.width / 2 - changeActionButton.width * Browser.pixelRatio / 2, Laya.stage.height - 100 * Browser.pixelRatio);
			changeActionButton.on(Event.CLICK, this, function (): void {
				if (++this.curStateIndex % 2 == 1) {
					this.sprite3D.active = false;
					this.lineSprite3D.active = true;
					changeActionButton.label = "网格模式";
				} else {
					this.sprite3D.active = true;
					this.lineSprite3D.active = true;
					changeActionButton.label = "正常模式";
				}
			});
		}));
	}
}

