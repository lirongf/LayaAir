import { RenderableSprite3D } from "laya/d3/core/RenderableSprite3D";
import { LayaWorldRender } from "./LayaWorldRender";


export class LayaWorldSprite3D extends RenderableSprite3D{
    

    
    
    constructor(name:string){
        super(name);
        //@ts-ignore
        this._render = new LayaWorldRender(this);
    }

    
    destroy(){

    }
}