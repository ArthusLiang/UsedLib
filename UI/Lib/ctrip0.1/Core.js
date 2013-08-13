/*
* @namespace   Core
* @Author:     yulianghuang 
* @CreateDate  2012/10/18
*/
(function () {

    /*
     * Repair the setInterval and the setTimeout Bug in IE
     * @Author:     yulianghuang
     * @CreateDate  2012/10/18
     */
    (function (f) {
        window.setTimeout = f(window.setTimeout);
        window.setInterval = f(window.setInterval);
    })(function (f) {
        return function (c, t) {
            var a = [].slice.call(arguments, 2);
            return f(function () {
                c.apply(this, a)
            }, t)
        }
    });

    /*
     * @namespace   Core
     * @Author:     yulianghuang
     * @CreateDate  2012/10/18
     */
    var _core = {
        /*
        * Is pObj Array?
        * @param   {object|number|string|array|boolen...}
        * @return  {boolean}
        */
        isArray: function (pObj) {
            return Object.prototype.toString.call(pObj) === '[object Array]';
        },
        newDate:function(pStr){
            var _arr = pStr.split("-");
            return new Date(+_arr[0],+_arr[1]-1,+_arr[2]);
        },
        newDateTime:function(pDate,pHour,pMinute){
            var _thisDate = _core.newDate(pDate);
            _thisDate.setHours(+pHour);
            _thisDate.setMinutes(+pMinute);
            return _thisDate;
        },
        newDateString:function(pDate){
            var _arr=[];
            _arr.push(pDate.getFullYear());
            _arr.push("-");
            var _month =pDate.getMonth()+ 1,
                _monthStr = _month<10?"0"+_month :_month;
            _arr.push(_monthStr);
            _arr.push("-");
            var _day=pDate.getDate(),
                _dayStr=_day<10?"0"+_day:_day;
            _arr.push(_dayStr);
            return _arr.join("");
        },
        getUrlParam:function(pObj){
            var _arr=[];
            for(var name in pObj){
                _arr.push([name,"=",pObj[name]].join(""));
            }
            return _arr.join("&");
        },
        /*
        * deep clone the obj
        * @para   {object} source object
        * @return {object} the new obect
        */
        clone: function (pObj) {
            var o;
            if (typeof pObj === "object") {
                if (pObj === null) {
                    o = null;
                } else {
                    if (_core.isArray(pObj)) {
                        o = [];
                        for (var i = 0, len = pObj.length; i < len; i++) {
                            o.push(arguments.callee(pObj[i]));
                        }
                    } else {
                        o = {};
                        for (var j in pObj) {
                            o[j] = arguments.callee(pObj[j]);
                        }
                    }
                }
            } else {
                o = pObj;
            }
            return o;
        },
		addJs:function (osrc, callBack, arguments) {
		    var js = document.createElement("script");
		    js.src = osrc;
		    js.type = "text/javascript";
		    document.getElementsByTagName("head")[0].appendChild(js);
		    js.onload = js.onreadystatechange = function () {
		        if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
		            if (callBack != null) {
		           		callBack.apply(this, arguments)
		            }
		            js.onload = js.onreadystatechange = null;
		        }
		    };
		},		
        /*
        * replace the pSouce's propreties with pAddition's propreties,deep clone when pIsDeep is true;
        * @param {object}  the source object
        * @param {object}  the addition
        * @param {boolean} if use the deep clone
        */
        extend: function (pSource, pAddition, pIsDeep) {
			if (pIsDeep) {
                for (var p in pAddition) {
                    pSource[p] = _core.clone(pAddition[p]);
                }
            } else {
                for (var p in pAddition) {
                    pSource[p] = pAddition[p];
                }
            }
        },
        /*
        * don't use this to get a new guid
        */
        _guid: 1,
        /*
        * get GUID 
        * @return {number} 
        */
        getGuid: function () {
            return this._guid++;
        },
        /*
        * bind dom event
        */
        bind: function (pElement, pType, pHandler) {
            var me = this;
            //Set the guid of pHandler
            if (!pHandler.$$guid) pHandler.$$guid = me.getGuid();

            //Append Events to pHandler
            if (!pElement.events) pElement.events = {};

            //Get the handler of current event
            var _handlers = pElement.events[pType];

            //If Empty,new handlers and save the preview handler
            if (!_handlers) {

                _handlers = pElement.events[pType] = {};

                //Save the preview handler			
                if (pElement["on" + pType]) {
                    _handlers[0] = pElement["on" + pType];
                }
            }
            //Record the function
            _handlers[pHandler.$$guid] = pHandler;
            //Proxy excute
            pElement["on" + pType] = me.handleEvent;
        },
        /*
        * unbind dom event
        * @param {dom}
        * @param {string}
        * @param {function}
        */
        unbind: function (pElement, pType, pHandler) {
            if (pElement.events && pElement.events[pType]) {
                delete pElement.events[pType][pHandler.$$guid];
            }
        },
        unbindAll:function(pElement){
            if (pElement.events) {
                for(var _tpye in pElement.events)
                {
                    pElement.events[_tpye]={};
                }
            }
        },
        /*
        * handle the event
        * @param {dom}
        * @param {string}
        * @param {function}
        */
        handleEvent: function (event) {
            var returnValue = true;
            //fix event
            event = event || _core.fixEvent(window.event);
            //_core.fixEventAddition(event);
            var _handlers = this.events[event.type];
            for (var i in _handlers) {
                this.$$handleEvent = _handlers[i];
                if (this.$$handleEvent(event) === false) {
                    returnValue = false;
                }
            }
            return returnValue;
        },
        fixEventAddition:function(event){
            var type=event.type.toLowerCase();
            switch(type){
                case "mouseover":
                    event.fromElement= event.fromElement || event.srcElement || event.relatedTarget;
                    break;
                case "mouseout":
                    event.toElement= event.toElement || event.srcElement || event.relatedTarget;
                    break;
            }
        },
        getFromElement:function(event) {
            var node;
            if(event.type == "mouseover") node = event.relatedTarget || event.fromElement;
            else if (event.type == "mouseout") node = event.target;
            if(!node) return;
            while (node.nodeType != 1)
                node = node.parentNode;
            return node;
        },
        getToElement:function(event) {
            var node;
            if(event.type == "mouseout")  node = event.relatedTarget || event.toElement;
            else if (event.type == "mouseover") node = event.target;
            if(!node) return;
            while (node.nodeType != 1)
                node = node.parentNode;
            return node;
        },
        /*
         * fix mouseover mouseout
         */
        fixMouseEvent:function(event,target){
            var related,
                type=event.type.toLowerCase();//这里获取事件名字
            if(type==='mouseover'){
                related=event.relatedTarget||event.fromElement;
            }else if(type==='mouseout'){
                related=event.relatedTarget||event.toElement;
            }else return true;
            return related && related.prefix!='xul' && !Core.contains(target,related) && related!==target;
        },
        /*
        * fix event
        */
        fixEvent: function (event) {
            event.target=event.srcElement;
            event.preventDefault = this.fixEvent.preventDefault;
            event.stopPropagation = this.fixEvent.stopPropagation;
            return event;
        },
        max:function(pArray){
            var _maxNo=-Infinity;
            for(var i=pArray.length-1;i!==-1;i--){
                if(pArray[i]!=null &&_maxNo<pArray[i]){
                    _maxNo = pArray[i];
                }
            }
            return _maxNo;
        },
        contains:function(root, el) {
            if (root.compareDocumentPosition)
                return root === el || !!(root.compareDocumentPosition(el) & 16);
            if (root.contains && el.nodeType === 1){
                return root.contains(el) && root !== el;
            }
            while ((el = el.parentNode))
                if (el === root) return true;
            return false;
        },
        random:function(pStart,pEnd)
        {
            return Math.random()*(pEnd-pStart+1)>>0+pStart;
        },
        Cache:{}
    };

    _core.fixEvent.preventDefault = function () {
        this.returnValue = false;
    };
    _core.fixEvent.stopPropagation = function () {
        this.cancelBubble = true;
    };

    /*
     * test browser
     * @namespace   Browser
     * @Author:     yulianghuang
     * @CreateDate  2012/10/18
     */
	_core.Browser=new function () {
		//Regular
	    var _regConfig = {
	        Chrome: {
	            Reg: /.*(chrome)\/([\w.]+).*/,
	            Core: "Webkit"
	        },
	        Firefox: {
	            Reg: /.*(firefox)\/([\w.]+).*/,
	            Core: "Moz"
	        },
	        Opera: {
	            Reg: /(opera).+version\/([\w.]+)/,
	            Core: "O"
	        },
	        Safari: {
	            Reg: /.*version\/([\w.]+).*(safari).*/,
	            Core: "Webkit"
	        },
	        Ie: {
	            Reg: /.*(msie) ([\w.]+).*/,
	            Core: "Ms"
	        }
	    },
		_userAgent = navigator.userAgent.toLowerCase();
		/*
		 * Get the detail information of browser
		 * @return {object}
		 */
		this.getDetail=function(){
			for(var _o in _regConfig){
				var _result = _regConfig[_o].Reg.exec(_userAgent);
				if(_result !=null){
					return{Browser: _result[1] || "", Version: _result[2] || "0", Core: _regConfig[_o].Core};
				}
			}
			return {Browser:"UNKNOWN", Version: "UNKNOWN", Core: "UNKNOWN"};
		};
		
		this.isChrome=function(){
			return _regConfig.Chrome.Reg.test(_userAgent);
		};
		this.isFirefox=function(){
			return _regConfig.Firefox.Reg.test(_userAgent);
		};
		this.isOpera=function(){
			return _regConfig.Opera.Reg.test(_userAgent);
		};
		this.isSafari=function(){
			return _regConfig.Safari.Reg.test(_userAgent);
		};
		this.isIe=function(){
			return _regConfig.Ie.Reg.test(_userAgent);
		};
        this.isIPad=function(){
            return (/ipad/).test(_userAgent);
        };
	};

	/*
	 * Guid Hash Struct
	 * @Author:     yulianghuang
     * @CreateDate  2012/10/18
	 */
	_core.Q=function(){
		this.GuidName="QGuid"+_core.getGuid();
		//this.Guids=[];
		this.Hash={};
	};
	
	_core.Q.prototype={
		/*
		 * Add param
		 * @param {object}
		 */
		add:function(pTab){
			var me =this,_guid=pTab[me.GuidName];
			//Set the GUID
			if(_guid==null){
				_guid = _core.getGuid();
			}
			var _node=me.Hash[_guid];
			//Add only once
			if(_node==null){
				_node =pTab;
			}
		},
		/*
		 * Search param, may be useless
		 * @param  {object}
		 * @return {object}
		 */
		select:function(pObj){
			var me=this,
			_guid=pObj[me.GuidName];
			return me.selectID.call(me,_guid);
		},
		/*
		 * Search param
		 * @param  {number}
		 * @return {object}
		 */
		selectID:function(pId){
			if(typeof pId ==="number"){	
				return this.Hash[pId];			
			}
			return null;
		},
		/*
		 * delete param
		 * @param  {object}
		 */
		remove:function(pObj){
			var me=this,
			_guid=pObj[me.GuidName];
			delete this.Hash[_guid];
		},	
		/*
		 * delete param
		 * @param  {number}
		 */	
		removeID:function(pId){
			delete this.Hash[pId];
		}
	};

    /*
    * The Class of Thread   to do ： add memory
    * @constructor
    * @Author:      yulianghuang
    * @CreateDate:  2012/10/18
    */
    _core.Thread = function () {

        //Identifies is there any task being performed?
        var _doing = false,

        //How many tasks are there need to be done?
		_toDo = 0,

        //The priority queue
		_pQueue = [],

        //The task queue
		_tQueue = {},

        //The memory
		_memory = {
		    _pQueue: [],
		    _tQueue: {}
		},

        //The clock
		_clock = null;

        //The frequency of polling
        this.Hz = 10;

        //The the range of random priority
        this.RandomRange = 100;

        //The way to deal with the same priority queue.    true:push false:unshift
        this.IsSamePush = true;

        //Is record
        this.IsMemory = false;

        /*
        * search the position of the new priority in the new priority prority
        * @param  {number}       the priority of the task
        * @return {number|null}  the new position | if the priority already exists,return null.
        */
        var binarySearch = function (pPriority) {
            if (_tQueue[pPriority] !== undefined) return null; //Exist
            var l = _pQueue.length;
            if (l === 0 || _pQueue[0] < pPriority) return 0;
            if (_pQueue[l - 1] > pPriority) return l;
            var start = 0,
			end = l - 1,
			mid;
            //follow:
            //The array length must be greater than 2,value should between the max and the min in queue
            while (start <= end) {
                mid = (start + end) / 2 >> 0;
                if (_pQueue[mid] > pPriority) {
                    start = mid + 1;
                } else {
                    end = mid - 1;
                }
            }
            //- -
            if (mid === 0) return 1;
            if (mid === l) return l - 1;
            if (_pQueue[mid - 1] > pPriority && _pQueue[mid] < pPriority) return mid;
            else return mid + 1;
        },

        /*
        * add new priority to the priority pqueue
        * @param {number}  the index of the priority
        * @param {Object}  the obj contains task ,eg
        * {
        "Func": func,  			//the task,function
        "arguments": args, 		//the arguments of the function
        "priority": _priority   //the priority of the task
        }
        */
		insertPriority = function (index, obj) {
		    _pQueue.splice(index, 0, obj)
		},

        /*
        * remove the priority from the priority queue(not use)
        * @param {number} the index of the priority
        */
		romvePriority = function (index) {
		    _pQueue.splice(index, 1);
		},

        /*
        * add object to the task queue
        * @param {Object} the obj contains task ,eg
        * {
        "Func": func,  			//the task,function
        "arguments": args, 		//the arguments of the function
        "priority": _priority   //the priority of the task
        }
        */
		addTask = function (pObj) {
		    var me = this,
			_p = pObj.priority;
		    if (_tQueue[_p] !== undefined) {
		        if (me.IsSamePush) {
		            _tQueue[_p].push(pObj);
		        } else {
		            _tQueue[_p].unshift(pObj);
		        }
		    } else {
		        var index = binarySearch.call(me, _p);
		        insertPriority.call(this, index, _p);
		        _tQueue[_p] = [pObj];
		    }
		},

        /*
        * Execute the tasks which is in the begining of task queue.
        */
		fireTask = function () {
		    if (_pQueue.length !== 0) {
		        var me = this,
				_p = _pQueue[0],
				t = _tQueue[_p].shift();
		        //Identifies there are some tasks being performed
		        _doing = true;
		        if (_tQueue[_p].length === 0) {
		            delete _tQueue[_p];
		            _pQueue.shift();
		        }
		        t.Func.apply(null, t.arguments);
		        //Identifies there is not any the task being performed
		        _doing = false;

		        //pause polling
		    } else {
		        this.pause();
		    }
		},
        /*
        * Execute an array of tasks which has the same priority and the priority is at the begining of the priority queue.
        */
		fireTaskArray = function () {
		    if (_pQueue.length !== 0) {
		        var me = this,
				_p = _pQueue.shift(),
				tasks = _tQueue[_p],
				i = tasks.length;
		        _toDo = i;

		        while (i !== 0) {
		            var t = tasks.shift();
                    t.Func.apply(me, t.arguments);
                    _toDo--;
		            i--;
		        }
		        delete _tQueue[_p];
		    } else {
		        this.pause();
		    }
		};

        /*
        * watch the state of memory
        * @return {object}
        */
        this.watchMemory = function () {
            return _memory;
        };

        /*
        * clear memory
        */
        this.clearMemory = function () {
            _memory = {
                _pQueue: [],
                _tQueue: {}
            };
        };

        /*
        * Add task to the task queue
        * @param {function}  the task function
        * @param {number}    the priority of the task
        * @param {object}    the arguments of the func
        */
        this.add = function (pFunc, pPriority) {
            var args = Array.prototype.slice.call(arguments, 2);
            addTask.call(this, {
                "Func": pFunc,
                "arguments": args,
                "priority": pPriority
            });
        };

        /*
        * Add task to the task queue with a random priority
        * @param {function} the task function
        * @param {object}   the arguments of the func
        */
        this.addR = function (pFunc) {
            var args = Array.prototype.slice.call(arguments, 1);
            addTask.call(this, {
                "Func": pFunc,
                "arguments": args,
                "priority": Math.random() * this.RandomRange >> 0
            });
        };

        /*
        * Stop the thread system, Reset all arguments
        */
        this.stop = function () {
            this.pause();
            this.recoverState();
            _doing = false;
            _toDo = 0;
        };

        /*
        * clone the states
        */
        this.recordState = function () {
            _memory._pQueue = _core.clone(_pQueue);
            _memory._tQueue = _core.clone(_tQueue);
        }

        /*
        * Revoer data from memory
        */
        this.recoverState = function () {
            this.pause();
            _pQueue = _core.clone(_memory._pQueue);
            _tQueue = _core.clone(_memory._tQueue);
            _doing = false;
            _toDo = 0;
        }

        /*
        * pause running
        */
        this.pause = function () {
            clearInterval(_clock);
            _clock = null;
        };

        /*
         * get the prority queue
         */
        this.getPQueue=function(){
            return _pQueue;
        }

        /*
        * Execute the tasks which is in the begining of task queue.
        */
        this.fire = function () {
            if (_clock === null) {
                fireTask.apply(this);
            };
        };

        /*
         * Excute the tasks which has the same prority
         */
        this.fireArray=function(){
            if (_clock === null) {
                fireTaskArray.apply(this);
            };
        };

        /*
        * Start polling to execute the tasks which is in the begining of task queue.
        */
        this.run = function () {
            if (_clock === null) {
                var me = this;
                if (me.IsMemory) {
                    me.recordState();
                }
                _clock = setInterval(function () {
                    //ensure that the preview function has been finished
                    if (!_doing) {
                        fireTask.apply(me);
                    }
                }, me.Hz);
            }
        };

        /*
        * Poll to execute the tasks which is in the begining of task queue asynchronously.
        */
        this.runAsync = function () {
            if (_clock === null) {
                var me = this;
                if (me.IsMemory) {
                    me.recordState();
                }
                _clock = setInterval(function () {
                    //ensure that the preview function has been finished
                    if (_toDo === 0) {
                        fireTaskArray.apply(me);
                    }
                }, me.Hz);
            }
        };

        /*
        * Get the total number of the tasks in the task queue
        * @return {number}
        */
        this.getTaskSum = function () {
            var _sum = 0;
            for (var x in _pQueue) {
                _sum += _tQueue[_pQueue[x]].length;
            }
            return _sum;
        };

    };

    /*
     * Timer / Timing device     you need init Event before call the method "play"
     * @constructor
     * @Author:     yulianghuang
     * @param    {number}      how often the clock play
     * @param    {number}      how long the clock wait
     * @CreateDate  2012/12/5
     */
    _core.Timer=function(pMoveSpeed, pMoveInterval){
        this._speed = pMoveSpeed || 50;
        this._interval = pMoveInterval || 0;
        this._clock=null;
        this._waitClock=null;
        this.Event={
            play:function(){},
            pause:function(){},
            stop:function(){},
            ifPause:function(){return false},
            ifStop:function(){return false}
        };
    };
    _core.Timer.prototype={
        play:function(){
            var me = this;
            me.Event.play();
            me._clock = setInterval(function () {
                if(me.Event.ifStop()){
                    me.stop();
                }else if(me.Event.ifPause()){
                    me.pause();
                }else{
                    me.Event.play();
                }
            }, me._speed);
        },
        pause:function(){
            var me = this;
            if (me._clock != null) {
                clearInterval(me._clock);
            }
            me.Event.pause();
            me._waitClock = setTimeout(function () {
                me.play();
            }, me._interval);
        },
        stop:function(){
            var me= this;
            me._clock != null && clearInterval(me._clock);
            me._waitClock != null && clearInterval(me._waitClock);
            me.Event.stop();
        }
    };

    /*
     * Storage
     */
    _core.Storage=new function(){
        var _canuse=!!window.sessionStorage,
            hasData=function(pData){
                return pData && pData!=="" && pData!=="null" && pData!=="undefined";
            },
            /*
             * get data from ajax
             */
            ajaxData=function(pKey,pUrl,pArg,pCallBack,pIsLoacl,pCharset){
                var me =this;
                Cmd.ajax(pUrl,pArg,function(data){
                    dealData.call(me,data,pKey,pCallBack,pIsLoacl);
                });
            },
            /*
             * get .js document which isnot UTF-8 encoding,the return data should be place into _core.cache[key]
             */
            jsonPData=function(pKey,pUrl,pArg,pCallBack,pIsLoacl,pCharset){
                var me= this,
                    _url =(pArg != null &&  pArg!="") ? pUrl+"?"+pArg:pUrl;
                Cmd.Load.addJs(_url,function(){
                    var data = Cmd.JsonPData;
                    dealData.call(me,data,pKey,pCallBack,pIsLoacl);
                },true,pCharset);
            },
            sessionData=function(pKey,pUrl,pArg,pCallBack,pFunc,pCharset){
                var data=sessionStorage.getItem(pKey);
                if(hasData(data)){
                    dealData(data,pKey,pCallBack,false);
                }else{
                    pFunc(pKey,pUrl,pArg,pCallBack,false,pCharset);
                }
            },
            localData=function(pKey,pUrl,pArg,pCallBack,pFunc,pCharset){
                var data=localStorage.getItem(pKey);
                if(hasData(data)){
                    dealData(data,pKey,pCallBack,true);
                }else{
                    pFunc(pKey,pUrl,pArg,pCallBack,true,pCharset);
                }
            },
            dealData=function(data,pKey,pCallBack,pIsLoacl){
                _canuse && pIsLoacl && localStorage.setItem(pKey,data);
                _canuse && !pIsLoacl && sessionStorage.setItem(pKey,data);
                pCallBack(data);
            };
        /*
         *  get session storge,if not exist ,get data from the server
         *  @param  {string}            the hash key name of the data
         *  @param  {string}            the url where to get data from
         *  @param  {string}            the arguments used in the request
         *  @param  {function|null}     the callback function
         *  @param  {boolen|null}       if use jsonp
         */
        this.getSession=function(pKey,pUrl,pArg,pCallBack,pIsJsonP,pCharset){
            var _funcPoint = pIsJsonP ? jsonPData: ajaxData;
            if(_canuse){
                sessionData(pKey,pUrl,pArg,pCallBack,_funcPoint,pCharset);
            }else{
                _funcPoint(pKey,pUrl,pArg,pCallBack,false,pCharset);
            }
        };
        /*
         *  get local storge,if not exist ,get data from the server
         *  @param  {string}            the hash key name of the data
         *  @param  {string}            the url where to get data from
         *  @param  {string}            the arguments used in the request
         *  @param  {function|null}     the callback function
         *  @param  {boolen|null}       if use jsonp
         */
        this.getLocal=function(pKey,pUrl,pArg,pCallBack,pIsJsonP,pCharset){
            var _funcPoint = pIsJsonP ?  jsonPData:ajaxData;
            if(_canuse){
                localData(pKey,pUrl,pArg,pCallBack,_funcPoint,pCharset);
            }else{
                _funcPoint(pKey,pUrl,pArg,pCallBack,true,pCharset);
            }
        };
    };

    //Set the global object
    window.Core = _core;
})();
