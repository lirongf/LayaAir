/**
	 * ...
	 * @author ...
	 */
	export class VoxData {

		private sizex:number=0;
		private sizey:number=0;
		private sizez:number=0;
	
		//将值传入根据x,y,z的值取值
		
		 voxels:number[] = [];
		 count:number=0;
		
		constructor(_voxels:Uint8Array, xsize:number, ysize:number, zsize:number, pal:Uint32Array){// ColorPlane:int) {
			this.sizex = xsize;
			this.sizey = zsize;
			this.sizez = ysize;
	
			for (var j:number = 0; (j < _voxels.length); j += 4) {
				this.voxels.push(((<number>_voxels[j] )));
				this.voxels.push(((<number>_voxels[j + 2] )));
				this.voxels.push(this.sizez - ((<number>_voxels[j + 1] )));
				if ((pal[_voxels[j + 3] - 1] & 0xffffff) == 0)
				{
					this.voxels.push(0x010101);
				}
				else
				{
					this.voxels.push((pal[_voxels[j + 3] - 1]) & 0xffffff);
				}
				/*
				if (ColorPlane == 0)
					voxels.push(VoxFileData.turecolor[_voxels[j + 3] as int]);
				else
					voxels.push(VoxFileData.TextureColor[_voxels[j + 3] as int]);
				*/
			}
			this.count = this.voxels.length / 4;
		}
	}


