
import { AprilVector } from "./AprilVector";
import { AprilArea } from "./AprilArea";
export class AprilFace {
  normal:AprilVector;
  w :number;
  EPSILON:number = 1e-5;
  //无限大面的方法
    constructor(normal:AprilVector, w:number) {
      this.normal = normal;
      this.w = w;
  }

   clone(): AprilFace {
      return new AprilFace(this.normal.clone(), this.w);
    }

    //生成一个面  面用法线和一个小距离来表示  
    static fromPoints(a:AprilVector, b:AprilVector, c:AprilVector):AprilFace {
      var n:AprilVector = b.minus(a).cross(c.minus(a)).unit();
      return new AprilFace(n, n.dot(a));
    };

    flip(): void {
      this.normal = this.normal.negated();
      this.w = -this.w;
    }
    

  //minerTODO:
  //如果需要，按此平面拆分“area”，然后放置多边形或多边形
  //适当列表中的片段。共面多边形可分为
  //“共面前”或“共面后”取决于它们与
  //panel的关系。这个平面前面或后面的多边形进入
  //“前”或“后”。
    splitArea(area:AprilArea, coplanarFront:AprilArea[], coplanarBack:AprilArea[], front:AprilArea[], back:AprilArea[]):void {
      var COPLANAR = 0;//共面
      var FRONT = 1;//前
      var BACK = 2;//后
      var SPANNING = 3;//既有前 也有后
  

      //将每个点以及整个区域划分为上述区域之一
      var areaType = 0;
      var types = [];
      for (var i = 0; i < area.vertices.length; i++) {
        var t = this.normal.dot(area.vertices[i].pos) - this.w;
        var type = (t < -this.EPSILON) ? BACK : (t > this.EPSILON) ? FRONT : COPLANAR;
        areaType |= type;
        types.push(type);
      }
  
      //将区域放入正确的列表中，必要时将其拆分。
      switch (areaType) {
        case COPLANAR:
          (this.normal.dot(area.face.normal) > 0 ? coplanarFront : coplanarBack).push(area);
          break;
        case FRONT:
          front.push(area);
          break;
        case BACK:
          back.push(area);
          break;
        case SPANNING:
          var f = [], b = [];
          for (var i = 0; i < area.vertices.length; i++) {
            //获得三角形中的一个边
            var j = (i + 1) % area.vertices.length;
            //获得每个点的type  每个点的Type是Front Back COPLANAR
            var ti = types[i], tj = types[j];
            //获得顶点数据
            var vi = area.vertices[i], vj = area.vertices[j];
            //放入front 和back  如果是在area上面的点  放入两个队列
            if (ti != BACK) f.push(vi);
            if (ti != FRONT) b.push(ti != BACK ? vi.clone() : vi);
            //如果是跨域的线
            if ((ti | tj) == SPANNING) {
              var t = (this.w - this.normal.dot(vi.pos)) / this.normal.dot(vj.pos.minus(vi.pos));
              var v = vi.interpolate(vj, t);
              f.push(v);
              b.push(v.clone());
            }
          }
          //将三角形直接切开了
          if (f.length >= 3) front.push(new AprilArea(f, area.shared));
          if (b.length >= 3) back.push(new AprilArea(b, area.shared));
          break;
      }
    }
}