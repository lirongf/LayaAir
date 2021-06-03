import { VoxData } from "./VoxData";
/**
	 * ...
	 * @author ...
	 */
	export class VoxFileChunkChild {
		
		//VoxFileSize
		 Sizename:string;
		 SizechunkContent:number = 0;
		 SizechunkNums:number = 0;
		 Sizex:number = 0;
		 Sizey:number = 0;
		 Sizez:number = 0;
		//VoxFileXYZI
		 XYZIname:string;
		 XYZIchunkContent:number = 0;
		 XYZIchunkNums:number = 0;
		 XYZIvoxels:VoxData;
		
		
		
		constructor(){
			
		}
		
	}


