import { Vector3 } from "laya/d3/math/Vector3";
import { Byte } from "laya/utils/Byte";
import { CompressIDS } from "../CompressIDS";
import { CombinatCube } from "./CombinatCube";
import { CubeBox4, CubeBox4features } from "./CubeBox4";
import { CubeFaceUtil, FaceNormal } from "./CubeFaceUtil";

/**
 * 类用来保存解析数据
 */
export class CubeDataUtils{
    private static version:string = "ComBineCubeData:01";
    private static faceversion:string = "FaceData:01";
    private static faceDIr:string[] = ["front","right","top","left","bottom","back"];
    static saveCubeData(combineCube:CombinatCube){
        //LayaWorld位置，以及单元位置
        var byte:Byte = new Byte();
        this.saveStartMessage(byte,combineCube);
        this.saveBox4(byte,combineCube);
        return byte;
    }

    static parseCubeData(data:Byte){
        data.pos = 0;
        //读取开头
        if(data.readUTFString()!=CubeDataUtils.version)//版本号
            throw "version is correct";
        let updateFlag = data.readInt32();//更新标记
        let propertylength = data.readInt32();
        //是否要保存LayaWorld以及SampPos以及其他信息
        let layaWorld:Vector3 = new Vector3(data.readFloat32(),data.readFloat32(),data.readFloat32());
        let samplePos:Vector3 = new Vector3(data.readFloat32(),data.readFloat32(),data.readFloat32());
        let combineCube =new CombinatCube(layaWorld,samplePos);
        //cubeBox4读取
        if(data.readUTFString()!="FullCube")
            throw "data correct";
        var fullPropertyBoxLength = data.readInt32();
        for(var i = 0;i<fullPropertyBoxLength;i++){
            let propertyArray:Array<number> = new Array<number>(propertylength);
            propertyArray.push(data.readInt32());
            let cubeboxLength = data.readInt32();
            for(var j = 0;j<cubeboxLength;j++){
                let boxIndex = data.readInt32();
                let datalow = data.readInt32();
                let datahight = data.readInt32();
                let cube = CubeBox4.create();
                cube._dataLow = datalow;
                cube._dataHight = datahight;
                combineCube._Box4Array[boxIndex] = cube;
                for(var k = 0;k<64;k++){
                    let hasCube = false;
                    if ((k < 32))
                        hasCube = !!(datalow &(1 << k));
                    else 
                        hasCube = !!(datahight &( 1 << (k - 32)));
                    if(hasCube){
                        for(var ii = 0;ii<CubeBox4features.length;ii++){
                            cube.propertyDataArray[ii][k] = propertyArray[ii];
                        }
                    }
                }
            }

        }
        if(data.readUTFString()!="difCube")
            throw "data correct";
        let diffCubebox = data.readInt32();
        for(i = 0;i<diffCubebox;i++){
            let boxIndex = data.readInt32();
            var cubeBox = new CubeBox4();
            cubeBox._dataLow = data.readInt32();
            cubeBox._dataHight = data.readInt32();
            combineCube._Box4Array[boxIndex] = cubeBox;
            for(var jj = 0;jj< propertylength;jj++){
                cubeBox.propertyDataArray[jj]  = new Uint32Array(data.readArrayBuffer(64*4));
            }
        }

        return combineCube;

    }

    //保存开头信息
    private static saveStartMessage(byte:Byte,combineCube:CombinatCube){
        byte.writeUTFString(CubeDataUtils.version);//版本号
        byte.writeInt32(combineCube.version);//更新标记
        byte.writeInt32(CubeBox4features.length);
        //是否要保存LayaWorld以及SampPos以及其他信息
        let layaWorld:Vector3 = combineCube._LayaWorldPos;
        let samplePos:Vector3 = combineCube._samplePos;
        byte.writeFloat32(layaWorld.x);
        byte.writeFloat32(layaWorld.y);
        byte.writeFloat32(layaWorld.z);
        byte.writeFloat32(samplePos.x);
        byte.writeFloat32(samplePos.y);
        byte.writeFloat32(samplePos.z);
    }

    private static saveBox4(byte:Byte,combineCube:CombinatCube){
        let cubeBoxKind = {};
        let sameProperty = cubeBoxKind["sameProperty"] = {};
        let differentProperty = cubeBoxKind["DifferentProperty"] = new Array<number>();
        for(var i in combineCube._Box4Array) {
            let box4:CubeBox4 =  combineCube._Box4Array[i];
            //由Property组成的数据
            let key = box4.returnPropertyKeys();
            if(key){
                if(!sameProperty[key])
                    sameProperty[key] = new Array<number>();
                sameProperty[key].push(parseInt(i));
            }
            else{
                differentProperty.push(parseInt(i));
            }
        }

        //propertys   length   index   low hight
        byte.writeUTFString("FullCube");
        //
        let fullCubelenth = byte.pos;
        let fullnums = 0;
        byte.writeInt32(0);
        for(var i in sameProperty){
            var array = sameProperty[i];
            var strary:string[] = i.split(".");
            for(var j = 0 ;j<CubeBox4features.length;j++){
                byte.writeInt32(parseInt(strary[j]));
            }
            byte.writeInt32(array.length);
            for(var k = 0;k<array.length;k++){
                byte.writeInt32(array[k]);
                var cube:CubeBox4 = combineCube._Box4Array[array[k]];
                byte.writeInt32(cube._dataLow);
                byte.writeInt32(cube._dataHight);
            }
            fullnums++;
        }

        let curPos = byte.pos;
        byte.pos = fullCubelenth;
        byte.writeInt32(fullnums);
        byte.pos = curPos;

        byte.writeUTFString("difCube");
        byte.writeInt32(differentProperty.length);
        //index  datalow dataHight  PropertyUint16
        for(var ll = 0;ll<differentProperty.length;ll++){
            byte.writeInt32(differentProperty[ll]);
            var cube:CubeBox4 = combineCube._Box4Array[differentProperty[ll]];
            byte.writeInt32(cube._dataLow);
            byte.writeInt32(cube._dataHight);
            for(var kk = 0;kk<cube.propertyDataArray.length;kk++)
            byte.writeArrayBuffer(cube.propertyDataArray[kk].buffer);
        }
    }

    static saveFaceData(faceAllData:any,layaWorldPos:Vector3,lod:number,cubesize:number,combineCube:CombinatCube){
        let byte:Byte = new Byte();
        byte.writeUTFString(CubeDataUtils.faceversion);
        //Updateversion
        byte.writeInt32(combineCube.version);
        byte.writeInt32(lod);
        byte.writeFloat32(cubesize);
        byte.writeFloat32(layaWorldPos.x);
        byte.writeFloat32(layaWorldPos.y);
        byte.writeFloat32(layaWorldPos.z);
        //谢总test
        
        CubeDataUtils.transFaceData(faceAllData,byte);
       return byte; 
        
        
        
        
        
        //原先test
        for(var i:number=0;i<6;i++){
            byte.writeUTFString( CubeDataUtils.faceDIr[i]);
            let faceData  = faceAllData[i];
            let startPos:Array<Vector3> = faceData["startPos"];
            let hightWidth:Array<number> = faceData["heightWidth"];
            let property:Array<number> = faceData["property"];
            let faceCount = startPos.length;
            byte.writeInt32(faceCount);
            //position
            for(var jj = 0;jj<faceCount;jj++){
                let pos = startPos[jj];
                byte.writeUint16(pos.x);
                byte.writeUint16(pos.y);
                byte.writeUint16(pos.z);
            }
            
            for(jj = 0;jj<faceCount*2;jj++){
                byte.writeUint16(hightWidth[jj]);
            }

            for(jj = 0;jj<faceCount*CubeBox4features.length;jj++){
                byte.writeUint32(property[jj]);
            }
        }
        return byte;
    }

    static parseFaceData(data:Byte){
        if(data.readUTFString()!=CubeDataUtils.faceversion){
            throw "version is correct";
        }
        //Updateversion
        let updateFlay = data.readInt32();
        let lod = data.readInt32();
        let cubeSize =data.getFloat32();
        let layaWorldPos = new Vector3(data.readFloat32(),data.readFloat32(),data.readFloat32());
        let faceData =new Array<any>(6);

        CubeDataUtils.parseTransFaceData(faceData,data);

        return faceData;
        for(var i = 0;i<6;i++){
            if(CubeDataUtils.faceDIr[i]!=data.readUTFString()){
                throw "data is correct";
            }
            let onefaecData = faceData[i] = {};
            let startPos:Array<Vector3> = onefaecData["startPos"] = new Array<Vector3>();
            let hightWidth:Array<number> = onefaecData["heightWidth"] = new Array<number>();
            let property:Array<number> = onefaecData["property"] = new Array<number>();
            let faceCount = data.readInt32();
            for(var jj = 0;jj<faceCount;jj++){
                let pos = new Vector3(data.readUint16(),data.readUint16(),data.readUint16());
                startPos.push(pos);
            }
            for(jj = 0;jj<faceCount*2;jj++){
                hightWidth.push( data.readUint16());
            }
            for(jj = 0;jj<faceCount*CubeBox4features.length;jj++){
                property.push( data.readUint32());
            }
        }
        return faceData;
    }


    //压缩数据
    static transFaceData(faceAllData:any,byte:Byte){
        let faceAlDataTrans = {};
        for(let i = 0;i<6;i++)
        {
            let map = {};
            let faceData = faceAllData[i];
            let startPos:Array<Vector3> = faceData["startPos"];
            let hightWidth:Array<number> = faceData["heightWidth"];
            let property:Array<number> = faceData["property"];
            let propertylength = CubeBox4features.length;
            let zuNums = 0;
            for(let j = 0;j<startPos.length;j++){
                let hwOffset = j*2;
                let propertyoffset = j*propertylength;
                let keyString:string = "";
                keyString += hightWidth[hwOffset].toString()+","+hightWidth[hwOffset+1].toString()+",";
                keyString += property[propertyoffset].toString();
                if(!map[keyString]){
                    let data = map[keyString] = new saveFaceData();
                    data.width = hightWidth[hwOffset];
                    data.height = hightWidth[hwOffset+1];
                    data.property.push(property[propertyoffset]);
                    zuNums++;
                }
                <saveFaceData>map[keyString].posArray.push(startPos[j]);
            }
            faceAlDataTrans[i] = map;

            byte.writeUTFString( CubeDataUtils.faceDIr[i]);
            byte.writeUint32(zuNums);
            for(let key in map){
                let datainfo:saveFaceData =  map[key];
                byte.writeUint8(datainfo.width);
                byte.writeUint8(datainfo.height);
                byte.writeInt32(datainfo.property[0]);
                //byte.writeInt16(datainfo.posArray.length);
                let lowIndex = new Array<number>();
                let highIndex = new Array<number>();
                for(let ii = 0;ii<datainfo.posArray.length;ii++){
                    let poss =  datainfo.posArray[ii];  
                    let posindex = CubeDataUtils.getUnitPosIndex(poss.x,poss.y,poss.z);
                    if(posindex>65535)
                    highIndex.push(posindex - 65536);
                    else
                        lowIndex.push(posindex);
                    // byte.writeUint8(poss.x);
                    // byte.writeUint8(poss.y);
                    // byte.writeUint8(poss.z);
                }
                byte.writeUint16(highIndex.length);
                for(let jj = 0;jj<highIndex.length;jj++){
                    byte.writeUint16( highIndex[jj]);
                }
                byte.writeUint16(lowIndex.length);
                for(let kk = 0;kk<lowIndex.length;kk++){
                    byte.writeUint16(lowIndex[kk]);
                }
            }
        }
        return ;
    }

    static parseTransFaceData(faceAllData:Array<any>,data:Byte){
        for(var i = 0;i<6;i++){
            if(CubeDataUtils.faceDIr[i]!=data.readUTFString()){
                throw "data is correct";
            }
            let onefaecData = faceAllData[i] = {};
            let startPos:Array<Vector3> = onefaecData["startPos"] = new Array<Vector3>();
            let hightWidth:Array<number> = onefaecData["heightWidth"] = new Array<number>();
            let property:Array<number> = onefaecData["property"] = new Array<number>();
            let zuNums = data.readUint32();
            for(let j = 0;j<zuNums;j++){
                let width = data.readUint8();
                let heigh = data.readUint8();
                let property0 = data.readUint32();
                let highPosLength = data.readUint16();
                
                for(let k = 0;k<highPosLength;k++){
                    let posIndex =CubeDataUtils.getUintPos( data.readUint16()+65536);
                    startPos.push(posIndex);
                    hightWidth.push(width);
                    hightWidth.push(heigh);
                    property.push(property0);
                }
                let lowPosLength = data.readUint16();
                for(let k = 0;k<lowPosLength;k++){
                    let posIndex =CubeDataUtils.getUintPos( data.readUint16());
                    startPos.push(posIndex);
                    hightWidth.push(width);
                    hightWidth.push(heigh);
                    property.push(property0);
                }
            }
        }
    }




    static getUnitPosIndex(x:number,y:number,z:number):number{
        return x+y*CombinatCube.powCombineSize+z*CombinatCube.CombineSize;
    }

    static getUintPos(index:number):Vector3{
        let x = index%CombinatCube.CombineSize;
        let y = (index/CombinatCube.powCombineSize)|0;
        let z = ((index%CombinatCube.powCombineSize)/CombinatCube.CombineSize)|0;

        return new Vector3(x,y,z);
    }


    
}


export class saveFaceData{
    width:number;
    height:number;
    property:Array<number> = [];
    posArray:Array<Vector3> = [];
    constructor(){
        
    }   
}