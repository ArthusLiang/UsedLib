(function(){
	var _arthusApp={};
		_arthusApp.getUrlParam=function(pName){
			var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)"),
			      r = window.location.search.substr(1).match(reg); 
			return r!=null?  unescape(r[2]):null; 
		};
		//factory
		_arthusApp.Factory={
			Default:function(){
				var me =this;
				me.go=function(){};
			},
			IFrame:function(){	
				var me = this;
			             //method
			     	init=function(){
			     		me.Root =  $('[data-root]');
			     		me.Container = document.createElement("IFrame");
			     		me.Container.width = me.Root.width();
			     		me.Container.height = me.Root.height();
			     		me.Container.frameborder = 'no';
			     		me.Container.marginwidth = '0';
			     		me.Container.marginheight = '0';
			     		me.Container.scrolling = 'no';
			     		me.Container.allowtransparency = 'yes';
				 	me.Root.html('');
				 	me.Root[0].appendChild(me.Container);
			  	};

				//public
				me.go=function(e){
					var _tar =  e.target.href;
					if(_tar !=null){
						me.Container.src=_tar;
						e.preventDefault();
					}
				};
				init();
			},
			Ajax:function(){	
				var me = this,
				//method
			      	init=function(){
			     		me.Root =  $('[data-root]');
			     		me.Container = me.Root;
			      	};

				//public
				me.go=function(e){
					var _tar =  e.target.href;
					if(_tar !=null){
						$.get(_tar,{isAjax:true},function(data,textStatus){
							me.Container.html(data);
						});
						e.preventDefault();
					}
				};
				init();	
			}
		};
		//webview
		_arthusApp.getInstance=function(pMode){
		      var _mode = _arthusApp.getUrlParam("AppMode") ||  pMode || "Default";
		      return new _arthusApp.Factory[_mode]();
		};
		//initmode
		_arthusApp.init=function(){
	                   var _mode = _arthusApp.getUrlParam("AppMode") || "Default";
	                   	$.extend({
				ArthusApp:_arthusApp.Factory[_mode]()
			});
			$(window).bind("click",function(e){
				$.ArthusApp.go(e);
			});    
		};

//Init Mode
$(function(){
	_arthusApp.init();

	//window.pageYOffset = document.body.scrollTop = document.documentElement.scrollTop = 1;
	setTimeout(function(){
		window.scrollTo(0,0);
		},300);			
	});
})();
