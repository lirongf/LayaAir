import { Byte } from "laya/utils/Byte";

	
	/**
	 * ...
	 * @author laoxie
	 */
	export class CompressIDS {
		private static COMTYPE_END:number = 0;//2位:ID的递增(0-4)，2位是数量:0-4
		private static COMTYPE_22:number = 16;//2位:ID的递增(0-4)，2位是数量:0-4
		private static COMTYPE410:number = 32;//4位ID，一个字节连续
		private static COMTYPE411:number = 48;//4位ID+1字节ID，1个字节连续
		private static COMTYPE421:number = 64;//4位ID+2字节ID，1字节连续
		private static COMTYPE422:number = 80;//4位ID+2字节ID，2个字节连续
		private static COMTYPE042:number = 96;//4字节ID，2个字节连续
		private static COMTYPE_440:number = 112;//4字节ID，2位连续
		private static COMTYPE_441:number = 128;//4字节ID，2位连续+一字节连续
		private static COMTYPE_ONE_ID32:number = 144;//4字节ID，2位连续+一字节连续
		private static COMTYPE_ONE_ID4_8:number = 160;//4字节ID，2位连续+一字节连续
		private static COMTYPE_ONE_ID4_16:number = 176;//4字节ID，2位连续+一字节连续
		private static COMTYPE_SAMESTEP_SHORTCOUNT:number = 192;//均匀间隔的连续，4位连续，一个字节间隔
		private static COMTYPE_SAMESTEP_SHORTSTEP:number = 208;//均匀间隔的连续，4位间隔，一个字节连续
		private static COMTYPE_SAMESTEP:number = 224;//均匀间隔的连续，4位间隔，一个字节连续
		
		private _nums:any[] = [];
		private _length:number = 0;
		
		 _value:any;
		
		constructor(){
		
		}
		
		 add(value:number):CompressIDS {
			if ((this._nums.length <= this._length))
				this._nums.length += 1024;
			this._nums[this._length++]=value;
			return this;
		}
		
		 destroy():void
		{
			this._value = null;
			this._nums = null;
			this._length = 0;
		}
		
		 get nums():any[] {
			return this._nums;
		}
		
		 compress(byte:Byte):Byte {
			/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
			byte || (byte = new Byte());
			var nums:any[] = this._nums;
			var id:number=0;
			
			if(this._length && this._length!==this._nums.length)
				this._nums.length = this._length;
			this._length = 0;
			
			if ((this._nums.length < 1))
				return byte;
			
			if (this._nums.length === 1)
			{
				id = this._nums[0];
				if ((id < 0xFFF))
				{				
					byte.writeUint8(CompressIDS.COMTYPE_ONE_ID4_8 | (id>>8) );
					byte.writeUint8(id&0xFF);
				}
				else if ((id < 0xFFFFF))
				{
					byte.writeUint8(CompressIDS.COMTYPE_ONE_ID4_16 | (id>>16) );
					byte.writeUint16(id&0xFFFF);
				}
				else {
					byte.writeUint8(CompressIDS.COMTYPE_ONE_ID32);
					byte.writeUint32(id);
				}
				return byte;
			}
			
			//@ts-ignore
			nums.sort(function(a:number, b:number):boolean {
				//@ts-ignore
				return a - b;
			});
			
			//trace(nums);
			
			var num:number = nums[0];
			var preID:number = 0;
			var count:number = 1;
			for (var i:number = 1, n:number = nums.length; (i <= n); i++, count++) {
				
				if ((nums[i] - nums[i - 1]) === 1 && (count < 0xFFFF)) 
					continue;
					
				id = num - preID;
				//trace(i,num,id);
				if ((id < 4) && (count < 4)) {
					byte.writeUint8(CompressIDS.COMTYPE_22 | (id << 2) | count);
				}
				else if ((id < 16) && (count < 128)) {
					byte.writeUint8(CompressIDS.COMTYPE410 | id);
					byte.writeUint8(count);
				}
				else if ((count < 16) && (id < 128)) {
					byte.writeUint8(CompressIDS.COMTYPE410 | count);
					byte.writeUint8(id | 128);
				}
				else if ((id < 0xFFF) && (count < 255)) {//4位ID+1字节ID，1个字节连续
					byte.writeUint8(CompressIDS.COMTYPE411 | (id >> 8));
					byte.writeUint8(id&0xFF);
					byte.writeUint8(count);
				}
				else if ((id < 0xFFFFF) && (count < 255)) {//4位ID+2字节ID，1字节连续
					byte.writeUint8(CompressIDS.COMTYPE421 | (id >> 16));
					byte.writeUint16(id&0xFFFF);
					byte.writeUint8(count);
				}
				else if ((id < 0xFFFFF) && (count < 0xFFFF)) {//4位ID+2字节ID，2字节连续
					byte.writeUint8(CompressIDS.COMTYPE422 | (id >> 16));
					byte.writeUint16(id&0xFFFF);
					byte.writeUint16(count);
				}
				else if ((count < 16))
				{
					byte.writeUint8(CompressIDS.COMTYPE_440 | count);
					byte.writeUint32(id);
				}
				else if ((count < 0xFFF))
				{
					byte.writeUint8(CompressIDS.COMTYPE_441 | (count >> 8));
					byte.writeUint8(count & 0xFF);
					byte.writeUint32(id);
				}
				else {
					byte.writeUint8(CompressIDS.COMTYPE042);
					byte.writeUint32(id);
					byte.writeUint16(count);
				}
				
				var step:number =  nums[i] - nums[i - 1];
				if ((step > 1) && (step<0x7FFF) && (nums[i+1] - nums[i])===step &&  (nums[i+2] - nums[i+1])===step)
				{
					var endn:number = Math.min(n, i + 256);
					for (var k:number = i; (k < endn); k++)
					{
						if ( (nums[k] - nums[k - 1]) !== step)
							break;
					}
					
					count = k - i - 1;
					
					if ((count < 16) && (step < 256))
					{
						byte.writeUint8(CompressIDS.COMTYPE_SAMESTEP_SHORTCOUNT | count);
						byte.writeUint8(step);
					}
					else if ((step < 16))
					{
						byte.writeUint8(CompressIDS.COMTYPE_SAMESTEP_SHORTSTEP | step);
						byte.writeUint8(count);
					}
					else{
						byte.writeUint8(CompressIDS.COMTYPE_SAMESTEP | ((step<256)?0:1));
						byte.writeUint8(count);
						(step < 256)?byte.writeUint8(step):byte.writeUint16(step);
					}
					
					//trace("step:",id,count, step);
					i = k-1;
					num = nums[i];
					preID = num-1;
					count = 0;
				}
				else
				{
					preID = num + count;
					//if ((preID-1) != nums[i - 1]) trace("err:" + preID , nums[i - 1]);
					num = nums[i];
					count = 0;
					//trace(preID, num);
				}
			}
			byte.writeUint8(CompressIDS.COMTYPE_END);
			//trace("压缩 原来尺寸:" + nums.length * 4, "现在:" + byte.length, "压缩比:" + (nums.length * 4 / byte.length));
			return byte;
		}
		
		 uncompress(byte:Byte):any[] {
			/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
			var nums:any[] = this._nums;
			nums.length = 1000;
			var type:number=0;
			var continues:boolean = true;
			var id:number = 0;
			var count:number=0;
			var i:number=0;
			var step:number = 1;
			var index:number = 0;
			var tmpi:number = 0;
			var counts:any= {};
			
			while (true) {
				
				type = byte.readUint8();
				step = 1;
				switch (type & 0xF0) {
				case CompressIDS.COMTYPE_END:
					continues = false;
					break;
				case CompressIDS.COMTYPE_ONE_ID32:
					continues = false;
					nums[index++] = byte.readUint32();
					//counts[COMTYPE_ONE_ID32]++;
					break;
				case CompressIDS.COMTYPE_ONE_ID4_8:
					continues = false;
					nums[index++] = ( ((type & 0xF) << 8) | byte.readUint8());
					//counts[COMTYPE_ONE_ID4_8]++;
					break;
				case CompressIDS.COMTYPE_ONE_ID4_16:
					continues = false;
					nums[index++] = ((type & 0xF) << 16) | byte.readUint16();
					//counts[COMTYPE_ONE_ID4_16]++;
					break;
				case CompressIDS.COMTYPE_22: 
					id += (type >> 2) & 3;
					count = type & 3;
					//counts[COMTYPE_22]++;
					break;
				case CompressIDS.COMTYPE410: 
					tmpi = byte.readUint8();
					if ((tmpi < 128))
					{
						id += type & 0xF;
						count = tmpi;
					}
					else
					{
						id += tmpi - 128;
						count=type & 0xF;
					}
					//counts[COMTYPE410]++;
					break;
				case CompressIDS.COMTYPE411:
					id += ( ((type & 0xF)<<8) | byte.readUint8());
					count = byte.readUint8();
					//counts[COMTYPE411]++;
					break;
				case CompressIDS.COMTYPE421:					
					id += ( ((type & 0xF)<<16) | byte.readUint16());
					count = byte.readUint8();
					//counts[COMTYPE421]++;					
					break;
				case CompressIDS.COMTYPE422:
					id += ( ((type & 0xF)<<16) | byte.readUint16());
					count = byte.readUint16();
					//counts[COMTYPE422]++;
					break;
				case CompressIDS.COMTYPE042: 
					id += byte.readUint32();
					count = byte.readUint16();
					//counts[COMTYPE042]++;
					break;
				case CompressIDS.COMTYPE_440:
					//var id0:int = id;
					count = type & 0xF;
					id += byte.readUint32();
					//counts[COMTYPE_440]++;
					//trace(id - id0, count);
					break;
				case CompressIDS.COMTYPE_441:
					count= ( ((type & 0xF)<<8) | byte.readUint8());
					id += byte.readUint32();
					//counts[COMTYPE_441]++;
					break;
				case CompressIDS.COMTYPE_SAMESTEP_SHORTCOUNT:
					count = type & 0xF;
					step = byte.readUint8();
					//counts[COMTYPE_SAMESTEP_SHORTCOUNT]++;
					break;
				case CompressIDS.COMTYPE_SAMESTEP_SHORTSTEP:
					step = type & 0xF;
					count = byte.readUint8();
					//counts[COMTYPE_SAMESTEP_SHORTSTEP]++;
					break;
				case CompressIDS.COMTYPE_SAMESTEP:
					count = byte.readUint8();
					step = (type & 0xF)?byte.readUint16():byte.readUint8();
					//counts[COMTYPE_SAMESTEP]++;
					break;
				default: 
					throw "err";
				}
				
				if (!continues) 
					break;
					
				if (step === 1)
				{
					for (i = 0; (i < count); i++) nums[index++]=id++;
				}
				else
				{
					id += step - 1;
					for (i = 0; (i < count); i++, id += step) nums[index++]=id;
					id--;
				}
			}
			nums.length = index;
			return nums;
		}
	}


