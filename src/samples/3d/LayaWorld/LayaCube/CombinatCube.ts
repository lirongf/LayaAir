import { Vector3 } from "laya/d3/math/Vector3";
import { CubeBox4, CubeBox4features } from "./CubeBox4";
import { CubeFaceUtil } from "./CubeFaceUtil";
import { FaceManager } from "./FaceManager";

/**
 * 样本类
 * 相当于是一个无线编辑的地方，只要组织好了你的Box4
 */
export class CombinatCube{

    //样本大小  
    static CombineSize:number = 50;
    //超出Box4几个  
    static resideSize:number;//右 上的格子大小
    //一排多少Box4  //zindex增量
    static OneLine:number;
    //一排平方   //yIndex增量  x的增量是1
    static PowbyOneLine:number;
    //
    static powCombineSize:number;


    //
    static maxBox4Nums:number;
    //边缘box64的
    static _borderIndex:Array<number> = [];
    //是否是边缘的判断
    static _isBorder:Array<boolean>;
    //box4的相对的索引位置
    static _indexTOBox4XYZ:Array<Vector3> = [];
    //真实的位置记录
    static _localPosTOBox4:Array<Vector3> = [];

    

    //六个方向的
    static _dirIndex:Array<Array<number>>;
    private static _box64NearDir:any[] =/*[STATIC SAFE]*/[5, 3, 4, 1, 2, 0];


    static __init__(){
        CombinatCube.resideSize = CombinatCube.CombineSize%CubeBox4.CUBESIZE;
        CombinatCube.OneLine = Math.ceil(CombinatCube.CombineSize/CubeBox4.CUBESIZE);
        CombinatCube.PowbyOneLine = Math.pow(CombinatCube.OneLine,2);
        CombinatCube.maxBox4Nums = Math.pow(CombinatCube.OneLine,3);
        CombinatCube.powCombineSize = Math.pow(CombinatCube.CombineSize,2);
        if (CombinatCube._borderIndex.length!=0)
				return;
        CombinatCube._isBorder = [];
        CombinatCube._borderIndex = [];
        CombinatCube._dirIndex = [[], [], [], [], [], []];
        CombinatCube._localPosTOBox4 = [];
        CombinatCube._indexTOBox4XYZ = [];
        var borderNum:number = CombinatCube.CombineSize-CombinatCube.resideSize;
        for (var z:number = 0; (z < CombinatCube.CombineSize); z+=CubeBox4.CUBESIZE)
            for (var y:number = 0; (y < CombinatCube.CombineSize); y+=CubeBox4.CUBESIZE)
                for (var x:number = 0; (x < CombinatCube.CombineSize); x+=CubeBox4.CUBESIZE)
                {
                    var index:number = ((x/CubeBox4.CUBESIZE)|0) + ((y/CubeBox4.CUBESIZE)|0)*CombinatCube.PowbyOneLine + ((z/CubeBox4.CUBESIZE)|0)*CombinatCube.OneLine;
                    CombinatCube._localPosTOBox4[index] = new Vector3(x, y, z);
                    CombinatCube._indexTOBox4XYZ[index] = new Vector3(x/4, y/4, z/4);
                    if (x * y * z === 0 || x === borderNum || y === borderNum || z === borderNum)
                    {
                        //var index:int = (x >> CubeConst.BOX8BITSIZE) + (y >> CubeConst.BOX8BITSIZE << 6) + (z >> CubeConst.BOX8BITSIZE << 3);
                        CombinatCube._isBorder[index] = true;
                        CombinatCube._borderIndex.push(index);
                        if (x === borderNum)
                        {
                            CombinatCube._dirIndex[1].push(index);//right
                        }
                        else if (y === borderNum)
                        {
                            CombinatCube._dirIndex[2].push(index);//up
                        }
                        else if (z === borderNum)
                        {
                            CombinatCube._dirIndex[0].push(index);//front
                        }
                        else if (x === 0)
                        {
                            CombinatCube._dirIndex[3].push(index);//left
                        }
                        else if (y === 0)
                        {
                            CombinatCube._dirIndex[4].push(index);//down
                        }
                        else if (z === 0)
                        {
                            CombinatCube._dirIndex[5].push(index);//back
                        }
                    }
                }
        CubeBox4.init();
        CubeFaceUtil.__init__();
    }
    
    _LayaWorldPos:Vector3 = new Vector3();//LayaWorld位置
    _samplePos:Vector3 = new Vector3();//样本位置
    _NodePos:Vector3 = new Vector3();//节点位置
    //key index,value:Box4
    //管理Box4Array
    public _Box4Array = {};
    private _box4RenderData = {};
    private _modefyBox4:Array<number> = [];
    version:number = 0;
    cubeSize:number = 0.1;

    constructor(layaWorld:Vector3,samplePos:Vector3){
    　　this._LayaWorldPos = layaWorld;
        this._samplePos = samplePos;
        //this.parse(data);
    }


    /**
     * 切换样本
     */
    transSample(LayaWorldPos:Vector3,samplePos,data:object){
        this._LayaWorldPos = LayaWorldPos;
        this._samplePos = samplePos;
        this._Box4Array = {};
        this._modefyBox4.length = 0;
        //this.parse(data);

    }

    /**
     * 获得box4的index
     * @param x 
     * @param y 
     * @param z 
     */
    getBox4Index(x:number,y:number,z:number){
        return ((x/CubeBox4.CUBESIZE)|0) + ((y/CubeBox4.CUBESIZE)|0)*CombinatCube.PowbyOneLine + ((z/CubeBox4.CUBESIZE)|0)*CombinatCube.OneLine;
        
    }
    getbox4Pos(boxindex:number):Vector3{
       return CombinatCube._localPosTOBox4[boxindex];
    }

    getbox1Index(x:number,y:number,z:number){
        return x+y*CombinatCube.powCombineSize+z*CombinatCube.CombineSize;
    }

  //operation1x1x1
  //add set
    set1x1x1(x:number,y:number,z:number,propertyType:CubeBox4features,property:number,render:boolean =false):void{
        let box4Ind = this.getBox4Index(x,y,z);
        if(!this._Box4Array[box4Ind])
            this._Box4Array[box4Ind] = CubeBox4.create();
        let box4:CubeBox4 = this._Box4Array[box4Ind];
        let preHas = this.has1x1x1(x,y,z)
        box4.set1x1x1(x,y,z,propertyType,property);
        if(render){
            //立马更新渲染数据
            if(this._modefyBox4.indexOf(box4Ind)==-1){
                this._modefyBox4.push(box4Ind);
            }
            let modefyIndex =box4Ind + this.setDirModify(x,y,z,box4Ind);
            if(this._modefyBox4.indexOf(modefyIndex)==-1){
                this._modefyBox4.push(modefyIndex);
            }
        }
        
    }
    //add set
    set1x1x1Propertys(x:number,y:number,z:number,property:Array<number>,render:boolean):void{
        let box4Ind = this.getBox4Index(x,y,z);
        if(!this._Box4Array[box4Ind])
            this._Box4Array[box4Ind] = CubeBox4.create();
        let box4:CubeBox4 = this._Box4Array[box4Ind];
        box4.set1x1x1Propertys(x,y,z,property);
        if(render){
            //立马更新渲染数据
            if(this._modefyBox4.indexOf(box4Ind)==-1){
                this._modefyBox4.push(box4Ind);
            }
            let modefyIndex =box4Ind + this.setDirModify(x,y,z,box4Ind);
            if(this._modefyBox4.indexOf(modefyIndex)==-1){
                this._modefyBox4.push(modefyIndex);
            }
        }
    }
    //remove
    remove1x1x1(x:number,y:number,z:number,render:boolean):void{
        let box4Ind = this.getBox4Index(x,y,z);
        if(!this._Box4Array[box4Ind]){
            console.log("此处没有Cube");
            return;
        }   
        let box4:CubeBox4 = this._Box4Array[box4Ind];
        box4.remove1x1x1(x,y,z);
        if(render){
            //立马更新渲染数据
            if(this._modefyBox4.indexOf(box4Ind)==-1){
                this._modefyBox4.push(box4Ind);
            }
            let modefyIndex =box4Ind + this.setDirModify(x,y,z,box4Ind);
            if(this._modefyBox4.indexOf(modefyIndex)==-1){
                this._modefyBox4.push(modefyIndex);
            }
        }
    }
    //find
    has1x1x1(x:number,y:number,z:number):boolean{
        let box4Ind = this.getBox4Index(x,y,z);
        if(!this._Box4Array[box4Ind])
            this._Box4Array[box4Ind] = CubeBox4.create();
        let box4:CubeBox4 = this._Box4Array[box4Ind];
        box4.has1x1x1(x,y,z);
        return box4.has1x1x1(x,y,z);
    }
    //get
    getPorperty1x1x1(x:number,y:number,z:number,propertype:CubeBox4features):number{
        let box4Ind = this.getBox4Index(x,y,z);
        if(!this._Box4Array[box4Ind])
            return -1
        let box4:CubeBox4 = this._Box4Array[box4Ind];
        return box4.getProperty1x1x1(x,y,z,propertype);
    }

    //operation4x4x4 TODO
    //addBox4
    setBox4OneProperty(x:number,y:number,z:number,propertyType:CubeBox4features,property:number,render:boolean =false){
        let box4Ind = this.getBox4Index(x,y,z);
        //TODO
    }
    //addBox4
    setBox4Propertys(x:number,y:number,z:number,propertyType:CubeBox4features,property:number,render:boolean =false){
        let box4Ind = this.getBox4Index(x,y,z);
        //TODO
    }
    //removeBox4
    removeBox4(x:number,y:number,z:number){
        let box4Ind = this.getBox4Index(x,y,z);
        //TODO
    }
    //hasBox4
    hasBox4(x:number,y:number,z:number){
        let box4Ind = this.getBox4Index(x,y,z);
        //TODO
    }
    //operate n m设置一个框的数据，或者减去一个框内的数据TODO
    //也可以在外面的编辑里面做
    setBoxbymeter(x:number,y:number,z:number){
        //TODO:
    }




    //RenderManager

    setDirModify(x:number,y:number,z:number,boxIndex:number):number{
        let xx = x&CubeBox4.CUBEBOX4MOD;
        if( xx==0&&CombinatCube._dirIndex[3].indexOf(boxIndex)){
            return -1;
        }
        if(xx==3&&CombinatCube._dirIndex[1].indexOf(boxIndex)){
            return 1;
        }
        let yy = y&CubeBox4.CUBEBOX4MOD;
        if( yy==0&&CombinatCube._dirIndex[4].indexOf(boxIndex)){
            return -CombinatCube.PowbyOneLine;
        }
        if(yy==3&&CombinatCube._dirIndex[2].indexOf(boxIndex)){
            return CombinatCube.PowbyOneLine;
        }

        let zz = z&CubeBox4.CUBEBOX4MOD;
        if( zz==0&&CombinatCube._dirIndex[5].indexOf(boxIndex)){
            return -CombinatCube.OneLine ;
        }
        if(zz==3&&CombinatCube._dirIndex[0].indexOf(boxIndex)){
            return  CombinatCube.OneLine ;
        }
        return 0;
    }

    
    //获得所有的FaceInfo
    getAllRender(){
        let faceManager:FaceManager = new FaceManager(this._samplePos);
        faceManager.boundsize = CombinatCube.CombineSize;
        faceManager.combinatCube = this;
        for(var i in this._Box4Array) {
             let cubeBox:CubeBox4 = this._Box4Array[i];
             let cubeboxIndex = parseFloat(i);
             if(!cubeBox) continue;
             faceManager.cubeBox = cubeBox;
             faceManager.cubeBoxIndex = cubeboxIndex;
             faceManager.cubeBox8Pos = this.getbox4Pos(cubeboxIndex);
             faceManager.combinatCube = this;
             CubeFaceUtil.CreateBox4Face(faceManager,cubeBox,
                CombinatCube._dirIndex[0].indexOf(cubeboxIndex)==-1?this._Box4Array[cubeboxIndex+CombinatCube.OneLine]:null,
                CombinatCube._dirIndex[5].indexOf(cubeboxIndex)==-1?this._Box4Array[cubeboxIndex-CombinatCube.OneLine]:null,
                CombinatCube._dirIndex[2].indexOf(cubeboxIndex)==-1?this._Box4Array[cubeboxIndex+CombinatCube.PowbyOneLine]:null,
                CombinatCube._dirIndex[4].indexOf(cubeboxIndex)==-1?this._Box4Array[cubeboxIndex-CombinatCube.PowbyOneLine]:null,
                CombinatCube._dirIndex[3].indexOf(cubeboxIndex)==-1?this._Box4Array[cubeboxIndex-1]:null,
                CombinatCube._dirIndex[1].indexOf(cubeboxIndex)==-1?this._Box4Array[cubeboxIndex+1]:null);
        }
        let faceArray = faceManager.getRenderVertices();
        //TODO
        //
        return faceArray;
    }

    //LOD为0的时候，将所有的面按照Box4来合并,为了编辑方便
    getLOD0Box4AllRender(){
        let faceArray = FaceManager.createFaceArray();
        for(var i in this._Box4Array) {
            let faceManager:FaceManager = new FaceManager(this._samplePos);
            faceManager.boundsize = CombinatCube.CombineSize;
            faceManager.combinatCube = this;
            let cubeBox:CubeBox4 = this._Box4Array[i];
            let cubeboxIndex = parseFloat(i);
            if(!cubeBox) continue;
            faceManager.cubeBox = cubeBox;
            faceManager.cubeBoxIndex = cubeboxIndex;
            faceManager.cubeBox8Pos = this.getbox4Pos(cubeboxIndex);
            faceManager.combinatCube = this;
            CubeFaceUtil.CreateBox4Face(faceManager,cubeBox,
            CombinatCube._dirIndex[0].indexOf(cubeboxIndex)==-1?this._Box4Array[cubeboxIndex+CombinatCube.OneLine]:null,
            CombinatCube._dirIndex[5].indexOf(cubeboxIndex)==-1?this._Box4Array[cubeboxIndex-CombinatCube.OneLine]:null,
            CombinatCube._dirIndex[2].indexOf(cubeboxIndex)==-1?this._Box4Array[cubeboxIndex+CombinatCube.PowbyOneLine]:null,
            CombinatCube._dirIndex[4].indexOf(cubeboxIndex)==-1?this._Box4Array[cubeboxIndex-CombinatCube.PowbyOneLine]:null,
            CombinatCube._dirIndex[3].indexOf(cubeboxIndex)==-1?this._Box4Array[cubeboxIndex-1]:null,
            CombinatCube._dirIndex[1].indexOf(cubeboxIndex)==-1?this._Box4Array[cubeboxIndex+1]:null);
            FaceManager.getFaceManagerRenderVertices(faceArray,faceManager);
       }
       return faceArray
    }

    //输出所有的IndexArray里面的Box4的所有渲染数据 一般是服务器用来修改Box4的面
    getIndexOfBox4AllRender(indexArray:Array<number>){
        let faceArray = FaceManager.createFaceArray();
        for(let i = 0;i<indexArray.length;i++){
            let faceManager:FaceManager = new FaceManager(this._samplePos);
            let cubeBox:CubeBox4 = this._Box4Array[i];
            let cubeboxIndex = i;
            if(!cubeBox) continue;
            faceManager.cubeBox = cubeBox;
            faceManager.cubeBoxIndex = cubeboxIndex;
            faceManager.cubeBox8Pos = this.getbox4Pos(cubeboxIndex);
            faceManager.combinatCube = this;
            CubeFaceUtil.CreateBox4Face(faceManager,cubeBox,
            CombinatCube._dirIndex[0].indexOf(cubeboxIndex)==-1?this._Box4Array[cubeboxIndex+CombinatCube.OneLine]:null,
            CombinatCube._dirIndex[5].indexOf(cubeboxIndex)==-1?this._Box4Array[cubeboxIndex-CombinatCube.OneLine]:null,
            CombinatCube._dirIndex[2].indexOf(cubeboxIndex)==-1?this._Box4Array[cubeboxIndex+CombinatCube.PowbyOneLine]:null,
            CombinatCube._dirIndex[4].indexOf(cubeboxIndex)==-1?this._Box4Array[cubeboxIndex-CombinatCube.PowbyOneLine]:null,
            CombinatCube._dirIndex[3].indexOf(cubeboxIndex)==-1?this._Box4Array[cubeboxIndex-1]:null,
            CombinatCube._dirIndex[1].indexOf(cubeboxIndex)==-1?this._Box4Array[cubeboxIndex+1]:null);
            FaceManager.getFaceManagerRenderVertices(faceArray,faceManager);
        }
    }
    


    getLODCombinatCube(lod:number):CombinatCube{
        let combinate:CombinatCube = new CombinatCube(this._LayaWorldPos,this._samplePos);
        combinate.cubeSize = this.cubeSize*lod;
        if(CombinatCube.CombineSize%lod!=0)
            throw "lod is not ruller"
        let combinenateSize = CombinatCube.CombineSize/lod;
        let propertyArray:Array<Array<number>> = [];
        for(let i = 0;i<CubeBox4features.length;i++){
            propertyArray.push(new Array<number>(lod*lod*lod));
        }
        for(let y = 0;y<combinenateSize;y++){
            let oriy = y*lod;
            for(let z = 0;z<combinenateSize;z++){
                let oriz = z*lod;
                for(let x = 0;x<combinenateSize;x++){
                    let orix = x*lod;
                    //
                    let property =this.getOneLodCubeData(orix,oriy,oriz,lod,propertyArray);
                    if(property!=0)
                    combinate.set1x1x1(x,y,z,CubeBox4features.color,property);
                }
            }
        }
        
        return combinate;
    }
    getOneLodCubeData(orix:number,oriy:number,oriz:number,lod:number,propertyArray:Array<Array<number>>){
        let lodPow = lod*lod;
        let lodPow3 = lod*lod*lod/2;
        for(let xx = 0;xx<lod;xx++){
            for(let yy = 0;yy<lod;yy++){
                for(let zz = 0;zz<lod;zz++){
                    for(let i = 0;i<CubeBox4features.length;i++){
                        propertyArray[i][xx+yy*lodPow+zz*lod] = this.getPorperty1x1x1(orix+xx,oriy+yy,oriz+zz,i)
                    }
                }
            }
        }
        //mergeProperty
        //TODO:现在先合并第一个参数  后面的属性后面再说
        //颜色
        let array  = propertyArray[0];
        let colorlength = 0;
        let r = 0;
        let g = 0;
        let b = 0;
        let a = 0;//TODO
        for(let i = 0;i<array.length;i++){
            if(array[i]!=0&&array[i]!=-1){
                let value = array[i];
                colorlength++;
                r+=value & 0xff;
                g+=((value & 0xff00) >> 8) ;
                b+=((value & 0xff0000) >> 16)
            }
        }
        if(colorlength<lodPow3/2){
            return 0;
        }else
        {
            return ((r/colorlength)|0)+(((g/colorlength)|0)<<8)+(((b/colorlength)|0)<<16);
        }            
    }

    destroy(){

    }


    
}