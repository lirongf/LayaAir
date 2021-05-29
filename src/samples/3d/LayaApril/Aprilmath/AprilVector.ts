/**
 * 自主组织的Vector3
 */
export class AprilVector {
    x: number;
    y: number;
    z: number;
    static EPSILON:number = 1e-5;
    constructor(x: number = 0, y: number = 0, z: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    mulMatrix4(mat4:number[]):void{
      var x = this.x, y = this.y, z = this.z;

		this.x = mat4[0] * x + mat4[4] * y + mat4[8]  * z + mat4[12];
		this.y = mat4[1] * x + mat4[5] * y + mat4[9]  * z + mat4[13];
		this.z = mat4[2] * x + mat4[6] * y + mat4[10] * z + mat4[14];
    }

    clone(): AprilVector {
       return new AprilVector(this.x,this.y,this.z);
    }

    negated(): AprilVector {
        return new AprilVector(-this.x,-this.y,-this.z);
     }

     plus(a:AprilVector ): AprilVector {
        return new AprilVector(this.x+a.x,this.y+a.y,this.z+a.z);
     }

     minus(a:AprilVector ): AprilVector {
        return new AprilVector(this.x-a.x,this.y-a.y,this.z-a.z);
     }

     times(a:number ): AprilVector {
        return new AprilVector(this.x*a,this.y*a,this.z*a);
     }

     dividedBy(a:number ): AprilVector {
        return new AprilVector(this.x/a,this.y/a,this.z/a);
     }

     dot(a:AprilVector ): number {
        return this.x*a.x+this.y*a.y+this.z*a.z;
     }

     additionLine(a:AprilVector,b:AprilVector):boolean
     {
      var AB= new AprilVector(b.x-a.x,b.y-a.y,b.z-a.z).length();
      var AC= new AprilVector(this.x-a.x,this.y-a.y,this.z-a.z).length();
      var BC = new AprilVector(this.x-b.x,this.y-b.y,this.z-b.z).length();
      var p =(AB+AC+BC)*0.5;
      var S = Math.sqrt(p*(p-AB)*(p-AC)*(p-BC));
      if(S<=AprilVector.EPSILON)
         return true;
      else
         return false;
     }


     lerp(a:AprilVector,t:number ): AprilVector {
        return this.plus(a.minus(this).times(t));
      }

      length(): number {
        return Math.sqrt(this.dot(this));
     }

     unit(): AprilVector {
        return this.dividedBy(this.length());
     }
     cross(a:AprilVector ): AprilVector{
        return new AprilVector(
          this.y * a.z - this.z * a.y,
          this.z * a.x - this.x * a.z,
          this.x * a.y - this.y * a.x
        );
      }

}