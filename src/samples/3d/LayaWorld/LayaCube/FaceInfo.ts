import { Vector3 } from "laya/d3/math/Vector3";
import { CubeBox4 } from "./CubeBox4";
export class FaceInfo{
    property:Array<number>;

    dirArray:Array<any> = [];
    front = {};
    back = {};
    left = {};
    right = {};
    up = {};
    down = {};
    //六个方向的合面数据
    faceArray:Array<any> = [];


    //合面使用数据
    private boundSize:number;
    private boundsizePow2:number;

    
    constructor(propertyArray:Array<number>){
        this.dirArray.push(this.front);
        this.dirArray.push(this.right);
        this.dirArray.push(this.up);
        this.dirArray.push(this.left);
        this.dirArray.push(this.down);
        this.dirArray.push(this.back);
        this.property = propertyArray;
    }

    destroy(){
        this.dirArray =null;
        this.front = null;
        this.back = null;
        this.left = null;
        this.right = null;
        this.up = null;
        this.down = null; 
    }

    //增加面数
    addface(index:number,dir:number){
        this.dirArray[dir][index] = 1;
    }


    //合并面
    //位置  boxSize 可能是4 也可能是50
    mergeFace(pos:Vector3,boxSize:number,faceCombien:Array<any>){
        this.boundSize = boxSize;
        this.boundsizePow2 = boxSize*boxSize;
        //front back
        this.getFaceInfoRenders(pos,faceCombien);
        return this.faceArray;
        
    }

    getIndexX(index:number):number{
        return index%this.boundSize;
    }

    getIndexY(index:number):number{
        return (index/this.boundsizePow2)|0;
    }

    getIndexZ(index:number):number{
        return ((index/this.boundSize)|0)%this.boundSize;
    }

    /**
     * 获得这个FaceInfo里面的所有的面合并
     */
    getFaceInfoRenders(pos:Vector3,faceCombien:Array<any>){
        this.getOneFaceInfo(pos,0,this.front,faceCombien);
        this.getOneFaceInfo(pos,1,this.right,faceCombien);
        this.getOneFaceInfo(pos,2,this.up,faceCombien);
        this.getOneFaceInfo(pos,3,this.left,faceCombien);
        this.getOneFaceInfo(pos,4,this.down,faceCombien);
        this.getOneFaceInfo(pos,5,this.back,faceCombien);
        
    }
    /**
     * 获得一个面的合并
     * @param pos 
     * @param dirIndex 
     * @param faceOBJ 
     */
    getOneFaceInfo(pos:Vector3,dirIndex:number,faceOBJ:any,faceCombien:Array<any>){
        let faceArrayInfo = faceCombien[dirIndex];
        let startPosArray:Array<Vector3> = faceArrayInfo["startPos"];
        let ckArray:Array<number> = faceArrayInfo["heightWidth"];
        let propertyAr:Array<number> = faceArrayInfo["property"];
        for(var i in faceOBJ){
            if(faceOBJ[i]==0) continue;
            this.property.forEach(element => {
                propertyAr.push(element);
            });
            this.mergeOneFace(pos,dirIndex,startPosArray,ckArray,parseFloat(i),faceOBJ);
        }
        
    }

    /**
     * 
     * @param pos 实际位置
     * @param index 在bounds中的index
     * @param startPos 开始位置
     * @param heightWidth 长宽
     * @param faceIndex face的索引。
     * @param faceInfoArray face数据集合
     */
    mergeOneFace(pos:Vector3, dirindex:number,startPos:Array<Vector3>, heightWidth:Array<number>, faceIndex:number,faceInfoArray:object):void {
        var indexx = this.getIndexX(faceIndex);
        var indexy = this.getIndexY(faceIndex);
        var indexz = this.getIndexZ(faceIndex);
        var x = pos.x+indexx;
        var y = pos.y+indexy;
        var z = pos.z+indexz;
        var tempx = indexx;
        var tempy = indexy;
        var tempz = indexz;
        //var color:int = cubeinfo.color;
        //var othercubeinfo:CubeInfo;
        faceInfoArray[faceIndex] = 0;
        var currentIndex:number = faceIndex;

        switch (dirindex) {
            case 0:
            case 5:
                //front  back
                //先左后右，再上下
                var left:number = x;
                var right:number = x;
                var up:number = y;
                var down:number = y;
                var leftIndex:number;
                var rightIndex:number;
                //左
                while (true) {
                    if (indexx==0||(!faceInfoArray[currentIndex-1]))
                        break;
                    left-=1;
                    indexx-=1;
                    currentIndex = currentIndex-1;
                    faceInfoArray[currentIndex] = 0;
                }
                leftIndex = currentIndex;
                currentIndex = faceIndex;
                indexx = tempx;
                //右
                while (true) {
                    if (indexx==this.boundSize-1||(!faceInfoArray[currentIndex+1]))
                        break;
                    right+=1;
                    indexx+=1;
                    currentIndex = currentIndex+1;
                    faceInfoArray[currentIndex] = 0;
                }
                rightIndex = currentIndex;
                var tempLeftindex = leftIndex;
                var tempRightindex = rightIndex;
                //上
                while (true) {
                    var yipai:Boolean = true;
                    leftIndex+=this.boundsizePow2;
                    rightIndex+=this.boundsizePow2;
                    for (var i:number = leftIndex; i <= rightIndex; i++) {
                        
                        if (!faceInfoArray[i]) {
                            yipai = false;
                            break;
                        }
                    }
                    //如果這一排能合
                    if(!yipai)
                        break;
                    if (up==this.boundSize-1) break;
                    for (var i:number = leftIndex; i <= rightIndex; i++)
                        faceInfoArray[i] = 0;
                    up += 1;
                    
                }
                leftIndex = tempLeftindex;
                rightIndex = tempRightindex;
                //下
                while (true) {
                    var yipai:Boolean = true;
                    leftIndex-=this.boundsizePow2;
                    rightIndex-=this.boundsizePow2;
                    for (var i:number = leftIndex; i <= rightIndex; i++) {
                        if (!faceInfoArray[i]) {
                            yipai = false;
                            break;
                        }
                      
                    }
                    //如果這一排能合  
                    if (!yipai) break;
                    if(down==0)
                        break;
                        for (var i:number = leftIndex; i <= rightIndex; i++) 
                            faceInfoArray[i] = 0;
                    down -= 1;
                }
                //vertexArray.push(right + 1, up + 1, z + 1, left, up + 1, z + 1, left, down, z + 1, right + 1, down, z + 1);
                
                startPos.push(new Vector3(left,down,z));
                heightWidth.push(right + 1 - left);
                heightWidth.push(up + 1 - down);
                break;
            case 1:
            case 3:
                //right left
                var front:number = z;
                var back:number = z;
                var up:number = y;
                var down:number = y;
                var frontIndex:number;
                var backIndex:number;
                //后
                while (true) {
                    if (indexz==0||!faceInfoArray[currentIndex-this.boundSize])
                        break;
                    back-=1;
                    indexz-1;
                    currentIndex-=this.boundSize;
                    faceInfoArray[currentIndex] = 0;
                }
                backIndex = currentIndex;
                currentIndex = faceIndex;
                indexz = tempz;
                //前
                while (true) {
                  if(indexz==this.boundSize-1||!faceInfoArray[currentIndex+this.boundSize])
                    break;
                    front+=1;
                    indexz+=1;
                    currentIndex += this.boundSize;
                    faceInfoArray[currentIndex] = 0;
                }
                frontIndex = currentIndex;
                var tempbackIndex = backIndex;
                var tempfrontIndex = frontIndex;
                //上
                while (true) {
                    var yipai:Boolean = true;
                    frontIndex+=this.boundsizePow2;
                    backIndex+=this.boundsizePow2;
                    for (var i:number = backIndex; i <= frontIndex; i+=this.boundSize) {
                        if (!faceInfoArray[i]) {
                            yipai = false;
                            break;
                        }
                    }
                    //如果這一排能合
                    if(!yipai) break;
                    if(up==this.boundSize-1) break;
                    for (var i:number = backIndex; i <= frontIndex; i+=this.boundSize) 
                        faceInfoArray[i] = 0;
                    up += 1;
                }
                backIndex = tempbackIndex;
                frontIndex = tempfrontIndex;
                //下
                while (true) {
                    var yipai:Boolean = true;
                    frontIndex-=this.boundsizePow2;
                    backIndex-=this.boundsizePow2;
                    for (var i:number = backIndex; i <= frontIndex; i+=this.boundSize) {
                        if (!faceInfoArray[i]) {
                            yipai = false;
                            break;
                        }
                    }
                    //如果這一排能合
                    if (!yipai) break;
                    if(down==0) break;
                    for (var i:number = backIndex; i <= frontIndex; i+=this.boundSize) {
                            faceInfoArray[i] = 0;
                    }
                    down -= 1;
                }
                //vertexArray.push(x + 1, up + 1, front+1,   x+1, down,front+1,   x+1,down,back, x+1,up+1,back);
                startPos.push(new Vector3(x,down,back));
                heightWidth.push(front + 1 - back);
                heightWidth.push(up + 1 - down);
                break;
            case 2:
            case 4:
                //up down
                var front:number = z;
                var back:number = z;
                var left:number = x;
                var right:number = x;
                var leftIndex:number;
                var rightIndex:number;
                //左
                while (true) {
                    if (indexx==0||(!faceInfoArray[currentIndex-1]))
                        break;
                    left-=1;
                    indexx-=1;
                    currentIndex = currentIndex-1;
                    faceInfoArray[currentIndex] = 0;
                }
                leftIndex = currentIndex;
                currentIndex = faceIndex;
                indexx = tempx;
                //右
                while (true) {
                    if (indexx==this.boundSize-1||(!faceInfoArray[currentIndex+1]))
                        break;
                    right+=1;
                    indexx+=1;
                    currentIndex = currentIndex+1;
                    faceInfoArray[currentIndex] = 0;
                }
                rightIndex = currentIndex;
                var tempLeftindex = leftIndex;
                var tempRightindex = rightIndex; 
                //前
                while (true) {
                    var yipai:Boolean = true;
                    tempLeftindex+=this.boundSize;
                    tempRightindex+=this.boundSize;
                    for (var i:number = tempLeftindex; i <= tempRightindex; i++) {
                        if (!faceInfoArray[i]) {
                            yipai = false;
                            break;
                        }
                    }
                    //如果這一排能合
                    if (!yipai) break;
                    if(front==this.boundSize-1) break;
                    for (var i:number = tempLeftindex; i <= tempRightindex; i++) 
                        faceInfoArray[i] = 0;
                    front += 1;
                }
                leftIndex = tempLeftindex;
                rightIndex = tempRightindex;
                //后
                while (true) {
                    var yipai:Boolean = true;
                    tempLeftindex-=this.boundSize;
                    tempRightindex-=this.boundSize;
                    for (var i:number = tempLeftindex; i <= tempRightindex; i++) {
                        if (!faceInfoArray[i]) {
                            yipai = false;
                            break;
                        }
                    }
                    //如果這一排能合
                    if (!yipai) break;
                    if(back==0) break;
                    for (var i:number = tempLeftindex; i <= tempRightindex; i++) 
                        faceInfoArray[i] = 0;
                    back -= 1;
                    
                }
                startPos.push(new Vector3(left,y,back));
                heightWidth.push(right + 1 - left);
                heightWidth.push(front + 1 - back);
                break;
            }
    }
}