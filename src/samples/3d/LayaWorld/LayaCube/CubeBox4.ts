import { Vector3 } from "laya/d3/math/Vector3";

export enum CubeBox4features{
    color = 0,
    //uv = 1,
    length = 1
}
export class CubeBox4{
    static CubeActualSize:number = 0.1;
    static FULL32:number =-1;
    static FULLBORDER_LOW:number = 0x799fffff;
    static FULLBORDER_HIGHT:number =0x7ffff99f;
    static CUBESIZE = 4;
    static CUBEBOX4MOD = 3;
    static _pool:Array<CubeBox4> = [];
    static BOX4COUNT = 64;
    static IndexPos:Array<Vector3> = [];
    public static init(){
        for(let y = 0;y<4;y++){
            for(let z = 0;z<4;z++){
                for(let x = 0;x<4;x++){
                    this.IndexPos.push(new Vector3(x,y,z));
                }
            }
        }
    }

    
    public static create():CubeBox4 {
        if (CubeBox4._pool.length) {
            let nodeInfo = CubeBox4._pool.pop();
            nodeInfo._inpool = false;
            
        } else {
            return new CubeBox4();
        }
    }
    public static recover( nodeInfo:CubeBox4){
        if (nodeInfo)
        {
            if (!nodeInfo._inpool){
                nodeInfo._inpool = true;
                CubeBox4._pool.push(nodeInfo);
                nodeInfo.clear();
            }
        }
    }

    static __release__():void
    {

        CubeBox4._pool.length = 0;
    }

    //是否在对象池中
    private _inpool:boolean;
    //下数据
    _dataLow:number=0;//4
    //上数据
    _dataHight:number = 0;//4
    //属性数据队列
    propertyDataArray:Uint32Array[] = [];

    /**
     * 创建CubeBox4
     */
    constructor(){
        for(let i = 0 ;i<CubeBox4features.length;i++){
            this.propertyDataArray[i] = new Uint32Array(64);
        }
    }

    


    //是否为空
    isEmpty():boolean{
        return this._dataLow === 0 && this._dataHight === 0;
    }

    isFull():boolean{
        return (this._dataHight ===CubeBox4.FULL32 && this._dataLow ===CubeBox4.FULL32);
    }


    //这个要改，改成&一个四周的位标记
    isFaceFull():boolean
    {
        if (this._dataHight ===CubeBox4.FULL32 && this._dataLow ===CubeBox4.FULL32) return true;
        return (this._dataLow & 0x80000000) && (this._dataHight & 0x80000000) && ((this._dataLow & CubeBox4.FULLBORDER_LOW) === CubeBox4.FULLBORDER_LOW && (this._dataHight & CubeBox4.FULLBORDER_HIGHT) === CubeBox4.FULLBORDER_HIGHT);
    }

    getIndexOfProperty(x:number,y:number,z:number){
        return  (x&CubeBox4.CUBEBOX4MOD) + ((y&CubeBox4.CUBEBOX4MOD) << 4) + ((z&CubeBox4.CUBEBOX4MOD) << 2);
    }


    
    hasProperty(propertytype:CubeBox4features,property:number):boolean
    {
        return (this.indexOfProperty(propertytype,property)>=0);
    }

    indexOfProperty(propertytype:CubeBox4features,property:number):number
    {
        for (var i:number = 0; (i < CubeBox4.BOX4COUNT); i++)
            if (this.propertyDataArray[propertytype][i] === propertytype) return i;
        return -1;
    }

    getPropertyValue(propertyType:CubeBox4features,x:number, y:number, z:number):number {
        return this.propertyDataArray[propertyType][ this.getIndexOfProperty(x,y,z)];
    }


    /**
     * 增加一个 或者设置属性
     * @param x 
     * @param y 
     * @param z 
     * @param propertype 
     * @param property 
     * @returns true 和false表示是否增加了Cube
     */
	set1x1x1(x:number, y:number, z:number, propertype:CubeBox4features,property:number):boolean {
        var offset:number = (x&CubeBox4.CUBEBOX4MOD) + ((y&CubeBox4.CUBEBOX4MOD) << 4) + ((z&CubeBox4.CUBEBOX4MOD) << 2);			
        if ( this.propertyDataArray[propertype][offset] === property)
            return false;
        this.propertyDataArray[propertype][offset]  = property;
        if ((offset < 32))
                this._dataLow |= 1 << offset;
        else this._dataHight |= 1 << (offset - 32);
        return true;
    }

    set1x1x1Propertys(x:number,y:number,z:number,property:Array<number>){
        var offset:number = (x&CubeBox4.CUBEBOX4MOD) + ((y&CubeBox4.CUBEBOX4MOD) << 4) + ((z&CubeBox4.CUBEBOX4MOD) << 2);			
        for(let i = 0, n=property.length;i<n;i++)
        this.propertyDataArray[i][offset]  = property[i];
        if ((offset < 32))
                this._dataLow |= 1 << offset;
        else this._dataHight |= 1 << (offset - 32);
        return true;
    }

    has1x1x1(x:number,y:number,z:number):boolean{
        var offset:number = (x&CubeBox4.CUBEBOX4MOD) + ((y&CubeBox4.CUBEBOX4MOD) << 4) + ((z&CubeBox4.CUBEBOX4MOD) << 2);			
        if ((offset < 32))
              return  !!(this._dataLow &(1 << offset));
        else !!(this._dataHight &( 1 << (offset - 32)));
    }

    getProperty1x1x1(x:number,y:number,z:number,propertype:CubeBox4features):number{
        var offset:number = (x&CubeBox4.CUBEBOX4MOD) + ((y&CubeBox4.CUBEBOX4MOD) << 4) + ((z&CubeBox4.CUBEBOX4MOD) << 2);			
        return this.propertyDataArray[propertype][offset];
    }


    remove1x1x1(x:number, y:number, z:number):boolean {
        var offset:number = (x&CubeBox4.CUBEBOX4MOD) + ((y&CubeBox4.CUBEBOX4MOD) << 4) + ((z&CubeBox4.CUBEBOX4MOD) << 2);			
        if ((offset < 32))
             this._dataLow &= ~(1 << offset);
        else this._dataHight &= ~(1 << (offset - 32));
        //清空数据
        
        for(let i = 0, n=CubeBox4features.length;i<n;i++)
        this.propertyDataArray[i][offset]  = 0;
        //TODO:
        // if (this._dataLow === 0 && this._dataHight === 0)
        //     box64.removeBox8((<CubeBox8Full>this ),indexOfBox64);
        return true;
    }

    setFullProperty(){
        //TODO
    }

    setFullPropertys(){
        //TODO
    }

    returnPropertyKeys(){
        let key:string = "";
        for(let i = 0;i<CubeBox4features.length;i++){
            let array: Uint32Array = this.propertyDataArray[i];
            let proValue = 0;
            for(var j = 0;j<64;j++){
                if(!proValue&&!array[j]){
                    proValue = array[j];
                    continue;
                }
                if(array[j]&&array[j]!=proValue){
                    return null;
                }
            }
            key+=proValue.toString()+".";
        } 
        return key;
    }
    

    clear(){
       this._dataHight = 0;
       this._dataLow = 0;
       for(let i = 0 ;i<CubeBox4features.length;i++){
        this.propertyDataArray[i] = new Uint32Array(64);
    }

    }
    //TODO:
    destroy():void{
        this._dataHight = 0;
        this._dataLow = 0;
        for(let i = 0 ;i<CubeBox4features.length;i++){
         this.propertyDataArray[i] = null;
     }
    }



}