
//顶点类 用来反转法线 插入新点 记录法线等功能
import { AprilVector } from "./AprilVector";
export class AprilVertex {
   pos:AprilVector;
   normal :AprilVector;
   uv:AprilVector;

    constructor( pos:AprilVector,
      normal :AprilVector,
      uv:AprilVector) {
         this.pos = new AprilVector(pos.x,pos.y,pos.z);
         this.normal = new AprilVector(normal.x,normal.y,normal.z);
         this.uv = new AprilVector(uv.x,uv.y,uv.z);
    }



    clone(): AprilVertex  {
      return new AprilVertex(this.pos.clone(), this.normal.clone(),this.uv.clone());
    }

    //反转所有方向特定数据（例如顶点法线
    flip(): void  {
      this.normal = this.normal.negated();
    }

    //通过线性方式在该顶点和“其他”之间创建一个新顶点,t插值位置
    interpolate(other:AprilVertex,t:number): AprilVertex{
      return new AprilVertex(
        this.pos.lerp(other.pos, t),
        this.normal.lerp(other.normal, t),
        this.uv.lerp(other.uv, t)
      );
    }
}