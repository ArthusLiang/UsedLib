(function(window,document){
	var _evolution =window.evolution,
		_$ = window.$,
		W3C = document.dispatchEvent,
		html=document.documentElement,
		head = document.head || document.getElementsByTagName("head")[0],
		NoFn = function(){},
		evolution=function(selector,context){
			return new evolution.fn.init(selector,context);
		};

	//shallow copy
	evolution.extend=function(target,source){
		var args=[].slice.call(arguments),
			i=1,
			key,
			ride= typeof args[args.length-1] == 'boolean' ? args.pop() : true;

		if(args.length==1){
			target = !this.window ? this: {};
			i=0;
		}

		while((source=args[i++])){
			for(key in source){
				if(ride || !(key in target)){
					target[key] =source[key];
				}
			}
		} 
		
    		//返回处理后的目标对象  
    		return target;  
	};

	//Reg
	evolution.extend({
		Reg:{
			rword:/[^, ]+/g,
			rdeuce:/\/\w+\/\.\./,
			rmakeid:/(#.+|\W)/g,
			rmapper:/(\w+)_(\w+)/g			
		}
	});

	//Type
	var class2type ={
		'[objectHTMLDocument]':'Document',
		'[objectHTMLCollection]':'NodeList',
		'[objectStaticNodeList]':'NodeList',
		'[objectIXMLDOMNodeList]':'NodeList',
		'[objectDOMWindow]':'Window',
		'[object global]':'Window',
		'null':'Null',
		'NaN':'NaN',
		'undefined':'Undefined'
	},
	toString=class2type.toString;//{}.toString
	"Boolean,Number,String,Function,Array,Date,RegExp,Window,Document,Arguments,NodeList".replace(evolution.Reg.rword,function(name){
		class2type['[object '+name+']']=name;
	});

	evolution.extend({
		type:function(obj,str){
			var result = class2type[(obj == null || obj !== obj) ? obj : toString.call(obj)] || obj.nodeName || '#';
			if(result.charAt(0)==='#'){
				//for IE6,7,8 window ==document = true , document== window==false
				if(obj = obj.document && obj.document != obj){
					result = 'Window';
				}else if(obj.nodeType ===9){
					result = 'Document';
				}else if(obj.callee){
					result = 'Arugument';
				}else if(isFinite(obj.length) && obj.item){
					result = 'NodeList';
				}else{
					result = toString.call(obj).slice(8,-1);
				}
			}
			if(str){
				return str ===result;
			}
			return result
		},
		bind: W3C ? function(el, type, fn, phase) {
            				el.addEventListener(type, fn, !!phase);
            				return fn;
        			} : function(el, type, fn) {
            				el.attachEvent && el.attachEvent("on" + type, fn);
            				return fn;
        			},
		unbind: W3C ? function(el, type, fn, phase) {
		            		el.removeEventListener(type, fn || $.noop, !!phase);
		        	} : function(el, type, fn) {
		            		if (el.detachEvent) {
		                		el.detachEvent("on" + type, fn || $.noop);
		            		}
		        	},
		makeArray: W3C ? function(nodes, start, end) {
            				return factorys.slice.call(nodes, start, end);
        			} : function(nodes, start, end) {
            				var ret = [],
                    			n = nodes.length;
            				if (end === void 0 || typeof end === "number" && isFinite(end)) {
                				start = parseInt(start, 10) || 0;
                				end = end == void 0 ? n : parseInt(end, 10);
                				if (start < 0) {
                    					start += n;
                				}
                				if (end > n) {
                    					end = n;
                				}
                				if (end < 0) {
                    					end += n;
                				}
                				for (var i = start; i < end; ++i) {
                    					ret[i - start] = nodes[i];
                				}
            				}
            				return ret;
        		},
        		hasOwn:Object.prototype.hasOwnProperty,
        		log:function(msg){
			if(window.console && console.log){
				console.log(msg);
			}
		},
		//no conflict handler
		noConflict:function(deep){
			window.$=_$;
			if(deep){
				window.evolution= evolution;
			}
			return evolution;			
		}	
	});

	//dom ready
	var readList=[],
		readyFn,ready = W3C ? 'DOMContentLoaded':'readystatechange',
		fireReady=function(){
			var fn;
			while(fn=readList.pop()){
				fn();
			}
			readList=null;
			fireReady= NoFn;//IE9 fuck
		},
		doScrollCheck=function(){
			try{
				html.doScroll('left');
				fireReady();
			}catch(e){
				setTimeout(doScrollCheck);
			}
		};

	if(!document.readyState){
		var readyState = document.readyState = document.body ? 'complete' : 'loading';

	}
	if(document.readyState === 'complete'){
		fireReady();
	}else{
		evolution.bind(document,ready,readyFn=function(){
			if(W3C || document.readyState==='complete'){
				fireReady();
				if(readyState){
					document.readyState='complete';
				}
			}
		});
		if(html.doScroll){
			try{
				if(self.eval === parent.eval){
					doScrollCheck();
				}
			}catch(e){
				doScrollCheck();
			}
		}
	}

	evolution.extend({
		ready:function(fn){
			if(readList){
				readList.push(fn);
			}else{
				fn();
			}
		}
	});

	//Amd	
	var moduleClass= 'evolutionLoading',
		config={
			baseUrl:'',
			shim:{},
			paths:{}
		},
		configFn=function(obj){
			evolution.extend(config,obj);
		},
		factorys=[],
		loadings = [], //loading files
		modules = evolution.modules = {
			ready: {
				exports:evolution
			},
		        	evolution: {
		            		state: 2,
		            		exports:evolution
		        	}
		},
		loadJSCSS=function(url,parent,ret,shim){
			if(/^(evolution|ready)$/.test(url)){
				return url;
			}
			if(config.paths[url]){
				ret = config.paths[url];
			}else{
				if(/^(\w+)(\d)?:.*/.test(url)){
					ret = url;
				}else{
					parent = parent.substr(0,parent.lastIndexOf('/'));
					var tmp =url.charAt(0);
					if(tmp !=='.' && tmp !== '/'){//relative paths
						ret = config.baseUrl+url;
					}else if(url.slice(0,2)==='./'){//brother
						ret = parent +url.slice(1);
					}else if(url.slice(0,2) === '..'){//parent					
						ret = parent + "/" + url;
					             while (evolution.Reg.rdeuce.test(ret)) {
					             	ret = ret.replace(evolution.Reg.rdeuce, "")
					             }
					}else if(tmp === '/'){
						ret = parent +url;
					}else{
						//none
						ret='';
					}
				}
			}
 			var src = ret.replace(/[?#].*/, ""),
                			ext;
			if(/\.(css|js)$/.test(src)){
				ext = RegExp.$1;
			} 
			if(!ext){
				src +='.js';
				ext = 'js';
			}
			if(ext === 'js'){
				if(!modules[src]){
					modules[src]={
						id:src,
						parent:parent,
						exports:{}
					};
					if(shim){ //arguments
						require(shim.deps || '',function(){
							loadJS(src,function(){
								modules[src].state =2;
								modules[src].exports = typeof shim.exports === 'function' ? shim.exports() : window[shim.exports];
								checkDeps();
							});
						}) ;
					}else{
						loadJS(src);
					}
				}
				return src;
			}else{
				loadCSS(src);
			}
		},
		loadJS=function(url,callback){
			var node = document.createElement('script');
			node.className = moduleClass;// ..getCurrentScript
			node[W3C ? 'onload' : 'onreadystatechange'] =function(){
				if(W3C || /loaded|complete/i.test(node.readyState)){
					var factory = factorys.pop();//with defined
					factory && factory.delay(node.src); // defined  delay
					callback && callback();
					if(checkFail(node,false,!W3C)){
						//evolution.log('success');
					}
				}
			};
			node.onerror=function(){
				checkFail(node,true);
			};
			node.src= url;
			head.insertBefore(node,head.firstChild);
		},
		loadCSS=function(url){
        			var id = url.replace(evolution.Reg.rmakeid, "");
        			if (!document.getElementById(id)) {
            				var node = document.createElement("link");
            				node.rel = "stylesheet";
            				node.href = url;
            				node.id = id;
            				head.insertBefore(node, head.firstChild);
        			}
		},
		checkFail=function(node,onError,pIE){
			var id= node.src;
			node.onload= node.onreadystatechange =node.onerror=null;
			if(onError || (pIE && !modules[id].state)){
				setTimeout(function(){
					head.removeChild(node);
				});
			}else{
				return true;
			}
		},
		checkDeps=function(){
			loop:for(var i=loadings.length,id;id=loadings[--i];){
				var obj = modules[id],
					deps=obj.deps;
				for(var key in deps){
					if(evolution.hasOwn.call(deps,key) && modules[key].state !==2){
						 continue loop;
					}
				}
				if(obj.state !==2){
					loadings.splice(i,1);
					fireFactory(obj.id,obj.args,obj.factory);
					checkDeps();
				}
			}
		},
		fireFactory=function(id,deps,factory){
			for(var i=0,array=[],d;d=deps[i++];){
				array.push(modules[d].exports);
			}
			var module = Object(modules[id]),
				ret = factory.apply(window,array);
			module.state=2;
			if(!ret !== void 0){
				modules[id].exports =ret;
			}
			return ret;
		},
		checkCycle=function(deps,nick){
			for(var id in deps){
				if(deps[id] === 'Arthus' && modules[id].state !==2 && (id === nick || checkCycle(modules[id].deps,nick))){
					return true;
				}
			}
		};

	evolution.extend({
		getCurrentScriptNode:function(){
			var nodes =document.getElementsByTagName('script'),
				node;
			if(window.VBArray){
				for(var i=nodes.length;node=nodes[--i];){
					if(node.readyState === 'interactive'){
						break;
					}
				}
			}else{
				node = nodes[nodes.length-1];
			}
			return node;
		},
		getCurrentScript:function(base){
			var stack;
			try{
				a.b.c();
			}catch(e){
				stack  = e.stack;
				if(!stack && window.opera){
					stack = (String(e).match(/of linked script \+S \g/) || []).join(' ');
				}
			}
			if(stack){
				//evolution.log(stack);
				stack = stack.split(/[@ ]/g).pop();
				stack = stack[0] === '(' ? stack.slice(1,-1) :stack.replace(/\s/,'');
				return stack.replace(/(:\d+)?:\d+$/i,'');				
			}
			var nodes =(base ? document : head).getElementsByTagName('script');
			for(var i = nodes.length,node;node=nodes[--i];){
				if((base || node.className === moduleClass) && node.readyState === 'interactive'){
					return node.className = node.src;
				}
			}
		},
		/*
		* load mod
		* @param {String|Array} dependant list
		* @param {Object|function} factory
		* @param {String|null} root
		*/
		require:function(list,factory,parent){
			var deps={},
				args=[],
				dn=0,//need to be installed
				cn=0,//installed
				id= parent || 'calllback'+setTimeout('1');
			parent = parent || config.baseUrl;
			String(list).replace(evolution.Reg.rword,function(el){
				var url =loadJSCSS(el,parent);
				if(url){
					dn++;
					if(modules[url] && modules[url].state ===2){
						cn++;
					}
					if(!deps[url]){
						args.push(url);
						deps[url] = 'Arthus';
					}
				}
			});
			modules[id]={
				id:id,
				factory:factory,
				deps:deps,
				args:args,
				state:1
			};
			if(dn===cn){
				fireFactory(id,args,factory);
			}else{
				loadings.unshift(id);
			}
			checkDeps();
		},
		define:function(id,deps,factory){
			var args = evolution.makeArray(arguments);
			if(typeof id === 'string'){
				var _id =  args.shift();
			}
			if(typeof args[0] === 'boolean'){// combine ?
				if(args[0]){
					return;
				}
				args.shift();
			}
			if(typeof args[0] === 'function'){
				args.unshift([]);
			}
			id = modules[id] && modules[id].state >=1 ? _id :evolution.getCurrentScript();
			factory = args[1];
			factory.id= _id;
			factory.delay=function(id){
				args.push(id);
				var isCycle =true;
				try{
					isCycle = checkCycle(modules[id].deps,id);
				}catch(e){

				}
				if(isCycle){
					evolution.log('cricle reference');
				}
				delete factory.delay;
				require.apply(null,args);
			};
			if(id){
				factory.delay(id,args);
			}else{
				factory.push(factory);
			}
		},
		exports:function(){

		}
	});
	evolution.require.config = configFn;
	window.require = evolution.require;
	window.define = evolution.define;
	window.exports = evolution.exports;

	//evolution.getCurrentScript(true);
	(function(){
		var _mainNode= evolution.getCurrentScriptNode();
		if(_mainNode){
			var _mainNodeSrc = _mainNode.getAttribute('data-src'),
				_src=_mainNode.getAttribute('src'),
				_url=_src.replace(/[?#].*/,''),
				_pageUrl=location.href.replace(/[?#].*/,'');
			if(!/^(\w+)(\d)?:.*/.test(_url)){
				_url =_pageUrl;
			}
			config.baseUrl = _url.slice(0,_url.lastIndexOf('/')+1);
			require(_mainNodeSrc);
		}		
	})();

	//dom	
	
	evolution.fn=evolution.prototype={
		constructor:evolution,
		init:function( selector,context){
			this.elem=[];
			this.context = context || document;
			this.selector = selector;
				
			if(typeof selector === 'string'){
				this.elem = (context || evolutionRoot).find(selector);
			}else if(selector!=null){
				if(!!selector.length){
					this.elem=[].slice.call(selector);
				}else{
					this.elem= [selector];
				}
			}else{
				this.elem=[]
			}
			
			return this;
			//return  this;
		},
		find:function(selector){
			var context = this.querySelectorAll ? this :document,
				results = [],
				result  = context.querySelectorAll(selector);
			result =[].slice.call(result);
			results=results.concat(result);
			return results;
		}	
	};
	evolution.fn.init.prototype = evolution.fn;
	var evolutionRoot=evolution(document);

	window.$=window.evolution=evolution;
	/*
	define('evolution',[],function(){
		return evolution;
	});
	*/

})(window,document);

//var dom = $('#id');

/*
requirejs.config({
	baseUrl: 'js/lib',
	shim:{
		'ee':{
			deps:'',
			exports:'_'
		}
	},
	paths:{
		'ee':''
	}
});
*/

