import { BufferState } from "laya/d3/core/BufferState";
import { IndexBuffer3D } from "laya/d3/graphics/IndexBuffer3D";
import { IndexFormat } from "laya/d3/graphics/IndexFormat";
import { VertexMesh } from "laya/d3/graphics/Vertex/VertexMesh";
import { VertexBuffer3D } from "laya/d3/graphics/VertexBuffer3D";
import { VertexDeclaration } from "laya/d3/graphics/VertexDeclaration";
import { Vector3 } from "laya/d3/math/Vector3";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { LayaGL } from "laya/layagl/LayaGL";
import { Resource } from "laya/resource/Resource";
import { Stat } from "laya/utils/Stat";
import { StaticMapNode } from "./StaticMapNode";

/**
 * 静态地图数据的渲染
 * @author：miner
 */
export class StaticMapNodeRenderGeometry{
    /**公用 */
    private static _commonIndexBuffer:IndexBuffer3D;
    private static _vertexDeclaration:VertexDeclaration;
    //用来分析六个面的数据
    static _VertexArrayLength:Array<number> = new Array(6);
    static _vertexArrayOffset:Array<number> = new Array(6);
    
    //最大顶点数
    static _OneBufferVertexCount:number = 65532;
    //最大FloatArray数
    static _OneBufferFloatCount:number;
    //一个顶点Float数
    static _OneVertexFloatCount:number;

    static __init__(){
        //创建公用Buffer indexBuffer
        var gl: WebGLRenderingContext = LayaGL.instance;
        var maxFaceNums:number = 65536 / 4;
        var indexCount:number = maxFaceNums * 6;
        StaticMapNodeRenderGeometry._commonIndexBuffer = new IndexBuffer3D(IndexFormat.UInt16,indexCount, gl.STATIC_DRAW,true);
        var indices:Uint16Array = new Uint16Array(indexCount);
        for (var i:number = 0; i < maxFaceNums; i++) {
            var indexOffset:number = i * 6;
            var pointOffset:number = i * 4;
            indices[indexOffset] = pointOffset;
            indices[indexOffset + 1] = 2 + pointOffset;
            indices[indexOffset + 2] = 1 + pointOffset;
            indices[indexOffset + 3] = pointOffset;
            indices[indexOffset + 4] = 3 + pointOffset;
            indices[indexOffset + 5] = 2 + pointOffset;
        }
        StaticMapNodeRenderGeometry._commonIndexBuffer.setData(indices);
        //初始化数据描述
        StaticMapNodeRenderGeometry._vertexDeclaration =VertexMesh.getVertexDeclaration("POSITION,NORMAL,COLOR,UV");
        //初始化数据
        StaticMapNodeRenderGeometry._OneVertexFloatCount = StaticMapNodeRenderGeometry._vertexDeclaration.vertexStride/4;
        StaticMapNodeRenderGeometry._OneBufferFloatCount = StaticMapNodeRenderGeometry._OneVertexFloatCount*StaticMapNodeRenderGeometry._OneBufferVertexCount;
    }

    //顶点BufferState
    bufferStateArray:BufferState[] = [];
    //顶点数据
    vertexData:Float32Array[] = [];
    //resourceGPUMemory
    GPUMemory:number = 0;
    //resourceCPUMemory
    CPUMemory:number = 0;
    //
    updateLoop:number;

    constructor(){

    }

    
    /**
     * 解析数据为渲染数据
     * @param data 
     */
    parse(data:Array<any>){
        this.vertexData = [];
        let lengthArray = StaticMapNodeRenderGeometry._VertexArrayLength;
        let dirOffset = StaticMapNodeRenderGeometry._vertexArrayOffset;
        //重置长度和offset
        for(var len = 0;len<6;len++){
            lengthArray[len] = 0;
            dirOffset[len] = 0;
        }
        //得出长度
        for(var i in data){
            for(var j = 0;j<6;j++){
                 lengthArray[j] += data[i][j].length;
            }
        }
        //创建数组
        let dirArray:Array<Float32Array> = new Array(6);
        for(var len = 0;len<6;len++){
            dirArray[len] = new Float32Array(lengthArray[len]);
        }
        //赛数据
        for(var i in data){
            for(var j = 0;j<6;j++){
                let dataArray = data[i][j];
                dirArray[j].set(dataArray,dirOffset[j]);
                dirOffset[j]+=dataArray.length;
           }
        }
        //分数据
        //根据六条数据直接创建渲染节点
        let Alllength:number = 0;
        lengthArray.forEach(element => {
            Alllength+=element;
        });
        
        let allArray:Float32Array = new Float32Array(Alllength);
        let offset = 0;
        for(let len = 0;len<6;len++){
            let array:Float32Array = dirArray[len];
            allArray.set(array,offset);
            offset+=array.length;
        }
        //slice
        let maxFloatArrayLength = StaticMapNodeRenderGeometry._OneBufferFloatCount;
        let currentCount = 0;
        while(currentCount!=Alllength){
            let length = Alllength-currentCount>maxFloatArrayLength?maxFloatArrayLength:Alllength-currentCount;
            let vertexa = allArray.slice(currentCount,currentCount+length);
            this.vertexData.push( vertexa);
            this.creatVertexBuffer(vertexa);
            currentCount+=length;
        }

        StaticMapNode.CommonCPUMemory+=this.CPUMemory;
        StaticMapNode.CommonGPUMemory+=this.GPUMemory;
    }

    /**
     * 渲染节点
     * @param vertexData 
     * @returns 
     */
    creatVertexBuffer(vertexData:Float32Array):void
    {
        var gl: WebGLRenderingContext = LayaGL.instance;
        var verDec:VertexDeclaration = StaticMapNodeRenderGeometry._vertexDeclaration;		
        //这里new一个最大的数组
        
        var newVertecBuffer:VertexBuffer3D = new VertexBuffer3D(verDec.vertexStride * vertexData.length/ StaticMapNodeRenderGeometry._OneVertexFloatCount, gl.DYNAMIC_DRAW,false);
        var bufferState:BufferState = new BufferState();
        newVertecBuffer.setData(vertexData.buffer);
        newVertecBuffer.vertexDeclaration = verDec;
        //组织渲染buffer
        
        bufferState.bind();
    
        bufferState.applyVertexBuffer(newVertecBuffer);
        
        bufferState.applyIndexBuffer(StaticMapNodeRenderGeometry._commonIndexBuffer);
        bufferState.unBind();
        this.bufferStateArray.push(bufferState);
        var memorySize: number = newVertecBuffer._byteLength ;
        //@ts-ignore
        Resource._addCPUMemory(memorySize);
        //@ts-ignore
		Resource._addGPUMemory(memorySize);
        this.GPUMemory+=memorySize;
        this.CPUMemory+=memorySize;
        return;
    }

    /**
     * 渲染节点
     */
    render():void{
        this.updateLoop = Stat.loopCount;
        var gl = LayaGL.instance;
        var count:number = this.bufferStateArray.length;
        for (var i = 0; i < count; i++) {
            this.bufferStateArray[i].bind();
            var renderCount = this.vertexData[i].length/StaticMapNodeRenderGeometry._OneVertexFloatCount;
            gl.drawElements(gl.TRIANGLES, renderCount/4*6, gl.UNSIGNED_SHORT, 0);
            Stat.renderBatches += 1;
            Stat.trianglesFaces +=  renderCount/2;
        }
    }

    /**
     * 删除渲染节点
     */
    destroy():void{
        this.bufferStateArray.forEach(element => {
            element.destroy();    
        });
        this.bufferStateArray = [];
        this.vertexData = [];
        //@ts-ignore
        Resource._addCPUMemory(-this.CPUMemory);
        //@ts-ignore
        Resource._addGPUMemory(-this.GPUMemory);
        StaticMapNode.CommonCPUMemory-=this.CPUMemory;
        StaticMapNode.CommonGPUMemory-=this.GPUMemory;
    }

    /**
     * 清理数据
     */
    clear(){
        this.bufferStateArray.forEach(element => {
            element.destroy();    
        });
        this.bufferStateArray = [];
        this.vertexData = [];
        //@ts-ignore
        Resource._addCPUMemory(-this.CPUMemory);
        //@ts-ignore
        Resource._addGPUMemory(-this.GPUMemory);
    }
  
}