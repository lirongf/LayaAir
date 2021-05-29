

import { AprilVertex } from "./AprilVertex";
import { AprilFace } from "./AprilFace";
import { AprilArea } from "./AprilArea";
//保存二叉树中的节点。二叉树是从多边形集合中构建的
//通过拾取要分割的多边形。那个多边形（和所有其他共面的多边形）直接添加到该节点，其他多边形则添加到
//前子树和/或后子树。这不是一棵繁杂二叉树，内部节点和叶节点之间没有区别。

export class AprilTree {

    face:AprilFace = null;
    front:AprilTree = null;
    back:AprilTree = null;
    areas:AprilArea[] = [];

    constructor(areas:AprilArea[]=null) {
      this.face = null;
      this.front = null;
      this.back = null;
      this.areas = [];
      if (areas) this.create(areas);
    }

    clone(): AprilTree {
      var tree = new AprilTree();
      tree.face = this.face && this.face.clone();
      tree.front = this.front && this.front.clone();
      tree.back = this.back && this.back.clone();
      tree.areas = this.areas.map(function(p) { return p.clone(); });
      return tree;
    }

//将实心空间转换为空心空间，将空心空间转换为实心空间。
    transpose(): void{
      for (var i = 0; i < this.areas.length; i++) {
        this.areas[i].flip();
      }
      this.face.flip();
      if (this.front) this.front.transpose();
      if (this.back) this.back.transpose();
      var temp = this.front;
      this.front = this.back;
      this.back = temp;
    }

    //递归删除“areas”中位于此二叉树内的所有多边形
    clipAreas(areas:AprilArea[]): AprilArea[] {
      if (!this.face) return areas.slice();
      var front:AprilArea[] = [], back:AprilArea[] = [];
      for (var i = 0; i < areas.length; i++) {
        this.face.splitArea(areas[i], front, back, front, back);
      }
      if (this.front) front = this.front.clipAreas(front);
      if (this.back) back = this.back.clipAreas(back);
      else back = [];
      return front.concat(back);
    }

    //删除此二叉树中位于其他二叉树内的所有多边形
    cut(bsp:AprilTree): void{
      this.areas = bsp.clipAreas(this.areas);
      if (this.front) this.front.cut(bsp);
      if (this.back) this.back.cut(bsp);
    }

    //返回此二叉树中所有多边形的列表。
    allAreas(): AprilArea[]{
      var areas = this.areas.slice();
      if (this.front) areas = areas.concat(this.front.allAreas());
      if (this.back) areas = areas.concat(this.back.allAreas());
      return areas;
    }

 //用“areas”构建二叉树。在现有树上调用时
    //新的多边形被过滤到树的底部并成为新的
    //节点在那里。每组多边形使用第一个
    //（没有使用启发式来选择好的分割）
    create(areas:AprilArea[]): void {
      if (!areas.length) return;
      if (!this.face) this.face = areas[0].face.clone();
      var front = [], back = [];
      for (var i = 0; i < areas.length; i++) {
        this.face.splitArea(areas[i], this.areas, this.areas, front, back);
      }
      if (front.length) {
        if (!this.front) this.front = new AprilTree();
        this.front.create(front);
      }
      if (back.length) {
        if (!this.back) this.back = new AprilTree();
        this.back.create(back);
      }
    }
}