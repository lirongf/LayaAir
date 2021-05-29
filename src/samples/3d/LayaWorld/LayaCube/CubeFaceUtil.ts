import { IndexBuffer3D } from "laya/d3/graphics/IndexBuffer3D";
import { IndexFormat } from "laya/d3/graphics/IndexFormat";
import { VertexMesh } from "laya/d3/graphics/Vertex/VertexMesh";
import { VertexBuffer3D } from "laya/d3/graphics/VertexBuffer3D";
import { VertexDeclaration } from "laya/d3/graphics/VertexDeclaration";
import { VertexElement } from "laya/d3/graphics/VertexElement";
import { Vector3 } from "laya/d3/math/Vector3";
import { Vector4 } from "laya/d3/math/Vector4";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { SubMesh } from "laya/d3/resource/models/SubMesh";
import { LayaGL } from "laya/layagl/LayaGL";
import { CubeBox4, CubeBox4features } from "./CubeBox4";
import { FaceManager } from "./FaceManager";
export enum FaceNormal {
    front = 0,
    right = 1,
    top = 2,
    left = 3,
    bottom = 4,
    back = 5,
}
export class CubeFaceUtil{
    static templowHight:Array<number> = new Array(2);
    
    
    static upDownDelty = 16
    static leftRightDelty = 1;
    static frontBackDelty = 4;


    //预先计算八位数256所有的面数情况
    static kindsOfFace:Array<Array<number>> = [];
    //updow的高低位的位数对应左右位的位数  服务Cube64
    //在updow数据中的位置对应其他方向的位置
    static transleftRightArray:Array<number> = new Array(64);
    static transfrontBackArray:Array<number> = new Array(64);
    //在其他方向的位置对应到UpDown的位置
    static transleftRight2Updown:Array<number> = new Array(64);
    static transfrontBack2Updown:Array<number> = new Array(64);

    /**
     * 必须调用初始化
     */
    static __init__(){
        CubeFaceUtil.pre256kindofFace();
        CubeFaceUtil.preTransData();
        CubeFaceUtil.createDeclatation();
    }
    
    /**
     * 准备是否有面的数据，为了节省是否有面的查询
     */
    private static pre256kindofFace(){
        for(let i = 0;i<256;i++){
            let faceInfoArray:Array<number> = [];
            CubeFaceUtil.kindsOfFace.push(faceInfoArray);
            if(i&1) faceInfoArray.push(0);
            if(i&2) faceInfoArray.push(1);
            if(i&4) faceInfoArray.push(2);
            if(i&8) faceInfoArray.push(3);
            if(i&16) faceInfoArray.push(4);
            if(i&32) faceInfoArray.push(5);
            if(i&64) faceInfoArray.push(6);
            if(i&128)  faceInfoArray.push(7);
        }
    }

    private static preTransData(){
        for(let z = 0;z<CubeBox4.CUBESIZE;z++){
            for(let y = 0;y<CubeBox4.CUBESIZE;y++){
                for(let x = 0;x<CubeBox4.CUBESIZE;x++){
                    //updow
         
                    let updownIndex = x+(y<<4)+(z<<2);
                    let leftrightIndex = z+(y<<2)+(x<<4);
                    let frontBackIndex = x+(y<<2)+(z<<4);
                    CubeFaceUtil.transleftRightArray[updownIndex] = leftrightIndex;
                    CubeFaceUtil.transfrontBackArray[updownIndex] = frontBackIndex;
                }
            }
        }
        for(let i = 0;i<64;i++){
            CubeFaceUtil.transleftRight2Updown[i] = CubeFaceUtil.transleftRightArray.indexOf(i);
            CubeFaceUtil.transfrontBack2Updown[i] = CubeFaceUtil.transfrontBackArray.indexOf(i);
        }
    }

    private static updownDataTransFrontBack(lowHight:Array<number>):Array<number>{
        let low = lowHight[0];
        let hight = lowHight[1];
        let newDown = 0;
        let newHight = 0;
        for(let i = 0;i<32;i++){
            let testnums = 1<<i;
            if(testnums&low){
                 let wei = CubeFaceUtil.transfrontBackArray[i];
                 if(wei<32) newDown |= (1<<wei);
                 else newHight |= (1<<(wei-32));
            }
            if(testnums&hight){
                let wei = CubeFaceUtil.transfrontBackArray[i+32];
                if(wei<32) newDown |= (1<<wei);
                 else newHight |= (1<<(wei-32));
            }
        }
        lowHight[0] = newDown;
        lowHight[1] = newHight;
        return lowHight;
    }

    private static updownDataTransLeftRight(lowHight:Array<number>):Array<number>{
        let low = lowHight[0];
        let hight = lowHight[1];
        let newDown = 0;
        let newHight = 0;
        for(let i = 0;i<32;i++){
            let testnums = 1<<i;
            if(testnums&low){
                 let wei = CubeFaceUtil.transleftRightArray[i];
                 if(wei<32) newDown |= (1<<wei);
                 else newHight |= (1<<(wei-32));
            }
            if(testnums&hight){
                let wei = CubeFaceUtil.transleftRightArray[i+32];
                if(wei<32) newDown |= (1<<wei);
                 else newHight |= (1<<(wei-32));
            }
        }
        lowHight[0] = newDown;
        lowHight[1] = newHight;
        return lowHight;
    }
    
    private static createFaceByLayerData(layer0:number,layer1:number,offset:number,layerNumse:number,dir:number,faceManager:FaceManager){
       
        let lay0 = layer0&0xFF;
        let lay1 = layer1&0xFF;
        let step = 0;
        let hasFaceArray =  CubeFaceUtil.kindsOfFace[lay0^lay1];//这里取位标记的异或
        let dir0:number;
        let dir1:number;
        switch(dir){
            case 0://updown
                    dir0 = 4;//down
                    dir1 = 2;//up
                    break;
                case 1://back front
                    dir0 = 5;//back
                    dir1 = 0;//front
                    break;
                case 2://left right
                    dir0 = 3;//left
                    dir1 = 1;//right
                    break;
            }
        for(let i = 0,n = hasFaceArray.length;i<n;i++){
                let faceIndex = hasFaceArray[i];
                if(lay0&(1<<faceIndex)){
                    if(layerNumse==0)
                        continue;
                    faceManager.addFaceIndex(dir1,offset+faceIndex);
                }
                else{
                    if(layerNumse==4)
                    continue;
                    //会加一层
                    faceManager.addFaceIndex(dir0,offset+16+faceIndex);
                }
        }
        //后八位
        offset+=8;
        lay0 = (layer0>>>8)&0xFF;
        lay1 = (layer1>>>8)&0xFF;
        step = 1;
        hasFaceArray =  CubeFaceUtil.kindsOfFace[lay0^lay1];
        for(let i = 0,n = hasFaceArray.length;i<n;i++){
            let faceIndex = hasFaceArray[i];
            if(lay0&(1<<faceIndex)){
                if(layerNumse==0)
                    continue;
                faceManager.addFaceIndex(dir1,offset+faceIndex);
            }
            else{
                if(layerNumse==4)
                continue;
                //会加一层
                faceManager.addFaceIndex(dir0,offset+16+faceIndex);
            }
        }
    }
    

    /**
     * 根据数据来获得Cubebox4里面的面
     * @param box4 
     * @param front 
     * @param back 
     * @param up 
     * @param down 
     * @param left 
     * @param right 
     * @returns 
     */
    static CreateBox4Face(faceManager:FaceManager,box4:CubeBox4,front:CubeBox4,back:CubeBox4,up:CubeBox4,down:CubeBox4,left:CubeBox4,right:CubeBox4):FaceManager{
        if((front)&&front.isFaceFull()&&(back)&&back.isFaceFull()&&(up)&&up.isFaceFull()&&(down)&&down.isFaceFull()&&(left)&&left.isFaceFull()&&(right)&&right.isFaceFull())
            return ;
        let layer:Array<number> = [];
        let low = box4._dataLow;
        let hight = box4._dataHight;
        //四层数据组织好 updown
        layer[0] = down?((down._dataHight>>>16)):0;
        layer[1] = (low&0xFFFF);
        layer[2] = (low>>>16);
        layer[3] = (hight&0xFFFF);
        layer[4] = (hight>>>16);
        layer[5] = up?(up._dataLow&0xFFFF):0;
        //面数据生成
        for(let i = 0,offset = -16,n=5;i<n;i++,offset+=16){
            this.createFaceByLayerData(layer[i],layer[i+1],offset,i,0,faceManager);    
        }
        //四层数据组织好 leftright
        if(!left)
            layer[0] = 0;
        else{
            CubeFaceUtil.templowHight[0] = left._dataLow;
            CubeFaceUtil.templowHight[1] = left._dataHight;
            let ary = CubeFaceUtil.updownDataTransLeftRight(CubeFaceUtil.templowHight);
            layer[0] = (ary[1]>>>16);
        }
        if(!right)
            layer[5] = 0;
        else{
            CubeFaceUtil.templowHight[0] = right._dataLow;
            CubeFaceUtil.templowHight[1] = right._dataHight;
            let ary = CubeFaceUtil.updownDataTransLeftRight(CubeFaceUtil.templowHight);
            layer[5] = ary[0]&0xFFFF;
        }
        CubeFaceUtil.templowHight[0] = box4._dataLow;
        CubeFaceUtil.templowHight[1] = box4._dataHight;
        let ary = CubeFaceUtil.updownDataTransLeftRight(CubeFaceUtil.templowHight);
        layer[1] = (ary[0]&0xFFFF);
        layer[2] = (ary[0]>>>16);
        layer[3] = (ary[1]&0xFFFF);
        layer[4] = (ary[1]>>>16);
        for(let i = 0,offset = -16,n=5;i<n;i++,offset+=16){
            this.createFaceByLayerData(layer[i],layer[i+1],offset,i,2,faceManager);    
        }
        //四层数据组织好 Frontback
        if(!back)
            layer[0] = 0;
        else{
            CubeFaceUtil.templowHight[0] = back._dataLow;
            CubeFaceUtil.templowHight[1] = back._dataHight;
            let ary = CubeFaceUtil.updownDataTransFrontBack(CubeFaceUtil.templowHight);
            layer[0] = (ary[1]>>>16);
        }
        if(!front)
            layer[5] = 0;
        else{
            CubeFaceUtil.templowHight[0] = front._dataLow;
            CubeFaceUtil.templowHight[1] = front._dataHight;
            let ary = CubeFaceUtil.updownDataTransFrontBack(CubeFaceUtil.templowHight);
            layer[5] = ary[0]&0xFFFF;
        }
        CubeFaceUtil.templowHight[0] = box4._dataLow;
        CubeFaceUtil.templowHight[1] = box4._dataHight;
        ary = CubeFaceUtil.updownDataTransFrontBack(CubeFaceUtil.templowHight);
        layer[1] = (ary[0]&0xFFFF);
        layer[2] = (ary[0]>>>16);
        layer[3] = (ary[1]&0xFFFF);
        layer[4] = (ary[1]>>>16);
        for(let i = 0,offset = -16,n=5;i<n;i++,offset+=16){
            this.createFaceByLayerData(layer[i],layer[i+1],offset,i,1,faceManager);    
        }
        return faceManager;
    }
    





    static aoFactor: number = 0.7;

    static frontNormal: Vector3;
    static rightNormal: Vector3;
    static topNormal: Vector3;
    static leftNormal: Vector3;
    static bottomNormal: Vector3;
    static backNormal: Vector3;

    static fronttangent: Vector4;
    static righttangent: Vector4;
    static toptangent: Vector4;
    static lefttangent: Vector4;
    static bottomtangent: Vector4;
    static backtangent: Vector4;
    //每个顶点 float 数据数量
    static VertexFloatStride: number;
    // 每个面 float 数据数量
    static FaceFloatStride: number;
    //vb declaration
     static vertexDeclaration: VertexDeclaration;
     //偏移
     static positionPos: number;
     static normalPos: number;
     static colorPos: number;
     static uvPos: number;
     static uv1Pos: number;
     static tangentPos: number;
     static uvWorldPos:number;

     static creatModelScalse:number = 0.1;
    private static createDeclatation(){
        CubeFaceUtil.frontNormal = new Vector3(0, 0, 1);
        CubeFaceUtil.rightNormal = new Vector3(1, 0, 0);
        CubeFaceUtil.topNormal = new Vector3(0, 1, 0);
        CubeFaceUtil.leftNormal = new Vector3(-1, 0, 0);
        CubeFaceUtil.bottomNormal = new Vector3(0, -1, 0);
        CubeFaceUtil.backNormal = new Vector3(0, 0, -1);

        CubeFaceUtil.fronttangent = new Vector4(1, 0, 0, -1);
        CubeFaceUtil.righttangent = new Vector4(0, 0, -1, -1);
        CubeFaceUtil.toptangent = new Vector4(1, 0, 0, 1);
        CubeFaceUtil.lefttangent = new Vector4(0, 0, 1, -1);
        CubeFaceUtil.bottomtangent = new Vector4(1, 0, 0, 1);
        CubeFaceUtil.backtangent = new Vector4(-1, 0, 0, -1);
        //CubeFaceUtil.vertexDeclaration = VertexMesh.getVertexDeclaration("POSITION,NORMAL,COLOR,UV,UV1,TANGENT,BLENDWEIGHT");
        CubeFaceUtil.vertexDeclaration = VertexMesh.getVertexDeclaration("POSITION,NORMAL,COLOR,UV");
        //@ts-ignore
        let positionAttr: VertexElement = CubeFaceUtil.vertexDeclaration.getVertexElementByUsage(VertexMesh.MESH_POSITION0);
        //@ts-ignore
        let normalAttr: VertexElement = CubeFaceUtil.vertexDeclaration.getVertexElementByUsage(VertexMesh.MESH_NORMAL0);
        //@ts-ignore
        let colorAttr: VertexElement = CubeFaceUtil.vertexDeclaration.getVertexElementByUsage(VertexMesh.MESH_COLOR0);
        //@ts-ignore 
        let uvAttr: VertexElement = CubeFaceUtil.vertexDeclaration.getVertexElementByUsage(VertexMesh.MESH_TEXTURECOORDINATE0);
        //@ts-ignore
        let uv1Attr: VertexElement = CubeFaceUtil.vertexDeclaration.getVertexElementByUsage(VertexMesh.MESH_TEXTURECOORDINATE1);
        //@ts-ignore
        let tangentAttr: VertexElement = CubeFaceUtil.vertexDeclaration.getVertexElementByUsage(VertexMesh.MESH_TANGENT0);
        //@ts-ignore
        let uvWorldPosAttr:VertexElement = CubeFaceUtil.vertexDeclaration.getVertexElementByUsage(VertexMesh.MESH_BLENDWEIGHT0);

        positionAttr && (CubeFaceUtil.positionPos = positionAttr.offset / 4);
        normalAttr && (CubeFaceUtil.normalPos = normalAttr.offset / 4);
        colorAttr && (CubeFaceUtil.colorPos = colorAttr.offset / 4);
        uvAttr && (CubeFaceUtil.uvPos = uvAttr.offset / 4);
        uv1Attr && (CubeFaceUtil.uv1Pos = uv1Attr.offset / 4);
        tangentAttr && (CubeFaceUtil.tangentPos = tangentAttr.offset / 4);
        uvWorldPosAttr && (CubeFaceUtil.uvWorldPos = uvWorldPosAttr.offset/4);

    }


    /**
     * 传入面数据，生成顶点信息
     * 将所有的面都按照Float32Array分开了
     * @param faceData 
     */
    static CreateVertexData(faceData:any,oriPosition:Vector3,cubeSize:number = 0.1):any{
        //faceData 有六个数据 分别是六个方向的数据
        //frongArray
        let faceArray:Array<Float32Array> = [];
        faceArray.push(CubeFaceUtil.createDirFaceArray(0,faceData[0],oriPosition,cubeSize));
        faceArray.push(CubeFaceUtil.createDirFaceArray(1,faceData[1],oriPosition,cubeSize));
        faceArray.push(CubeFaceUtil.createDirFaceArray(2,faceData[2],oriPosition,cubeSize));
        faceArray.push(CubeFaceUtil.createDirFaceArray(3,faceData[3],oriPosition,cubeSize));
        faceArray.push(CubeFaceUtil.createDirFaceArray(4,faceData[4],oriPosition,cubeSize));
        faceArray.push(CubeFaceUtil.createDirFaceArray(5,faceData[5],oriPosition,cubeSize));
        return faceArray;
      
    }

    private static createDirFaceArray(dir:number,faceData:any,oriPosition:Vector3,cubesize:number){
        if(faceData==null)
        return new Float32Array();
        let startPos:Array<Vector3> = faceData["startPos"];
        let hightWidth:Array<number> = faceData["heightWidth"];
        let property:Array<number> = faceData["property"];
        let faceCount = startPos.length;
        // 每个面 vertex 数量
        let faceVertexCount = 4;
          // 每个面 vb float数据数量
        let faceStride = CubeFaceUtil.vertexDeclaration.vertexStride/4*faceVertexCount;
        let vertexarray: Float32Array = new Float32Array(faceCount * faceStride);
        let propertylength = CubeBox4features.length;
        let tempproperty = new Array(propertylength);
        let vertexOffset:number = 0;
        for(let i = 0;i<faceCount;i++){
            let of = i*2;
            let oe = i*propertylength;
            for(let m = 0;m<propertylength;m++)
                tempproperty[m] = property[oe+m];
            CubeFaceUtil.parseOneFace(dir,vertexarray,startPos[i],oriPosition,hightWidth[of],hightWidth[of+1],tempproperty,vertexOffset,cubesize);
            vertexOffset+=faceStride;
        }
        return vertexarray
    }

    private static parseOneFace(dir:number,vertexData:Float32Array,ori:Vector3,startPos:Vector3,weights:number,heights:number,propertyArray:Array<number>,offset:number,cubesize:number){
        let x =ori.x*cubesize+startPos.x;
        let y =ori.y*cubesize+startPos.y;
        let z =ori.z*cubesize+startPos.z;
        let width = weights*cubesize;
        let height = heights*cubesize;
        //let normal = CubeFaceUtil.getNormal(dir);
        let textureID = 0;//._textureID;//就当现在都是0//TODO
        let aoValue = 0;//._aoValue;//当现在并没有ao//TODO
        let color = propertyArray[0];//Color
        CubeFaceUtil.parseOneFaceData(x,y,z,width,height,dir,color,aoValue,vertexData,offset,cubesize);
    }
    static getNormal(faceIndex: FaceNormal): Vector3 {
        switch (faceIndex) {
            case FaceNormal.front:
                return CubeFaceUtil.frontNormal;
            case FaceNormal.right:
                return CubeFaceUtil.rightNormal;
            case FaceNormal.top:
                return CubeFaceUtil.topNormal;
            case FaceNormal.left:
                return CubeFaceUtil.leftNormal;
            case FaceNormal.bottom:
                return CubeFaceUtil.bottomNormal;
            case FaceNormal.back:
                return CubeFaceUtil.backNormal;
            default:
                break;
        }
    }

    //塞入一个面的数据
    private static parseOneFaceData(x:number, y:number, z:number, chang:number, kuan:number, faceindex:number, color:number, aoValue:number, vertexarray:Float32Array, vertexarrayIndex:number,cubesize:number = 0.1):void {
        var vertexnormalx:number;
        var vertexnormaly:number;
        var vertexnormalz:number;
        var vertexpos1x:number;
        var vertexpos1y:number;
        var vertexpos1z:number;
        var vertexpos2x:number;
        var vertexpos2y:number;
        var vertexpos2z:number;
        var vertexpos3x:number;
        var vertexpos3y:number;
        var vertexpos3z:number;
        var vertexpos4x:number;
        var vertexpos4y:number;
        var vertexpos4z:number;
        var uv0x:number;
        var uv0y:number;
        var uv1x:number;
        var uv1y:number;
        var uv2x:number;
        var uv2y:number;
        var uv3x:number;
        var uv3y:number;
        
        var aopoint1:number = Math.pow(CubeFaceUtil.aoFactor, ((aoValue & (128 + 64)) >> 6));
        var aopoint2:number = Math.pow(CubeFaceUtil.aoFactor, ((aoValue & (32 + 16)) >> 4));
        var aopoint3:number = Math.pow(CubeFaceUtil.aoFactor, ((aoValue & (8 + 4)) >> 2));
        var aopoint4:number = Math.pow(CubeFaceUtil.aoFactor, (aoValue & (2 + 1)));
        var r:number = (color & 0xff) / 255;
        var g:number = ((color & 0xff00) >> 8) / 255;
        var b:number = ((color & 0xff0000) >> 16) / 255;
        switch (faceindex) {
            case 0:
                vertexnormalx = 0.0;
                vertexnormaly = 0.0;
                vertexnormalz = 1.0;

                vertexpos1x = x;
                vertexpos1y = y;
                vertexpos1z = z + cubesize;
                vertexpos2x = x+chang;
                vertexpos2y = y;
                vertexpos2z = z + cubesize;
                vertexpos3x = x+chang;
                vertexpos3y = y+kuan;
                vertexpos3z = z + cubesize;
                vertexpos4x = x;
                vertexpos4y = y+kuan;
                vertexpos4z = z + cubesize;

                uv0x = 0.0;
                uv0y = kuan;
                uv1x = chang;
                uv1y = kuan;
                uv2x = chang;
                uv2y = 0.0;
                uv3x = 0.0;
                uv3y = 0.0;


                break;
            case 1:
                vertexnormalx = 1.0;
                vertexnormaly = 0.0;
                vertexnormalz = 0.0;
             
                vertexpos1x = x+cubesize;
                vertexpos1y = y;
                vertexpos1z = z;
                vertexpos2x = x + cubesize;
                vertexpos2y = y+kuan;
                vertexpos2z = z;
                vertexpos3x = x + cubesize;
                vertexpos3y = y+kuan;
                vertexpos3z = z+chang;
                vertexpos4x = x + cubesize;
                vertexpos4y = y;
                vertexpos4z = z+chang;
                uv0x = chang;
                uv0y = kuan;
                uv1x = chang;
                uv1y = 0.0;
                uv2x = 0.0;
                uv2y = 0.0;
                uv3x = 0.0;
                uv3y = kuan;
                break;
            case 2:
                vertexnormalx = 0.0;
                vertexnormaly = 1.0;
                vertexnormalz = 0.0;
     
                vertexpos1x = x;
                vertexpos1y = y + cubesize;
                vertexpos1z = z;

                vertexpos2x = x;
                vertexpos2y = y + cubesize;
                vertexpos2z = z+kuan;
                vertexpos3x = x+chang;
                vertexpos3y = y + cubesize;
                vertexpos3z = z+kuan;
                vertexpos4x = x+chang;
                vertexpos4y = y + cubesize;
                vertexpos4z = z;
                uv0x = 0.0;
                uv0y = kuan;
                uv1x = 0.0;
                uv1y = 0.0;
                uv2x = chang;
                uv2y = 0.0;
                uv3x = chang;
                uv3y = kuan;
                break;
            case 3:
                vertexnormalx = -1.0;
                vertexnormaly = 0.0;
                vertexnormalz = 0.0;
             
                vertexpos1x = x;
                vertexpos1y = y;
                vertexpos1z = z;

                vertexpos2x = x;
                vertexpos2y = y;
                vertexpos2z = z+chang;
                vertexpos3x = x;
                vertexpos3y = y+kuan;
                vertexpos3z = z+chang;
                vertexpos4x = x;
                vertexpos4y = y+kuan;
                vertexpos4z = z;
                uv0x = 0.0;
                uv0y = kuan;
                uv1x = chang;
                uv1y = kuan;
                uv2x = chang;
                uv2y = 0.0;
                uv3x = 0.0;
                uv3y = 0.0;
                break;
            case 4:
                vertexnormalx = 0.0;
                vertexnormaly = -1.0;
                vertexnormalz = 0.0;

                vertexpos1x = x;
                vertexpos1y = y;
                vertexpos1z = z;
                vertexpos2x = x+chang;
                vertexpos2y = y;
                vertexpos2z = z;
                vertexpos3x = x+chang;
                vertexpos3y = y;
                vertexpos3z = z+kuan;
                vertexpos4x = x;
                vertexpos4y = y;
                vertexpos4z = z+kuan;
                uv0x = 0.0;
                uv0y = 0;
                uv1x = chang;
                uv1y = 0.0;
                uv2x = chang;
                uv2y = kuan;
                uv3x = 0.0;
                uv3y = kuan;
                break;
            case 5:

                vertexnormalx = 0.0;
                vertexnormaly = 0.0;
                vertexnormalz = -1.0;


                vertexpos1x = x;
                vertexpos1y = y;
                vertexpos1z = z;

                vertexpos2x = x;
                vertexpos2y = y+kuan;
                vertexpos2z = z;

                vertexpos3x = x+chang;
                vertexpos3y = y+kuan;
                vertexpos3z = z;

                vertexpos4x = x+chang;
                vertexpos4y = y;
                vertexpos4z = z;
                uv0x = chang;
                uv0y = kuan;
                uv1x = chang;
                uv1y = 0.0;
                uv2x = 0.0;
                uv2y = 0.0;
                uv3x = 0.0;
                uv3y = kuan;
                break;
        }

        vertexarray[vertexarrayIndex] = vertexpos1x;
        vertexarray[vertexarrayIndex + 1] = vertexpos1y;
        vertexarray[vertexarrayIndex + 2] = vertexpos1z;
        vertexarray[vertexarrayIndex + 3] = vertexnormalx;
        vertexarray[vertexarrayIndex + 4] = vertexnormaly;
        vertexarray[vertexarrayIndex + 5] = vertexnormalz;
        vertexarray[vertexarrayIndex + 6] = r * aopoint1;
        vertexarray[vertexarrayIndex + 7] = g * aopoint1;
        vertexarray[vertexarrayIndex + 8] = b * aopoint1;
        vertexarray[vertexarrayIndex + 9] = 1.0;
        vertexarray[vertexarrayIndex + 10] = uv0x;
        vertexarray[vertexarrayIndex + 11] = uv0y;


        vertexarray[vertexarrayIndex + 12] = vertexpos2x;
        vertexarray[vertexarrayIndex + 13] = vertexpos2y;
        vertexarray[vertexarrayIndex + 14] = vertexpos2z;
        vertexarray[vertexarrayIndex + 15] = vertexnormalx;
        vertexarray[vertexarrayIndex + 16] = vertexnormaly;
        vertexarray[vertexarrayIndex + 17] = vertexnormalz;
        vertexarray[vertexarrayIndex + 18] = r * aopoint2;
        vertexarray[vertexarrayIndex + 19] = g * aopoint2;
        vertexarray[vertexarrayIndex + 20] = b * aopoint2;
        vertexarray[vertexarrayIndex + 21] = 1.0;
        vertexarray[vertexarrayIndex + 22] = uv1x;
        vertexarray[vertexarrayIndex + 23] = uv1y;


        vertexarray[vertexarrayIndex + 24] = vertexpos3x;
        vertexarray[vertexarrayIndex + 25] = vertexpos3y;
        vertexarray[vertexarrayIndex + 26] = vertexpos3z;
        vertexarray[vertexarrayIndex + 27] = vertexnormalx;
        vertexarray[vertexarrayIndex + 28] = vertexnormaly;
        vertexarray[vertexarrayIndex + 29] = vertexnormalz;
        vertexarray[vertexarrayIndex + 30] = r * aopoint3;
        vertexarray[vertexarrayIndex + 31] = g * aopoint3;
        vertexarray[vertexarrayIndex + 32] = b * aopoint3;
        vertexarray[vertexarrayIndex + 33] = 1.0;
        vertexarray[vertexarrayIndex + 34] = uv2x;
        vertexarray[vertexarrayIndex + 35] = uv2y;


        vertexarray[vertexarrayIndex + 36] = vertexpos4x;
        vertexarray[vertexarrayIndex + 37] = vertexpos4y;
        vertexarray[vertexarrayIndex + 38] = vertexpos4z;
        vertexarray[vertexarrayIndex + 39] = vertexnormalx;
        vertexarray[vertexarrayIndex + 40] = vertexnormaly;
        vertexarray[vertexarrayIndex + 41] = vertexnormalz;
        vertexarray[vertexarrayIndex + 42] = r * aopoint4;
        vertexarray[vertexarrayIndex + 43] = g * aopoint4;
        vertexarray[vertexarrayIndex + 44] = b * aopoint4;
        vertexarray[vertexarrayIndex + 45] = 1.0;
        vertexarray[vertexarrayIndex + 46] = uv3x;
        vertexarray[vertexarrayIndex + 47] = uv3y;
    }



    static createDebugMesh(declaration: VertexDeclaration, vertexarray: Float32Array, indexArray: Uint16Array): Mesh {

        let gl: WebGLRenderingContext = LayaGL.instance;

        let vertexByteLength = vertexarray.length * 4;
        //DYNAMIC_DRAW
        let vertexBuffer: VertexBuffer3D = new VertexBuffer3D(vertexByteLength, gl.DYNAMIC_DRAW, true);// todo  标记为动态有用吗
        vertexBuffer.vertexDeclaration = declaration;
        vertexBuffer.setData(vertexarray.buffer);

        let indexBuffer: IndexBuffer3D = new IndexBuffer3D(IndexFormat.UInt16, indexArray.length, gl.STATIC_DRAW, true); // todo 
        indexBuffer.setData(indexArray);

        let mesh: Mesh = new Mesh();
        let subMesh: SubMesh = new SubMesh(mesh);
        //@ts-ignore
        mesh._vertexBuffer = vertexBuffer;
        //@ts-ignore
        mesh._vertexCount = vertexBuffer._byteLength / declaration.vertexStride;
        //@ts-ignore
        mesh._indexBuffer = indexBuffer;
        //@ts-ignore
        mesh._setBuffer(vertexBuffer, indexBuffer);
        //@ts-ignore
        mesh._setInstanceBuffer(mesh._instanceBufferStateType);
        //@ts-ignore
        subMesh._vertexBuffer = vertexBuffer;
        //@ts-ignore
        subMesh._indexBuffer = indexBuffer;
        //@ts-ignore
        subMesh._setIndexRange(0, indexBuffer.indexCount);
        //@ts-ignore
        subMesh._subIndexBufferStart.length = 1;
        //@ts-ignore
        subMesh._subIndexBufferStart[0] = 0;
        //@ts-ignore
        subMesh._subIndexBufferCount.length = 1;
        //@ts-ignore
        subMesh._subIndexBufferCount[0] = indexBuffer.indexCount;
        //@ts-ignore
        mesh._setSubMeshes([subMesh]);

        mesh.calculateBounds();

        return mesh;
    }
    
}