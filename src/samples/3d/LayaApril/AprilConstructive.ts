import { AprilArea } from "./Aprilmath/AprilArea";
import { AprilTree } from "./Aprilmath/AprilTree";
import { AprilVector } from "./Aprilmath/AprilVector";
import { AprilVertex } from "./Aprilmath/AprilVertex";
class AreaObj
{
  ver:number[];
  index:number[];
  PosMap;
}

export class AprilConstructive {

    areas:AprilArea[];
    static vertexUnitSize:number = 8;//3pos 3normal 2uv
    //生成新的结构
    fromAreas(areas1:AprilArea[]) :AprilConstructive{
        var base = new AprilConstructive();
        base.areas = areas1;
        return base;
      };

    clone(): AprilConstructive {
        var base = new AprilConstructive();
        base.areas = this.areas.map(function(p) { return p.clone(); });
        return base;
      }

      toAreas(): AprilArea[] {
        return this.areas;
      }

    // 
    //     A.addition(B)
    // 
    //     +-------+            +-------+
    //     |       |            |       |
    //     |   A   |            |       |
    //     |    +--+----+   =   |       +----+
    //     +----+--+    |       +----+       |
    //          |   B   |            |       |
    //          |       |            |       |
    //          +-------+            +-------+
    // 

  addition(base:AprilConstructive): AprilConstructive{
      var a = new AprilTree(this.clone().areas);
      var b = new AprilTree(base.clone().areas);
      a.cut(b);
      b.cut(a);
      //后面这些挺奇怪的
      //b.transpose();
      //b.cut(a);
      //b.transpose();
      a.create(b.allAreas());
      return base.fromAreas(a.allAreas());
  }

      // 
  //     A.subtraction(B)
  // 
  //     +-------+            +-------+
  //     |       |            |       |
  //     |   A   |            |       |
  //     |    +--+----+   =   |    +--+
  //     +----+--+    |       +----+
  //          |   B   |
  //          |       |
  //          +-------+
  // 
  subtraction(base:AprilConstructive): AprilConstructive  {
    var a = new AprilTree(this.clone().areas);
    var b = new AprilTree(base.clone().areas);
    a.transpose();
    a.cut(b);
    b.cut(a);
    b.transpose();
    b.cut(a);
    b.transpose();
    a.create(b.allAreas());
    a.transpose();
    return base.fromAreas(a.allAreas());
  }

  // 
  //     A.intersection(B)
  // 
  //     +-------+
  //     |       |
  //     |   A   |
  //     |    +--+----+   =   +--+
  //     +----+--+    |       +--+
  //          |   B   |
  //          |       |
  //          +-------+
  // 
  intersection(base:AprilConstructive): AprilConstructive{
    var a = new AprilTree(this.clone().areas);
    var b = new AprilTree(base.clone().areas);

    a.transpose();
    b.cut(a);
    b.transpose();
    a.cut(b);
    b.cut(a);
    a.create(b.allAreas());
    a.transpose();
    return base.fromAreas(a.allAreas());
  }

  inverse(): AprilConstructive {
    var base = this.clone();
    base.areas.map(function(p) { p.flip(); });
    return base;
  }

// Example code:
// 
//     var cube = BASE.cube({
//       center: [0, 0, 0],
//       radius: 1
//     });



  cube(options) :AprilConstructive{
   
    console.log(options);
    var c:AprilVector = new AprilVector(options.center[0],options.center[1],options.center[2]);
    var r:number = options.radius;
    var nColor = options.color;
    var nPoint:any=[
      [[0, 4, 6, 2], [-1, 0, 0]],
      [[1, 3, 7, 5], [+1, 0, 0]],
      [[0, 1, 5, 4], [0, -1, 0]],
      [[2, 6, 7, 3], [0, +1, 0]],
      [[0, 2, 3, 1], [0, 0, -1]],
      [[4, 5, 7, 6], [0, 0, +1]]
    ];

    var nArea=[];
    for(var i=0; i<nPoint.length; ++i)
    {
        var nAry=[];
        for(var z=0; z<nPoint[i][0].length; ++z)
        {
          var nx = !!(nPoint[i][0][z] & 1);
          var ny = !!(nPoint[i][0][z] & 2);
          var nz = !!(nPoint[i][0][z] & 4);
          var tx:number = 0,ty:number=0,tz:number=0;
          if(nx)tx=1.0;
          if(ny)ty=1.0;
          if(nz)tz=1.0;
           var x:number = c.x + r * (2 * tx - 1);
           var y:number = c.y + r * (2 * ty - 1);
           var vz:number = c.z + r * (2 * tz - 1);
          var pos:AprilVector = new AprilVector(x,y,vz);
          var normal:AprilVector =  new AprilVector(nPoint[i][1][0],nPoint[i][1][1],nPoint[i][1][2]);
          var uv:AprilVector = new AprilVector(0,0,0);
          console.log("x:",x,"y:",y,"z:",vz);
          var nVer:AprilVertex = new AprilVertex(pos, normal,uv);
           nAry.push(nVer);
        }
        console.log("------------");
       var nBP= new AprilArea(nAry,nColor);
       nArea.push(nBP);
    }
    
    return this.fromAreas(nArea);
  };

  // Example usage:
// 
//     var sphere = BASE.sphere({
//       center: [0, 0, 0],
//       radius: 1,
//       slices: 16,
//       stacks: 8,
//       shared:0
//     });
  sphere(options):AprilConstructive {
    options = options || {};
    var c = new AprilVector(options.center[0],options.center[1],options.center[2]);
    var r = options.radius;
    var slices = options.slices;
    var stacks = options.stacks;

    var areas = [], vertices;
    function vertex(theta, phi) {
      theta *= Math.PI * 2;
      phi *= Math.PI;
      var dir = new AprilVector(
        Math.cos(theta) * Math.sin(phi),
        Math.cos(phi),
        Math.sin(theta) * Math.sin(phi)
      );
      vertices.push(new AprilVertex(c.plus(dir.times(r)), dir,new AprilVector(0,0,0)));
    }
    for (var i = 0; i < slices; i++) {
      for (var j = 0; j < stacks; j++) {
        vertices = [];
        vertex(i / slices, j / stacks);
        if (j > 0) vertex((i + 1) / slices, j / stacks);
        if (j < stacks - 1) vertex((i + 1) / slices, (j + 1) / stacks);
        vertex(i / slices, (j + 1) / stacks);
        areas.push(new AprilArea(vertices,options.shared));
      }
    }
    return this.fromAreas(areas);
  };

    //根据输入几何体获取分类好的几何体
  GetAreaMap(areas:AprilArea[],nAreaMap,matAry:number[][]):any  {

    var PosMap1 = new Map();
    var PosMap2 = new Map();
    for(var i:number=0;i<areas.length;++i)
    {
        //组织顶点数据
        var outObj= new AreaObj();
        
        outObj.ver = [];
        outObj.index = [];
        outObj.PosMap = new Map();

        var nColor = areas[i].shared;

        if(nAreaMap.has(nColor))
          outObj = nAreaMap.get(nColor);

        //获取顶点
        var nL = areas[i].vertices.length;

        var tempIndex=0;
        for(var j:number=2;j<nL;++j)
        {
          //变换矩阵到本地空间
          function vertex(index:number):number
          {
            var verTex:AprilVertex = areas[i].vertices[index];
            //优化关闭
            // if(outObj.PosMap.has( verTex.pos.x + ',' + verTex.pos.y + ',' + verTex.pos.z ))
            // {
            //     var nOutIndex:number = outObj.PosMap.get( verTex.pos.x + ',' + verTex.pos.y + ',' + verTex.pos.z);
            //     outObj.ver[nOutIndex*AprilConstructive.vertexUnitSize+3] = verTex.normal.x;
            //     outObj.ver[nOutIndex*AprilConstructive.vertexUnitSize+4] = verTex.normal.y;
            //     outObj.ver[nOutIndex*AprilConstructive.vertexUnitSize+5] = verTex.normal.z;
            //     return nOutIndex;
            // }
            // else{//优化关闭end
              //pos.mulMatrix4(this.invertMat(matAry[(nColor)]))
              outObj.ver.push(verTex.pos.x, verTex.pos.y,verTex.pos.z,
                verTex.normal.x,
                verTex.normal.y,
                verTex.normal.z,
                verTex.uv.x,
                verTex.uv.y
              );//顶点//法线 //UV  
              var nIndexTemp = (outObj.ver.length/AprilConstructive.vertexUnitSize)-1;
              outObj.PosMap.set(verTex.pos.x + ',' + verTex.pos.y + ',' + verTex.pos.z,nIndexTemp);
              return nIndexTemp;
              //优化关闭
          //  }
          //优化关闭end
          }
          outObj.index.push(vertex(0));
          outObj.index.push(vertex(j-1));
          outObj.index.push(vertex(j));
        }
        nAreaMap.set(nColor,outObj);
    }
    return nAreaMap;
  }

  GetArea4ByTriangleBUF(inVB:[],inVI:[],mat:number[],matIndex:any):AprilConstructive
  {
    //构建共边三角形
    var nArea:AprilArea[]=[];
    var edgeMap=new Map();
    function edgeCheck(vIndex1,vIndex2,vIndex3,nIndex) 
     {
        var edge = vIndex1+","+vIndex2;
        var edge1 = vIndex2+","+vIndex1;
        if(edgeMap.has(edge)){
          var nList = edgeMap.get(edge);
          nList.push([nIndex/3,vIndex3])
        }else if(edgeMap.has(edge1)){
          var nList = edgeMap.get(edge1);
          nList.push([nIndex/3,vIndex3])
        }else{
          edgeMap.set(edge,[[nIndex/3,vIndex3]]);
        }
     }
    //构建三角形的边和邻近三角形，一个边上有两个三角形
    for(var i:number=0;i<inVI.length; i+=3)
    {
     
     edgeCheck(inVI[i],inVI[i+1],inVI[i+2],i);
     edgeCheck(inVI[i+1],inVI[i+2],inVI[i],i);
     edgeCheck(inVI[i+2],inVI[i],inVI[i+1],i);
    }
    //共边三角形构建结束
    //console.log("edgeMap");
    //console.log(edgeMap);

    //已经构建过四边形的三角形
    var closeTriang=new Map();

    function GetEdgeTriang(vIndex1,vIndex2)
    {
        var edge = vIndex1+","+vIndex2;
        var edge1 = vIndex2+","+vIndex1;
        if(edgeMap.has(edge)){
          return edgeMap.get(edge);
        }else if(edgeMap.has(edge1)){
          return edgeMap.get(edge1);
        }else{
          return [];
        }
    }

    function GetArea4VBI(index1:number,index2:number,index3:number,indexTer):boolean
    {
         //获取边上的两个三角形
      var nTrList = GetEdgeTriang(index1,index2);
      if(nTrList.length<=1)
        return false;
      if( closeTriang.has(nTrList[0][0]))
        return false;
      if(closeTriang.has(nTrList[1][0]))
       return false;

      //获取顶点的法线信息，角度比较
      var nTerIndex = nTrList[0][0]*3;
      var nTerIndex2 = nTrList[1][0]*3;
      var nAry:AprilVertex[]=[];
      function vertex(index:number) 
      {
        var pos:AprilVector = new AprilVector(inVB[index][0],inVB[index][1],inVB[index][2]);
        //pos.mulMatrix4(mat);
        var normal:AprilVector = new AprilVector(inVB[index][3],inVB[index][4],inVB[index][5]);
        var uv:AprilVector = new AprilVector(inVB[index][6],inVB[index][7],0);
        var nVer:AprilVertex = new AprilVertex(pos, normal,uv);
          nAry.push(nVer);
      }

      vertex(index1);
      var tempIndex;
      if(nTerIndex==indexTer){ tempIndex = nTrList[1][1];}
      else if(nTerIndex2 == indexTer) {tempIndex = nTrList[0][1];}
      vertex(tempIndex);
      vertex(index2);
      vertex(index3);
      //console.log("三角形：",index1,",",tempIndex,",",index2,",",index3);
      
      nArea.push(new AprilArea(nAry,matIndex));
      //console.log(nAry);
      closeTriang.set(nTerIndex2/3,0);
      closeTriang.set(nTerIndex/3,0);
  
      return true;

    }
    for(var i:number=0;i<inVI.length; i+=3)
    {
      
      //检测关闭列表
      if(closeTriang.has(i/3))
        continue;

      if(GetArea4VBI(inVI[i],inVI[i+1],inVI[i+2],i))
        continue;
      else if(GetArea4VBI(inVI[i+1],inVI[i+2],inVI[i],i))
        continue;
      else if(GetArea4VBI(inVI[i+2],inVI[i],inVI[i+1],i))
        continue;
      else{
        var nAry:AprilVertex[]=[];
        function vertex(index:number) 
        {
          var pos:AprilVector = new AprilVector(inVB[index][0],inVB[index][1],inVB[index][2]);
          //pos.mulMatrix4(mat);
          var normal:AprilVector = new AprilVector(inVB[index][3],inVB[index][4],inVB[index][5]);
          var uv:AprilVector = new AprilVector(inVB[index][6],inVB[index][7],0);
          var nVer:AprilVertex = new AprilVertex(pos, normal,uv);
            nAry.push(nVer);
        }

        vertex(inVI[i]);
        vertex(inVI[i+1]);
        vertex(inVI[i+2]);
        //console.log("三角形：",inVI[i],",",inVI[i+1],",",inVI[i+2]);
        nArea.push(new AprilArea(nAry,matIndex));
        closeTriang.set(i/3,0);
      }
     
    }

    return this.fromAreas(nArea);
  }


  //根据数据生成AprilConstructive
  GetArea3ByTriangleBUF(inVB:[],inVI:[],mat:number[],matIndex:any):AprilConstructive
  {
    var nArea:AprilArea[]=[];
      // inVB一个顶点长度是vertexUnitSize
    for(var i:number=0;i<inVI.length; i+=3)
    {
      var nAry:AprilVertex[]=[];
      function vertex(index:number) 
      {
        //将点全部生成AprilVertex
        var pos:AprilVector = new AprilVector(inVB[index][0],inVB[index][1],inVB[index][2]);
        //pos.mulMatrix4(mat);
        var normal:AprilVector = new AprilVector(inVB[index][3],inVB[index][4],inVB[index][5]);
        var uv:AprilVector = new AprilVector(inVB[index][6],inVB[index][7],0);
        var nVer:AprilVertex = new AprilVertex(pos, normal,uv);
          nAry.push(nVer);
      }

     
      vertex(inVI[i]);
      vertex(inVI[i+1]);
      vertex(inVI[i+2]);
      //排除无效三角形
      if(nAry[0].pos.additionLine(nAry[1].pos,nAry[2].pos)===false)
        nArea.push(new AprilArea(nAry,matIndex));//生成AprilArea
      else{
        console.log("error Triangle")
      }
    }
    return this.fromAreas(nArea);
  }

  //通过VB VB 获取Arpil的area
  GetAprilConstructiveBy(inVB:[],inVI:[],mat:number[],matIndex:any):AprilConstructive{
    //if(matIndex==0)
       return this.GetArea3ByTriangleBUF(inVB,inVI,mat,matIndex);
   // else 
    //   return this.GetArea4ByTriangleBUF(inVB,inVI,mat,matIndex);
  }

  //  any map[0，outObj]
  //  var outObj={
  //   ver:[],
  //   index:[]
  // }
  // inVB一个顶点长度是pos+ normal==6
  AprilGeoSubtract(inVB1,inVI1,inVB2,inVI2):any  {
    var mat1:number[] = [1,0,0,0,
      0,1,0,0,
      0,0,1,0,
      0,0,0,1];
    var nAreaMap= new Map();

    var vGeo1 = this.GetAprilConstructiveBy(inVB1,inVI1,mat1,0);
    var vGeo2 = this.GetAprilConstructiveBy(inVB2,inVI2,mat1,1);

    var bc:AprilConstructive = vGeo1.subtraction(vGeo2);
    nAreaMap = bc.GetAreaMap(bc.areas,nAreaMap,[mat1,mat1]);
    return nAreaMap;
  }

  /**
   * 交集
   * @param inVB1 
   * @param inVI1 
   * @param inVB2 
   * @param inVI2 
   * @returns 
   */
  AprilGeoIntersect(inVB1,inVI1,inVB2,inVI2):any  {
    var mat1:number[] = [1,0,0,0,
      0,1,0,0,
      0,0,1,0,
      0,0,0,1];
    var nAreaMap= new Map();
    //又生成了一遍数据，这里是不是有点点多余
    var vGeo1 = this.GetAprilConstructiveBy(inVB1,inVI1,mat1,0);
    var vGeo2 = this.GetAprilConstructiveBy(inVB2,inVI2,mat1,1);
    //
    var bc:AprilConstructive = vGeo1.intersection(vGeo2);
    nAreaMap = bc.GetAreaMap(bc.areas,nAreaMap,[mat1,mat1]);
    return nAreaMap;
  }


  /**
   * 并集
   * @param inVB1 
   * @param inVI1 
   * @param inVB2 
   * @param inVI2 
   * @returns 
   */
  AprilGeoUnion(inVB1,inVI1,inVB2,inVI2):any  {
    var mat1 = [1,0,0,0,
      0,1,0,0,
      0,0,1,0,
      0,0,0,1];

    var nAreaMap= new Map();
    //根据顶点索引生成AprilConstructive
    var vGeo1 = this.GetAprilConstructiveBy(inVB1,inVI1,mat1,0);
    var vGeo2 = this.GetAprilConstructiveBy(inVB2,inVI2,mat1,1);
    //
    var bc:AprilConstructive = vGeo1.addition(vGeo2);
    nAreaMap = bc.GetAreaMap(bc.areas,nAreaMap,[mat1,mat1]);
    return nAreaMap;
  }

  /**
   * 根据顶点 索引切割Mesh，返回切割完的顶点 索引
   * @param inVB1 
   * @param inVI1 
   * @param inVB2 
   * @param inVI2 
   * @returns 
   */
  AprilGetOutSub(inVB1,inVI1,inVB2,inVI2)  :any  {
    var nAreaMap1= new Map();
    nAreaMap1 = this.AprilGeoUnion(inVB1,inVI1,inVB2,inVI2);
    var nAreaMap2= new Map();
    nAreaMap2 =  this.AprilGeoIntersect(inVB1,inVI1,inVB2,inVI2);
    // if(nAreaMap2.has(0))
    //   nAreaMap1.set(2,nAreaMap2.get(0));
    // if(nAreaMap2.has(1))
    //   nAreaMap1.set(3,nAreaMap2.get(1));
    return nAreaMap1;
  }

  Test1():any{

    var nAreaMap= new Map();

      var cube = this.cube({
      center: [0, 0, 0],
      color: 0,
      radius: 0.5
      });
   

     var sphere = this.sphere({
      center: [0, 0, 0],
      radius: 0.65,
      slices: 16,
      stacks: 8,
      shared:1
    });


      var mat1 = [1,0,0,0,
                  0,1,0,0,
                  0,0,1,0,
                  0,0,0,1];
      var bc:AprilConstructive = cube.intersection(sphere);
      nAreaMap = bc.GetAreaMap(bc.areas,nAreaMap,[mat1,mat1]);

      console.log(nAreaMap);
      return nAreaMap;

}


  Test():any{

        var nAreaMap= new Map();

          var cube = this.cube({
          center: [0, 0, 0],
          color: 0,
          radius: 0.25
          });
          //nAreaMap = cube.GetAreaMap(cube.areas,nAreaMap);

          var cube1 = this.cube({
              center: [0.35, 0.35,0.35],
              color: 1,
              radius: 0.25
          });
          //nAreaMap = cube1.GetAreaMap(cube1.areas,nAreaMap);

          var mat1 = [1,0,0,0,
                      0,1,0,0,
                      0,0,1,0,
                      0,0,0,1];
          var bc:AprilConstructive = cube.subtraction(cube1);
          nAreaMap = bc.GetAreaMap(bc.areas,nAreaMap,[mat1,mat1]);

          console.log(nAreaMap);
          return nAreaMap;

  }
}