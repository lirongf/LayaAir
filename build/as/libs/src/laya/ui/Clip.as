package laya.ui {
	import laya.ui.UIComponent;
	import laya.ui.AutoBitmap;
	import laya.resource.Texture;
	import laya.utils.Handler;

	/**
	 * 图片加载完成后调度。
	 * @eventType Event.LOADED
	 */

	/**
	 * 当前帧发生变化后调度。
	 * @eventType laya.events.Event
	 */

	/**
	 * <p> <code>Clip</code> 类是位图切片动画。</p>
	 * <p> <code>Clip</code> 可将一张图片，按横向分割数量 <code>clipX</code> 、竖向分割数量 <code>clipY</code> ，
	 * 或横向分割每个切片的宽度 <code>clipWidth</code> 、竖向分割每个切片的高度 <code>clipHeight</code> ，
	 * 从左向右，从上到下，分割组合为一个切片动画。</p>
	 * Image和Clip组件是唯一支持异步加载的两个组件，比如clip.skin = "abc/xxx.png"，其他UI组件均不支持异步加载。
	 * @example <caption>以下示例代码，创建了一个 <code>Clip</code> 实例。</caption>
	 * @example Laya.init(640, 800);//设置游戏画布宽高
	 * @example import Clip = laya.ui.Clip;
	 */
	public class Clip extends UIComponent {

		/**
		 * @private 
		 */
		protected var _sources:Array;

		/**
		 * @private 
		 */
		protected var _bitmap:AutoBitmap;

		/**
		 * @private 
		 */
		protected var _skin:String;

		/**
		 * @private 
		 */
		protected var _clipX:Number;

		/**
		 * @private 
		 */
		protected var _clipY:Number;

		/**
		 * @private 
		 */
		protected var _clipWidth:Number;

		/**
		 * @private 
		 */
		protected var _clipHeight:Number;

		/**
		 * @private 
		 */
		protected var _autoPlay:Boolean;

		/**
		 * @private 
		 */
		protected var _interval:Number;

		/**
		 * @private 
		 */
		protected var _complete:Handler;

		/**
		 * @private 
		 */
		protected var _isPlaying:Boolean;

		/**
		 * @private 
		 */
		protected var _index:Number;

		/**
		 * @private 
		 */
		protected var _clipChanged:Boolean;

		/**
		 * @private 
		 */
		protected var _group:String;

		/**
		 * @private 
		 */
		protected var _toIndex:Number;

		/**
		 * 创建一个新的 <code>Clip</code> 示例。
		 * @param url 资源类库名或者地址
		 * @param clipX x方向分割个数
		 * @param clipY y方向分割个数
		 */

		public function Clip(url:String = undefined,clipX:Number = undefined,clipY:Number = undefined){}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function destroy(destroyChild:Boolean = null):void{}

		/**
		 * 销毁对象并释放加载的皮肤资源。
		 */
		public function dispose():void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override protected function createChildren():void{}

		/**
		 * @private 
		 * @override 
		 */
		override protected function _onDisplay(e:Boolean = null):void{}

		/**
		 * @copy laya.ui.Image#skin
		 */
		public function get skin():String{return null;}
		public function set skin(value:String):void{}
		protected function _skinLoaded():void{}

		/**
		 * X轴（横向）切片数量。
		 */
		public function get clipX():Number{return null;}
		public function set clipX(value:Number):void{}

		/**
		 * Y轴(竖向)切片数量。
		 */
		public function get clipY():Number{return null;}
		public function set clipY(value:Number):void{}

		/**
		 * 横向分割时每个切片的宽度，与 <code>clipX</code> 同时设置时优先级高于 <code>clipX</code> 。
		 */
		public function get clipWidth():Number{return null;}
		public function set clipWidth(value:Number):void{}

		/**
		 * 竖向分割时每个切片的高度，与 <code>clipY</code> 同时设置时优先级高于 <code>clipY</code> 。
		 */
		public function get clipHeight():Number{return null;}
		public function set clipHeight(value:Number):void{}

		/**
		 * @private 改变切片的资源、切片的大小。
		 */
		protected function changeClip():void{}

		/**
		 * @private 加载切片图片资源完成函数。
		 * @param url 资源地址。
		 * @param img 纹理。
		 */
		protected function loadComplete(url:String,img:Texture):void{}

		/**
		 * 源数据。
		 */
		public function get sources():Array{return null;}
		public function set sources(value:Array):void{}

		/**
		 * 资源分组。
		 */
		public function get group():String{return null;}
		public function set group(value:String):void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function set width(value:Number):void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function get width():Number{return null;}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function set height(value:Number):void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function get height():Number{return null;}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override protected function measureWidth():Number{
			return null;
		}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override protected function measureHeight():Number{
			return null;
		}

		/**
		 * <p>当前实例的位图 <code>AutoImage</code> 实例的有效缩放网格数据。</p>
		 * <p>数据格式："上边距,右边距,下边距,左边距,是否重复填充(值为0：不重复填充，1：重复填充)"，以逗号分隔。
		 * <ul><li>例如："4,4,4,4,1"</li></ul></p>
		 * @see laya.ui.AutoBitmap.sizeGrid
		 */
		public function get sizeGrid():String{return null;}
		public function set sizeGrid(value:String):void{}

		/**
		 * 当前帧索引。
		 */
		public function get index():Number{return null;}
		public function set index(value:Number):void{}

		/**
		 * 切片动画的总帧数。
		 */
		public function get total():Number{return null;}

		/**
		 * 表示是否自动播放动画，若自动播放值为true,否则值为false;
		 * <p>可控制切片动画的播放、停止。</p>
		 */
		public function get autoPlay():Boolean{return null;}
		public function set autoPlay(value:Boolean):void{}

		/**
		 * 表示动画播放间隔时间(以毫秒为单位)。
		 */
		public function get interval():Number{return null;}
		public function set interval(value:Number):void{}

		/**
		 * 表示动画的当前播放状态。
		 * 如果动画正在播放中，则为true，否则为flash。
		 */
		public function get isPlaying():Boolean{return null;}
		public function set isPlaying(value:Boolean):void{}

		/**
		 * 播放动画。
		 * @param from 开始索引
		 * @param to 结束索引，-1为不限制
		 */
		public function play(from:Number = null,to:Number = null):void{}

		/**
		 * @private 
		 */
		protected function _loop():void{}

		/**
		 * 停止动画。
		 */
		public function stop():void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function set dataSource(value:*):void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function get dataSource():*{return null;}

		/**
		 * <code>AutoBitmap</code> 位图实例。
		 */
		public function get bitmap():AutoBitmap{return null;}

		/**
		 * @private 
		 */
		protected function _setClipChanged():void{}
	}

}