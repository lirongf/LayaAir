

import { AprilVertex } from "./AprilVertex";
import { AprilFace } from "./AprilFace";

//#类多边形



//表示凸多边形。用于初始化多边形的顶点必须
//共面形成凸环。他们不一定非得这样`base顶点`
//但它们的行为必须相似（duck类型可用于
//定制）。

//
//每个凸多边形都有一个“shared”属性，在所有多边形之间共享
//彼此克隆的多边形或从同一多边形分割的多边形。
//这可用于定义每多边形特性（例如曲面颜色）。

export class AprilArea {
    
    vertices:AprilVertex[];
    face:AprilFace;
    shared:number;

    constructor(vertices:AprilVertex[], shared:number) {
        this.vertices = vertices;
        this.shared = shared;
        this.face = AprilFace.fromPoints(vertices[0].pos, vertices[1].pos, vertices[2].pos);
    }

    clone(): AprilArea {
        var vertices = this.vertices.map(function(v) { return v.clone(); });
        return new AprilArea(vertices, this.shared);
      }

      flip(): void {
        this.vertices.reverse().map(function(v:AprilVertex) { v.flip(); });
        this.face.flip();
      }
}