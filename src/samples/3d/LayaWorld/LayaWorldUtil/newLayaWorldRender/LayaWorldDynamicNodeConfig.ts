import { Camera } from "laya/d3/core/Camera";
import { BoundBox } from "laya/d3/math/BoundBox";
import { BoundFrustum } from "laya/d3/math/BoundFrustum";
import { Vector3 } from "laya/d3/math/Vector3";
import { DynamicPreNode } from "./RenderableSprite/DynamicPreNode";
import { DynamicPreNodeManager } from "./RenderableSprite/DynamicPreNodeManager";






/**
 * 
 */
export class LayaWorldDynamicNodeConfig {
    static _sqrtTWO = 0.707106;
    /** LOD0 Cube数据的大小 */
    static miniCubeSize:number = 0.1;
    /** 微雕Cube的大小 */
    static cellCubeSize:number = 0.01;
    /** Caemra 视距，调整视距可调整动态预处理节点的大小*/
    static visibilityRange:number = 300;
    /** 单元大小  这里需要合服务器那边一致 */
    static unitSize:number = 5;
    /** 动态预处理节点的大小,可调整 */
    static architectSize:number = 50;
    //小的动态预处理节点的大小
    static secendarchitectLOD0Size = 10;
    
    /** LOD层级数 */
    static LODNums:number = 4;
    /** LOD分级距离  分为三组 */
    static LODDistance:number[] = [80,200];
    /**一级节点距离分组 */
    static LOD0DIstanec:number =50;
    /** 主角生成位置 */
    static initialPosition = new Vector3();
    /** */
    static nodeExtend:number;
    /**动态预处理节点数量 */
    static octreeNodeSize:number;
    //节点管理
    static architectNodemanager:DynamicPreNodeManager;


    //TODO:
    /** 编辑距离 */
    static editRange:number = 15;
    /**询问服务器要拿的LOD数据*/
    static LODLoadFlag:number[] = [];

    static cameraFieldOfView:number = 60;

    static nearPlane:number = 0.3;

    static camera:Camera;
    //预处理角度步进
    static cullStep:number = 2;

    //= new ArchitectNodeManager(new Vector3());

    /**
     * 初始化所有的
     */
    static initArchitecNode(position:Vector3,camera:Camera){
        var halfSize = LayaWorldDynamicNodeConfig.architectSize/2;
        //初始化位置
        LayaWorldDynamicNodeConfig.initialPosition.x = position.x-=position.x%LayaWorldDynamicNodeConfig.unitSize;
        LayaWorldDynamicNodeConfig.initialPosition.z = position.z-=position.z%LayaWorldDynamicNodeConfig.unitSize;
        //创建管理类
        LayaWorldDynamicNodeConfig.architectNodemanager = new DynamicPreNodeManager(LayaWorldDynamicNodeConfig.initialPosition);
        //Node总长，计算了一个方形的Node数据形状
        let rectNodeNums = LayaWorldDynamicNodeConfig.nodeExtend = Math.ceil( LayaWorldDynamicNodeConfig.visibilityRange*2*LayaWorldDynamicNodeConfig._sqrtTWO/LayaWorldDynamicNodeConfig.architectSize/2)-1;
        for(let x=-rectNodeNums,xmax = rectNodeNums;x<=xmax;x++){
            for(let z = -rectNodeNums,zmax = rectNodeNums;z<zmax;z++){
                var boundBox = new BoundBox(new Vector3(x*LayaWorldDynamicNodeConfig.architectSize-halfSize,-halfSize,z*LayaWorldDynamicNodeConfig.architectSize-halfSize),new Vector3(x*LayaWorldDynamicNodeConfig.architectSize+halfSize,halfSize,z*LayaWorldDynamicNodeConfig.architectSize+halfSize));
                var node:DynamicPreNode =  new DynamicPreNode(new Vector3(x,0,z),boundBox,LayaWorldDynamicNodeConfig.architectSize/2);
                node.manager = LayaWorldDynamicNodeConfig.architectNodemanager;
                LayaWorldDynamicNodeConfig.architectNodemanager.addNode(new Vector3(x,0,z),node);
            }
        }
        LayaWorldDynamicNodeConfig.initCull(DynamicPreNodeManager.dynamicPreNodeMap,camera);
    }

    /**
     * 预处理节点裁剪
     * @param nodeArray 
     * @param camera 
     */
    static initCull(nodeArray:Array<DynamicPreNode>,camera:Camera){
        //let testCamera = <Camera>camera.clone();
        let testCamera = camera;
        console.log(testCamera.fieldOfView);
        testCamera.transform.position = new Vector3(0,0,0);
        var rotate = testCamera.transform.rotationEuler = new Vector3(0,0,-0);
        let fru:BoundFrustum;
        let preMap = DynamicPreNodeManager.preCullMap;
        //360度
        for(var i:number = 0;i<=360;i+=LayaWorldDynamicNodeConfig.cullStep){
            let map:Array<number> = preMap[(i)%360] = [];//??这里想要得到正确的还得转90  为啥
            rotate.y = i;
            testCamera.transform.rotationEuler = rotate;
            fru = testCamera.boundFrustum;
            for(let j = 0,n = nodeArray.length;j<n;j++){
                if(fru.intersects( nodeArray[j].bounds))
                map.push(j);
            }
        }
    }

    /**
     * 预处理节点LOD
     * @param distance 
     * @returns 
     */
    static caculateNodeType(distance:number):number{
        for(var i = 0,n = LayaWorldDynamicNodeConfig.LODDistance.length;i<n;i++){
            if(distance<LayaWorldDynamicNodeConfig.LODDistance[i]){
                return i;
            }
        }
        return LayaWorldDynamicNodeConfig.LODDistance.length;
    }
}