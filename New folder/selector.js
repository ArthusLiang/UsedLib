/*
* selector mode;
* Arthus 2014 9 17
*/
(function(window,document){
	/*selector*/
	var rootEvolution,
		W3C = document.dispatchEvent,
		html=document.documentElement,
		head = document.head || document.getElementsByTagName("head")[0],
		NoFn = function(){},
		_evolution = window.evolution,
		_$ = window.$;

	/*req*/
	var rhtml = /<|&#?\w+;/,
		rword=/[^, ]+/g,
		rtagName = /<([\w:]+)/,
		rquickExpr=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,
		rscriptType = /^$|\/(?:java|ecma)script/i,
		rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/;

	var isArraylike=function(obj){
		var length = obj.length,
			type= evolution.type(obj);

		if(evolution.isWindow(obj)){
			return false;
		}

		if(obj.nodeType ===1 && length){
			return true;
		}

		return type === 'Array' || type !== 'Function' && (length === 0 || typeof length === 'Number' && length >0 && (length-1) in obj);
	};

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
	core_toString=class2type.toString;//{}.toString
	"Boolean,Number,String,Function,Array,Date,RegExp,Window,Document,Arguments,NodeList".replace(rword,function(name){
		class2type['[object '+name+']']=name;
	}),
	core_hasOwn = class2type.hasOwnProperty,
	core_deletedIds = [],
	core_concat = core_deletedIds.concat,
	core_push = core_deletedIds.push,
	core_slice = core_deletedIds.slice,
	core_indexOf = core_deletedIds.indexOf,
	core_version = "1.0";

	//constructor
	evolution= function(selector,context){
		new evolution.fn.init(selector,context,rootEvolution);
	};
	evolution.fn= evolution.prototype={
		evolution:core_version,
		constructor:evolution,
		selector:'',
		length:0,
		init:function(selector,context,rootEvolution){
			return [];
			/*
			var match,elem;
			// handle: $(""), $(null), $(undefined),$(false)
			if(!selector){return this;	}

			//html string
			if(typeof selector ==='string'){
				//<p> <a>
				if(selector.charAt(0)==='<' && selector.charAt(selector.length-1) === ">" && selector.length>=3){
					match = [null,selector,null]
				//<p>dfdf or #id
				}else{
					match = rquickExpr.exec(selector);
				}

				//match -------> [str,tag,id]

				//id
				if(match && (match[1] || !context){
					//Handle:$(html) -> $(array)
					if(match[1]){
						context = context instanceof evolution ? context[0]:context;

						//scripts is true for back-compat  ????
						evolution.merge(this,evolution.parseHTML(
							match[1],
							context && context.nodeType ? context.ownerDocument || context : document,
							true
						));

						if(rsingleTag.test(match[1]) && evolution.isPlainObject(context)){
							for(match in context){
								if(evolution.isFunction(this[match])){
									this[match](context[match]);
								}else{
									this.attr(match,context[match]);
								}
							}
						}

						return this;

					}else{
						elem = document.getElementById(match[2]);

						if(elem && elem.parentNode){
							this.length =1;
							this[0] = elem;
						}
						this.context = document;
						this.selector = selector;
						return this;
					}								
				}else if(!context || context.evolution){
					return (context || evolution).find(selector);
				}else{
					return this.constructor(context).find(selector);
				}

			//$(DOMElement)
			}else if(selector.nodeType){
				this.context = this[0] = selector;
				this.length=1;
				return this;
			//$(function ) ------> ready func
			}else if(evolution.isFunction(selector)){
				return evolution.ready(selector);
			}

			//  ??
			if(selector.selector !== undefined){
				this.selector  =selector.selector;
				this.context  =selector.context;
			}

			return evolution.makeArray(selector,this);
			*/
		},
		ready:function(){

		}
	};
	evolution.fn.init.prototype = evolution.fn;

	evolution.extend = evolution.fn.extend=function(){
		var options,name,src,copy,copyIsArray,clone,
			target = arguments[0] || {},
			i=1,
			length = arguments.length,
			deep = false;
		//deep copy
		if(typeof target === 'boolean'){
			deep = target;//true or false
			target = arguments[1] || {};
			//skip the boolean and the target
			i=2;
		}

		//handle case when target is a string or something (deep)
		if(typeof target !== 'object' && !evolution.isFunction(target)){
			target ={};
		}

		//only one argument
		if(length === i){
			target = this;
			--i;
		}

		for(;i<length;i++){
			//only deal with non-null/undefined values
			if((options = arguments[i]) !=null){	
				for(name in options){
					src  = target[name];
					copy = options[name];

					if(target === copy){continue;}
					// deep copy
					if(deep && copy && (evolution.isPlainObject(copy) || (copyIsArray = evolution.isArray(copy)))){
						if(copyIsArray){
							copyIsArray = false;
							clone = src && evolution.isArray(src) ? src : [];
						}else{
							clone = src && evolution.isPlainObject(src) ? src :{};
						}

						target[name] = evolution.extend(deep,clone,copy);
					// do not copy undefined
					}else if(copy!== undefined){
						target[name] = copy;
					}

				}
			}
		}

	};

	evolution.extend({
		merge:function(first,second){
			var l= second.length,
				i= first.length,
				j=0;
			if(typeof l === 'number'){
				for(;j<l;j++){
					first[i++]=second[j]
				}
			}else{
				while(second[j]!==undefined){
					first[i++] = second[j++];
				}
			}
			first.length=i;
			return first;
		},
		/*
		parseHTML:function(data,context,keepScripts){
			if(!data || typeof data !== 'string'){
				return null;
			}
			if(typeof context === 'boolean'){
				keepScripts = context;
				context = false;
			}
			context = context || document;

			var parsed = rsingleTag.exec(data),
				scripts = !keepScripts && [];

			if(parsed){
				return [context.createElement(parsed[1])];
			}

			parsed = evolution.buildFragment([data],context,scripts);

			if(scripts){
				evolution(scripts).remove();
			}

			return evolution.merge([],parsed.childNodes);
		},
		buildFragment:function(elems,context,scripts,selection){
			var elem,tmp,tag,wrap,contains,j,
				i=0,
				l=elems.length,
				fragment = context.createDocumentFragment(),
				nodes=[];
			for(;i<l;i++){
				elem = elems[i];
				if(elem || elem === 0){
					if(evolution.type(elem)==='object'){
						evolution.merge(nodes,elem.nodeType ? [elem]:elem);
					}else if(!rhtml.test( elem )){
						nodes.push(context.createTextNode(elem));
					}else{
						tmp = tmp || fragment.appendChild(context.createElement('div'));

						//deserialize
						tag =(rtagName.exec(elem) || ["",""])[1].toLowerCase();
						wrap = wrapMap[tag] || wrapMap._default;
						tmp.innerHTML = wrap[1] + elem.replace(rxhtmlTag,'<$1></$2>')+wrap[2];

						j= wrap[0];
						while(j--){
							tmp = tmp.firstChild;
						}

						evolution.merge(nodes,tmp.childNodes);
						tmp.fragment.firstChild;
						tmp.textContent = '';
					}
				}
			}
			fragment.textContent = '';
			i=0;
			while((elem=nodes[i++])){
				if(selection && evolution.inArray(elem,selection)!==-1){
					continue;
				}
				contains = evolution.contains(elem.ownerDocument,elem);
				tmp = getAll(fragment.appendChild(elem),'scripts');

				if(contains){
					setGlobalEval(tmp);
				}

				if(scripts){
					j=0;
					while((elem=tmp[j++]){
						if(rscriptType.test(elem.type || "")){
							scripts.push(elem);
						}
					}
				}
			}
			return fragment;
		},
		*/
		makeArray:function(arr,results){
			var ret = results || [];
			if(arr != null){
				if(isArraylike(Object(arr))){
					evolution.merge(ret,typeof arr=== 'String'? [arr]:arr);
				}else{
					core_push.call(ret,arr);
				}
			}
			return ret;
		},
		makeArray2: W3C ? function(nodes, start, end) {
            				return core_slice.call(nodes, start, end);
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
		inArray:function(){

		},
		type:function(obj,str){
			var result = class2type[(obj == null || obj !== obj) ? obj : core_toString.call(obj)] || obj.nodeName || '#';
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
					result = core_toString.call(obj).slice(8,-1);
				}
			}
			if(str){
				return str === result;
			}
			return result;
		},	
		isPlainObject:function(obj){
			if(evolution.type(obj) !== 'Object' || obj.nodeType || evolution.isWindow(obj)){
				return false;
			}
			try{
				if(obj.constructor && !core_hasOwn.call(obj.constructor.prototype,'isPrototypeOf')){
					return false;
				}
			}catch(e){
				return false;
			}
			return true;
		},
		isWindow:function(obj){
			return obj != null && obj === obj.window;
		},
		isFunction:function(ojb){
			return evolution.type(obj) === 'Function';
		},
		isArray:function(obj){
			return evolution.type(obj) ==='Array';
		},
		remove:function(){

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
		log:(window.console && console.log) ?console.log :function(msg){},
		//no conflict handler
		noConflict:function(deep){
			window.$=_$;
			if(deep){
				window.evolution= evolution;
			}
			return evolution;			
		}
	});

	//Dom ready
	(function(){
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
				if(W3C || document.readyState === 'complete'){
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
	})();

	//Amd
	(function(){
		var moduleClass='evolutionLoading',
			rword=/[^, ]+/g,
			rdeuce=/\/\w+\/\.\./,
			rmakeid=/(#.+|\W)/g,
			config={
				baseUrl:'',
				shim:{},
				paths:{}
			},
			configFn=function(obj){
				evolution.extend(config,obj);
			},
			factorys=[],
			loadings=[],
			modules = evolution.modules={
				ready:{
					exports:evolution
				},
				evolution:{
					state:2,
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
						             while (rdeuce.test(ret)) {
						             	ret = ret.replace(rdeuce, "")
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
	        			var id = url.replace(rmakeid, "");
	        			if (!document.getElementById(id)) {
	            				var node = document.createElement("link");
	            				node.rel = "stylesheet";
	            				node.href = url;
	            				node.id = id;
	            				head.insertBefore(node, head.firstChild);
	        			}
			},
			checkFail=function(node,onError,pIE){
				var id =node.src;
				node.onload = node.onreadystatechange = node.onerror=null;
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
						if(core_hasOwn.call(deps,key) && modules[key].state !==2){
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
				var nodes = document.getElementsByTagName('script'),
					node;
				if(window.VBArray){
					for(var i=nodes.length;node=nodes[--i];){
						if(node.readyState === 'interactive'){
							break;
						}
					}
				}else{
					node =  nodes[nodes.length-1];
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
				String(list).replace(rword,function(el){
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
				var args = evolution.makeArray2(arguments);
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

			}});
		evolution.require.config = configFn;
		window.require = evolution.require;
		window.define = evolution.define;
		window.exports = evolution.exports;

		var _mainNode= evolution.getCurrentScriptNode();
		if(_mainNode){
			var _mainNodeSrc = _mainNode.getAttribute('data-src');
			if(_mainNodeSrc){
				var _src=_mainNode.getAttribute('src'),
					_url=_src.replace(/[?#].*/,''),
					_pageUrl=location.href.replace(/[?#].*/,'');
				if(!/^(\w+)(\d)?:.*/.test(_url)){
					_url =_pageUrl;
				}
				config.baseUrl = _url.slice(0,_url.lastIndexOf('/')+1);
				require(_mainNodeSrc);				
			}
		}
	})();

	window.$ =evolution;
})(window,document);

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
/* Define a local copy of jQuery
	jQuery = function( selector, context ) {
		// The jQuery object is actually just the init constructor 'enhanced'
		return new jQuery.fn.init( selector, context, rootjQuery );
	},
	


	var _selector=function(queryString,context){
		var result = context.querySelectorAll(queryString) || [];
		result.context = context;
		result.selector = queryString;
		return result;
	},
	_$ = function(queryString){
		var context = this.querySelectorAll ? this : document;
		return new _selector(queryString,context);		
	};

	_selector.prototype={
		find:_$
	};

	define('selector','evolution',function(evolution){
		evolution.extend(_$ ,evolution);
		window.$=window.evolution = _$;
	});
*/


