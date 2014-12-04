(function(window,document){
	var tween={
		Linear: function(t,b,c,d){ return c*t/d + b; },
	     	Quad: {
	        		easeIn: function(t,b,c,d){
	             		return c*(t/=d)*t + b;
	         		},
	        		easeOut: function(t,b,c,d){
	            			return -c *(t/=d)*(t-2) + b;
	         		},
	        		easeInOut: function(t,b,c,d){
	            			if ((t/=d/2) < 1) return c/2*t*t + b;
	             		return -c/2 * ((--t)*(t-2) - 1) + b;
	         		}
	     	},
	    	Cubic: {
	        		easeIn: function(t,b,c,d){
	             		return c*(t/=d)*t*t + b;
	         		},
	       		easeOut: function(t,b,c,d){
	            			return c*((t=t/d-1)*t*t + 1) + b;
	        		},
	        		easeInOut: function(t,b,c,d){
	            			if ((t/=d/2) < 1) return c/2*t*t*t + b;
	             		return c/2*((t-=2)*t*t + 2) + b;
	         		}
	     	},
	    	Quart: {
	        		easeIn: function(t,b,c,d){
	             		return c*(t/=d)*t*t*t + b;
	         		},
	        		easeOut: function(t,b,c,d){
	            			return -c * ((t=t/d-1)*t*t*t - 1) + b;
	         		},
	        		easeInOut: function(t,b,c,d){
	            			if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
	           			return -c/2 * ((t-=2)*t*t*t - 2) + b;
	         		}
	     	},
	    	Quint: {
	        		easeIn: function(t,b,c,d){
	            			return c*(t/=d)*t*t*t*t + b;
	         		},
	        		easeOut: function(t,b,c,d){
	            			return c*((t=t/d-1)*t*t*t*t + 1) + b;
	         		},
	        		easeInOut: function(t,b,c,d){
	            			if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
	             		return c/2*((t-=2)*t*t*t*t + 2) + b;
	         		}
	    	},
	 	Sine: {
	        		easeIn: function(t,b,c,d){
	            			return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
	        		},
	        		easeOut: function(t,b,c,d){
	            			return c * Math.sin(t/d * (Math.PI/2)) + b;
	        		},
	        		easeInOut: function(t,b,c,d){
	            			return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
	        		}
	     	},
	    	Expo: {
	        		easeIn: function(t,b,c,d){arthus
	            			return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
	         		},
	        		easeOut: function(t,b,c,d){
	            			return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
	         		},
	        		easeInOut: function(t,b,c,d){
	             		if (t==0) return b;
	             		if (t==d) return b+c;
	            			if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
	             		return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
	         		}
	     	},
	    	Circ: {
	        		easeIn: function(t,b,c,d){
	            			return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
	         		},
	        		easeOut: function(t,b,c,d){
	            			return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
	         		},
	        		easeInOut: function(t,b,c,d){
	            			if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
	             		return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
	         		}
	     	},
	    	Elastic: {
	        		easeIn: function(t,b,c,d,a,p){
	            			if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
	             		if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
	             		else var s = p/(2*Math.PI) * Math.asin (c/a);
	            			return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	         		},
	        		easeOut: function(t,b,c,d,a,p){
	            			if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
	             		if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
	             		else var s = p/(2*Math.PI) * Math.asin (c/a);
	            			return (a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b);
	          		}
	     	}
	},
	gPkid:1,
	getGPkid: function () {
		return gPkid++;
	},
	getGuid:function(){
		 return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    				var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    				return v.toString(16);
		});
	},
	rNoWord=/\W/g,
	animation={
		play:function(){

		},
		playOne:function(){

		},
		superPlay:function(){
			var _time = setTimeout(function(){

			});
		}
	},
	sprite=function(dom,script){
		this.Script =script;
		this.Dom = dom;
		this.Stack={};
		this.Pkid = getGPkid();
	},
	sence=function(time,fps,tween){
		this.Time = time;
		this.Fps=fps || 50;
		this.Interval = parseInt(1000/this.fps);
		this.Tween = tween || 'Linear';

		this.Sprites={};
		this.SuperData={};
	};
	sprite.prototype={
		push:function(){
			for(var time in script){
				var _obj in script[time];
				for(var p in _obj){
					if(this.Stack[p] === undefined){
						this.Stack[p] = this.Dom.css(p);
					}
				}
			}
		},
		pop:function(){
			var _result={};
			for(var p in this.Stack){
				this.Dom.css(p,this.Stack[p]);
			}
		},
		getStack:function(p){
			return this.Stack[p];
		},
		get:function(time){
			
		}
	};
	sence.prototype={
		add:function(dom,script){
			var _sprite = new sprite(dom,sprite);
			this.Sprites[_sprite.Pkid]=_sprite;
		},
		remove:function(pkid){	
			delete this.Sprites[pkid];
		},
		play:function(){

		},
		reverse:function(){
			
		},
		complie:function(){
			for(var i=0;i<this.Length;i+=this.Interval){
				this.SuperData[i]=[];
				for(var _pkid in this.Sprites){
					var _state = this.Sprites[_pkid].get(i);
					_state && this.SuperData[i].push(_state);
				}				
			}
		}
	};
	//Dom animation
	(function(){

	})();
	

	define('evolution',['jquery'],function(){
		return evolution;
	});

})(window,document);


/*

	var s1 = new scence({
		Time:8000,
		FPS:50
	});
	s1.add(h1,{
		100:{width:50,height:120,display:block}
		200:{width:100}
		500:{}
	});
	s1.add();


	s1.complie();
	s1.play();

*/

