/*
* @namespace   UI
* @Author:     yulianghuang 
* @CreateDate  2012/10/19
* @require Core.js
*/
(function () {

    var _ui = {};

    /*
    * Template Replace MethodCore
    * @Author:     fan_li 
    * @CreateDate  2012/10/19
    */
    _ui.TReplace = {
        cache: {},
        box: document.createElement("div"),
        documentFragment: document.createDocumentFragment(),
        error: function (message) {
            throw new Error("TRplace Error:" + message + ";");
        },
        parse: function (template) {
            if (!this.cache[template]) {
                var __list__ = [];
                try {
                    this.cache[template] = eval("(function(){return function(GlobalData){var __result__ = [];" + ("$>" + template + "<$").replace(/<\$= ([\s\S]*?) \$>/g, function (a, b) {
                        return "<$ __result__.push(" + b + "); $>";
                    }).replace(/\$>([\s\S]*?)<\$/g, function (a, b) {
                        if (/^\s*$/.test(b))
                            return "";
                        else
                            return "__result__.push(__list__[" + (__list__.push(b) - 1) + "]);";
                    }) + "return __result__.join('');}})()");
                } catch (e) {
                    this.error("template error");
                }
            }
            return this.cache[template];
        },
        replace: function (template, data) {
            var t = this.parse(template);
            if (t) {
                try {
                    return t(data);
                } catch (e) {
                    this.error("data error");
                    return "";
                }
            } else {
                return "";
            }
        },
        getElement: function (template, data) {
            var htmlStr = this.replace(template, data),
    	                elements = [];
            if (!this.documentFragment || this.documentFragment.childNodes.length)
                this.documentFragment = document.createDocumentFragment();
            if (htmlStr) {
                this.box.innerHTML = htmlStr;
                var _elements = this.box.childNodes;
                for (var i = 0, l = _elements.length; i < l; i++) {
                    elements[i] = _elements[0];
                    this.documentFragment.appendChild(_elements[0]);
                }
                _elements = null;
            }
            elements.node = this.documentFragment;
            //add return string
            elements.htmlStr = htmlStr;
            return elements;
        }
    };

    /*
    * Scroll Repair
    * @Author:     yulianghuang 
    * @CreateDate  2012/10/22
    */
    _ui.Dom = {
        /*
        * Get or set the scrollHeight
        * @param  {number}
        * @return {number}
        */
        scrollHeight: function (pHeight) {
            if (typeof (pHeight) === "number") {
                document.documentElement.scrollHeight = document.body.scrollHeight = pHeight;
            } else {
                return document.documentElement.scrollHeight || document.body.scrollHeight || 0;
            }
        },
        scrollWidth: function (pVal) {
            if (typeof (pVal) === "number") {
                document.documentElement.scrollWidth = document.body.scrollWidth = pVal;
            } else {
                return document.documentElement.scrollWidth || document.body.scrollWidth || 0;
            }
        },
        /*
        * Get or set the scrollTop
        * @param  {number}
        * @return {number}
        */
        scrollTop: function (pTop) {
            if (typeof (pTop) === "number") {
                window.pageYOffset = document.body.scrollTop = document.documentElement.scrollTop = pTop;
            }
            else {
                return Core.max([document.documentElement.scrollTop, document.body.scrollTop, window.pageYOffset, 0]); //because of ie9!
                //return document.documentElement.scrollTop || document.body.scrollTop || window.pageYOffset || 0;
            }
        },
        scrollLeft: function (pVal) {
            if (typeof (pVal) === "number") {
                window.pageXOffset = document.body.scrollLeft = document.documentElement.scrollLeft = pVal;
            }
            else {
                return Core.max([document.documentElement.scrollLeft, document.body.scrollLeft, window.pageXOffset, 0]); //because of ie9!
                //return document.documentElement.scrollTop || document.body.scrollTop || window.pageYOffset || 0;
            }
        },
        /*
        * Get or set the clientHeight
        * @param  {number}
        * @return {number}
        */
        clientHeight: function (pHeight) {
            if (typeof (pHeight) === "number") {
                document.documentElement.clientHeight = document.body.clientHeight = pHeight;
            } else {
                return document.documentElement.clientHeight || document.body.clientHeight || 0;
            }
        },
        clientWidth: function (pVal) {
            if (typeof (pVal) === "number") {
                document.documentElement.clientWidth = document.body.clientWidth = pVal;
            } else {
                return document.documentElement.clientWidth || document.body.clientWidth || 0;
            }
        },
        /*
        * To ensure if the element has the scroll bar    Be Careful with IE
        * @param  {object|undefined} the element need to be tested,empty is the window
        * @return {object}           x,y
        */
        hasScroll: function (el) {
            var elems = el ? [el] : [document.documentElement, document.body],
			 scrollX = false, scrollY = false;
            for (var i = 0; i < elems.length; i++) {
                var o = elems[i];
                // test horizontal

                //Don't use it in the event onscoll.
                var sl = o.scrollLeft;
                o.scrollLeft += (sl > 0) ? -1 : 1;
                o.scrollLeft !== sl && (scrollX = scrollX || true);
                o.scrollLeft = sl;

                // test vertical
                var st = o.scrollTop;
                o.scrollTop += (st > 0) ? -1 : 1;
                o.scrollTop !== st && (scrollY = scrollY || true);
                o.scrollTop = st;

            }
            // ret
            return {
                scrollX: scrollX || _ui.Dom.clientWidth() < _ui.Dom.scrollWidth(),
                scrollY: scrollY || _ui.Dom.clientHeight() < _ui.Dom.scrollHeight()
            };
        },
        mousePosition: function (event) {
            if (event.pageX) {
                return {
                    x: event.pageX,
                    y: event.pageY
                }
            } else {
                return {
                    x: event.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft),
                    y: event.clientY + (document.documentElement.scrollTop || document.body.scrollTop)
                }
            }
        },
        /*
        * set the opacity
        */
        setOpacity: function (pDom, pOpacity) {
            if (pDom.filters) {
                arguments.callee = function (pDom, pOpacity) {
                    pDom.style.filter = "alpha(opacity=" + pOpacity + ")";
                    //pDom.filters.alpha.opacity=pOpacity;
                }
            } else {
                arguments.callee = function (pDom, pOpacity) {
                    pDom.style.opacity = pOpacity / 100;
                }
            }
            arguments.callee(pDom, pOpacity);
        },
        /*
        * get the absolute position
        */
        position: function (pObj) {
            var _left = pObj.offsetLeft || 0,
                _top = pObj.offsetTop || 0;
            while (pObj = pObj.offsetParent) {
                _left += eval(pObj.offsetLeft);
                _top += pObj.offsetTop;
            }
            return { x: _left, y: _top };
        },
        /*
        * select only element (FF!)
        */
        childElement: function (pDom) {
            var _array = [], _temp = pDom.childNodes;
            for (var i = _temp.length - 1; i !== -1; i--) {
                if (_temp[i].nodeType === 1) {
                    _array.unshift(_temp[i]);
                }
            }
            delete _temp;
            return _array;
        },
        /*
        * get the window of the iframe
        */
        iframeWindow: function (pDom) {
            return pDom.contentWindow;
        },
        /*
        * get ehe document of the iframe,care the domain
        */
        iframeDocument: function (pDom) {
            try {
                return pDom.contentDocument || pDom.contentWindow.document || null;
            }
            catch (e) {
                return null;
            }
        },
        /*
        * load img by data-src
        */
        loadImg: function (pDom) {
            if (Core.Browser.isIe()) {
                arguments.callee = function (pDom) {
                    var _src = pDom.getAttribute("data-src");
                    _ui.Dom.setOpacity(pDom, 0);
                    pDom.src = _src;
                    _ui.Animation.fadeIn(pDom);
                }
            } else {
                arguments.callee = function (pDom) {
                    var _src = pDom.getAttribute("data-src");
                    _ui.Dom.setOpacity(pDom, 0);
                    pDom.src = _src;
                    Cmd.addEvent(pDom, "load", function () {
                        _ui.Animation.fadeIn(pDom);
                    });
                }
            }
            arguments.callee(pDom);
        },
        /*
        * load img by data-src
        */
        loadBC: function (pDom) {
            var _src = pDom.getAttribute("data-bcground");
            _ui.Dom.setOpacity(pDom, 0);
            pDom.style.backgroundImage = ["url(", _src, ")"].join("");
            _ui.Animation.fadeIn(pDom);
        },
        /*
        * Load imgs in the dom
        */
        loadImgsInDom: function (pDom) {
            var _imgs = pDom.getElementsByTagName("IMG");
            for (var i = 0, l = _imgs.length; i < l; i++) {
                _ui.Dom.loadImg(_imgs[i]);
            }
        },
        lazyBackGroundInDom: function (pDoms) {
            for (var i = 0, l = pDoms.length; i < l; i++) {
                _ui.Dom.loadBC(pDoms[i]);
            }
        },
        /*
        * imitate form sumbit
        */
        sumbitForm: function (pParam, pAction, pMethod, isNew) {
            var _form = this.createFrom(pParam, pAction, pMethod, isNew);
            _form.submit();
            delete _form;
        },
        sumbitFormByForm: function (pParam, pAction, pMethod) {
            var _iframe = document.getElementById("CoreIFrame"),
                _form = this.createFrom(pParam, pAction, pMethod);
            if (!_iframe) {
                _iframe = document.createElement("IFRAME");
                _iframe.style.display = "none";
                document.getElementsByTagName("BODY")[0].appendChild(_iframe);
            }
            var _frameDoc = UI.Dom.iframeDocument(_iframe).getElementsByTagName("BODY"),
                _body = _frameDoc.length > 0 ? _frameDoc[0] : UI.Dom.iframeDocument(_iframe);
            _body.appendChild(_form);
            _form.submit();
        },
        createFrom: function (pParam, pAction, pMethod, isNew) {
            var _form = document.createElement("FORM"),
                _inner = [],
                _guid = Core.getGuid();
            isNew && (_form.target = "_blank");
            _form.method = pMethod || "get";
            for (var name in pParam) {
                _inner.push(['<input type="hidden" name="', name, '" id="', name, '" value="', pParam[name], '" />'].join(""));
            }
            _inner.push(['<input type="submit" name="submitBtn', _guid, '" id="submitBtn', _guid, '" value="" />'].join(""));
            _form.action = pAction;
            _form.innerHTML = _inner.join("");
            document.body.appendChild(_form);
            return _form;
        },
        addClass: function (pDom, pClassName) {
            var _reg = new RegExp('(\\s|\\t|\\n|\\r|^)' + pClassName + '(?=\\s|\\t|\\n|\\r|$)');
            if (!_reg.test(pDom.className)) pDom.className += " " + pClassName;
        },
        removeClass: function (pDom, pClassName) {
            var _reg = new RegExp('(\\s|\\t|\\n|\\r|^)' + pClassName + '(?=\\s|\\t|\\n|\\r|$)');
            pDom.className = pDom.className.replace(_reg, "");
        },
        getParentNode: function (pDom, pDelegate) {
            var _node = pDom;
            if (_node != null) {
                while (_node.parentNode != null) {
                    _node = _node.parentNode;
                    if (pDelegate(_node)) return _node;
                }
            }
            return _node;
        },
        hasParent: function (pSon, pDoms) {
            var _node = pSon,
                _val = false;
            if (_node != null) {
                while (_node.parentNode != null) {
                    _node = _node.parentNode;
                    for (var i = 0, l = pDoms.length; i < l; i++) {
                        if (pDoms[i] == _node) return true;
                    }
                }
            }
            return _val;
        }
    };

    /*
    * Waterfall Steam Loading Class
    * @constructor
    * @Author:     yulianghuang 
    * @CreateDate  2012/10/19
    */
    _ui.Waterfall = function (containerId) {

        //Container
        var _container = document.getElementById(containerId),

        //Template text
		_template = document.getElementById(_container.getAttribute("data-template")).value,

        //the number of colums
        _columsNumber = +_container.getAttribute("data-columsNumber") || 1,

        //the width of colum
		_columWidth = +_container.getAttribute("data-blockWidth") || (_container.offsetWidth / _columsNumber) >> 0,

        //the margin—top of the new dom 
		_marginValue = _container.getAttribute("data-marginValue") || 0,

        //the data has been handled
        _dataDone = [],

        //the data need to be done
		_dataToDo = [],

		_heightArray = [],

		_page = 0,

        //loading times
		_time = 1,

        //when to pause loading
		_pauseTime = +_container.getAttribute("data-pauseTime") || 10,

        //when to stop loading
		_stopTime = +_container.getAttribute("data-stopTime") || 30,

        //can loading now
		_canLoading = true,

        _hasData = true;

        //Initail the height array
        (function () {
            for (var i = _columsNumber; i !== 0; i--) {
                _heightArray.push(0);
            }
        })();

        //Stop working when the height exceed StopHeight
        this.AjaxUrl = "";

        //The function to create the ajax arguments
        this.GetAjaxArgument = null;

        //This function will be excuted after the waterfull pauses
        this.OnPause = null;

        //This function will be excuted after the waterfull stops
        this.OnStop = null;

        //This function will be excuted after the waterfull restart(restart usually after pause)
        this.OnRestart = null;

        //Loading when (scrollTop + clientHeight > scrollheight - AjaxLoadingLine)
        this.AjaxLoadingLine = 50;

        /*
        * Get the min colum
        * @return {number} the index of the min colum
        */
        var getMinColum = function () {
            /*  从右往左，性能好。。。
            var _minIndex = _columsNumber - 1, i = _minIndex - 1, _minValue = _heightArray[_minIndex];
            while (i !== -1) {
            if (_heightArray[i] < _minValue) {
            _minValue = _heightArray[i];
            _minIndex = i;
            }
            i--;
            }
            return _minIndex;
            */
            var _minIndex = 0, i = _minIndex + 1, _minValue = _heightArray[_minIndex];
            while (i < _columsNumber) {
                if (_heightArray[i] < _minValue) {
                    _minValue = _heightArray[i];
                    _minIndex = i;
                }
                i++;
            }
            return _minIndex;
        },

        /*
        * Get the max height
        * @return {number}
        */
		getMaxColumHeight = function () {
		    var _max = 0, i = _columsNumber - 1;
		    while (i !== -1) {
		        if (_heightArray[i] > _max) {
		            _max = _heightArray[i];
		        }
		        i--;
		    }
		    return _max;
		},

        /*
        * Create new dom and append to the container
        * @param {object} the data from ajax (template use)
        */
        addDom = function (pData) {
            //temp solution
            var temp = document.createElement("div");
            temp.appendChild(_ui.TReplace.getElement(_template, pData).node);
            var dom = temp.getElementsByTagName("div")[0],
			_index = getMinColum();
            dom.style.position = "absolute";
            dom.style.top = _heightArray[_index] + "px";
            dom.style.left = _index * _columWidth + "px";
            _container.appendChild(dom);
            //don't forget to recover the memory
            delete temp;
            _heightArray[_index] += dom.offsetHeight;
            _container.style.height = +_marginValue + getMaxColumHeight() + "px";
        },

        /*
        * Deal with the new datahh
        */
		dealData = function () {
		    while (_dataToDo.length !== 0) {
		        var _data = _dataToDo.shift();
		        if (_data !== undefined) {
		            addDom(_data);
		            //_dataDone.push(_data); //Record Data,to use
		        }
		    }
		},
        /*
        * what to do when scrolling?
        */
		onScrolling = function () {
		    if (_canLoading) {
		        var me = this;
		        //Stop
		        if (_time === _stopTime || !_hasData) {
		            me.stop();
		            //Remove
		            Core.unbind(window, 'resize', arguments.callee.caller);
		            Core.unbind(window, 'scroll', arguments.callee.caller);
		            //Pause
		        } else if (_time !== 0 && _time % _pauseTime === 0) {
		            me.pause();
		            //to do
		        } else if (_ui.Dom.scrollTop() + _ui.Dom.clientHeight() > _ui.Dom.scrollHeight() - me.AjaxLoadingLine) {
		            me.ajaxData();
		        }
		    }
		};

        this.init = function () {
            var me = this;
            setTimeout(function () {
                me.ajaxData();
                var _checkClock = setInterval(function () {
                    if (_ui.Dom.hasScroll().scrollY) {
                        clearInterval(_checkClock);
                    }
                    else {
                        me.ajaxData();
                    }
                }, 10);
                me.BindScoll.call(me);
            }, 100);
        };

        /*
        * bind function to the scroll
        */
        this.BindScoll = function () {
            var me = this;

            //bind event
            Core.bind(window, 'scroll', function () {
                onScrolling.call(me);
            });
            Core.bind(window, 'resize', function () {
                onScrolling.call(me);
            });
        };

        /*
        * mask when ajax:override it
        */
        this.maskShow = function () {

        };

        /*
        * mask when ajax:override it
        */
        this.maskHide = function () {

        }

        /*
        * Handle new data
        * @param {object} 	 the new data
        * @param {funciton}  the callBack function
        */
        this.newData = function (pData) {
            if (Core.isArray(pData) && pData.length > 0) {
                //Add data to the to do queue
                _dataToDo = _dataToDo.concat(pData);
                //Deal the data in the queue '_dataToDo'
                dealData();
            } else {
                _hasData = false;
            }
            //func.apply(this.Array.prototype.slice.call(arguments, 2));	
            _canLoading = true;
        };

        /*
        * Require
        */
        this.ajaxData = function () {
            _canLoading = false;
            var me = this;
            me.maskShow();
            Cmd.ajax(me.AjaxUrl, me.GetAjaxArgument.call(me), function (data) {
                me.newData.call(me, Cmd.fromJson(data)); //eval could be replaced
                me.maskHide();
            });
            _time++;
        };

        /*
        * pause loadging
        */
        this.pause = function () {
            _canLoading = false;
            if (this.OnPause !== null && typeof (this.OnPause) === "function") {
                this.OnPause();
            }
        };

        /*
        * stop loading
        */
        this.stop = function () {
            _canLoading = false;
            if (this.OnStop !== null && typeof (this.OnStop) === "function") {
                this.OnStop();
            }
        };

        /*
        * restart loading after pause
        */
        this.restart = function () {
            this.ajaxData();
            if (this.OnRestart !== null && typeof (this.OnRestart) === "function") {
                this.OnRestart();
            }
        };

        /*
        * Get ajax request number
        * Return {numbet} the number of ajax request
        */
        this.getTime = function () {
            return _time;
        };
    };

    /*
    * Draw page button
    * @constructor
    * @Author:     yulianghuang 
    * @CreateDate  2012/10/31
    */
    _ui.PageBtn = function (pTotal, pUrl, pAttribute) {
        //current page
        var _current = 1,

        //may be target="_blank"
		_archorAttr = pAttribute || "",

        //total page
		_total = pTotal || 1,

        //the max num of the button in the middle
        _buttonSum = 7,

        //...
        _ellipsis = "<span class=\"c_page_ellipsis\">...</span>",

        //basic url
        _baseUrl = pUrl || "vacations.ctrip.com?page=",

        _pagaContainer = document.createElement("div");

        /*
        * create main html
        * @return {string}
        */
        var drawBody = function () {
            var _stringBuilder = [];
            _stringBuilder.push(drawPreview());
            _stringBuilder.push("<div class=\"c_page_list layoutfix\">");
            _stringBuilder.push(drawNumbers());
            _stringBuilder.push("</div>");
            _stringBuilder.push(drawNext());
            _stringBuilder.push(drawGoTo());
            return _stringBuilder.join("");
        },
        /*
        * create the array of number
        * @return {string}
        */
		drawNumbers = function () {
		    var _stringBuilder = [],
			_start = _current - 3;
		    _start = _start > 1 ? _start : 2;
		    _start -= _buttonSum - Math.min(_total - _start, _buttonSum);
		    _start = _start > 1 ? _start : 2;

		    var _end = _start + _buttonSum;
		    _end = _end < _total ? _end : _total;

		    //start
		    _stringBuilder.push(drawNumber(1));

		    //...
		    if (_total > 10 && _current > 5) {
		        _stringBuilder.push(_ellipsis);
		    }
		    //mid
		    for (var i = _start; i < _end; i++) {
		        _stringBuilder.push(drawNumber(i));
		    }

		    //...
		    if (_total > 10 && _current < _total - 4) {
		        _stringBuilder.push(_ellipsis);
		    }
		    //end
		    if (_total !== 1) {
		        _stringBuilder.push(drawNumber(_total));
		    }
		    return _stringBuilder.join("");
		},
        /*
        * create a number button
        * @param  {number} page
        * @return {string}
        */
		drawNumber = function (pNo) {
		    if (_current !== pNo) {
		        return drawAButton("", pNo, _baseUrl + pNo);
		    } else {
		        return drawAButton("current", pNo, "###");
		    }
		},
        /*
        * create a next button
        * @return {string}
        */
		drawNext = function () {
		    if (_current < _total) {
		        return drawAButton("c_down", "下一页", _baseUrl + (_current + 1));
		    } else {
		        return drawAButton("c_down_nocurrent", "下一页", "###");
		    }
		},
        /*
        * create a preview button
        * @return {string}
        */
		drawPreview = function () {
		    if (_current > 1) {
		        return drawAButton("c_up", "上一页", _baseUrl + (_current - 1));
		    } else {
		        return drawAButton("c_up_nocurrent", "上一页", "###");
		    }
		},
        /*
        * create an archor/link
        * @return {string}
        */
		drawAButton = function (pClass, pText, pUrl) {
		    return ["<a ", _archorAttr, " href=\"", pUrl, "\" class=\"", pClass, "\">", pText, "</a>"].join("");
		},
        /*
        * create "到     页"
        * @return {string}
        */
		drawGoTo = function () {
		    return '<div class="c_pagevalue" >到&nbsp;<input type="text" class="c_page_num" >&nbsp;页<input type="button" class="c_page_submit" value="确定"></div>'
		},
        /*
        * get a valid page number
        * @param  {number}
        * @return {number}
        */
		filterPage = function (pNo) {
		    return (typeof pNo === "number" && pNo > 0 && pNo <= _total) ? pNo : 1;
		};

        /*
        * create the html
        * @param  {string|number|null} the cantainer id
        * @return {string}
        */
        this.draw = function (pId) {
            var _strId = pId != null ? "id = " + pId : "";
            var _stringBuilder = [];
            _stringBuilder.push("<div $id class=\"c_page\">".replace("$id", _strId));
            _stringBuilder.push(drawBody());
            _stringBuilder.push("</div>");
            return _stringBuilder.join("");
        };
        /*
        * creat the dom
        * @param  {string|number|null} the cantainer id
        * @return {object}
        */
        this.create = function (pId, pNo) {
            this.go(pNo);
            _pagaContainer.className = "c_page";
            if (pId != null) _pagaContainer.id = "pId";
            _pagaContainer.innerHTML = drawBody();
            return _pagaContainer;
        };

        /*
        * bind event
        * @param    {objecj|null}    the domain which the pFunc will be executed in
        * @param    {function}       the function
        */
        this.bindBtn = function (pDomain, pFunc) {
            var _aBtns = _pagaContainer.getElementsByTagName("a"),
                _inputs = _pagaContainer.getElementsByTagName("input");
            for (var i = _aBtns.length - 1; i !== -1; i--) {
                if (!/###$/.test(_aBtns[i].href)) {
                    Core.bind(_aBtns[i], "click", function (event) {
                        pFunc.call(pDomain, +/([\d]+)$/.exec(event.target.href)[0]);
                        event.stopPropagation();
                        event.preventDefault();
                    })
                }
            }
            Core.bind(_inputs[1], "click", function (event) {
                pFunc.call(pDomain, +_inputs[0].value);
                event.stopPropagation();
                event.preventDefault();
            });

        };

        /*
        * set the total of the page contrl
        * @param {number}
        */
        this.setTotel = function (pTotal) {
            _total = pTotal || 1;
        };

        /*
        * creat the dom
        * @param  {number} set the current page
        */
        this.go = function (pNo) {
            _current = filterPage(pNo);
        };
    };

    /*
    * Draw page
    * @constructor
    * @Author:     yulianghuang
    * @CreateDate  2012/11/8
    * @param     {number}      the total number of pages
    * @param     {string}      the template text
    * @param     {dom}         the dom which contains the new dom created by the template
    * @param     {dom}         the dom which contains the bottons
    * @param     {string}      the ajax address
    * @param     {object|null} page contrl
    */
    _ui.Page = function (pTotal, pTemplate, pMainContainer, pPageContainer, pUrl, pPageObject) {
        //the date template :requied
        var _template = pTemplate || "",
        //the ajax data url
            _url = pUrl || "",
        //the total page:required
            _total = pTotal || 1,
        //current page
            _current = 1,
        //the page contrl
            _page = pPageObject,
        //the main container
            _placeHolderMain = pMainContainer,
        //the page
            _placeHolderBtn = pPageContainer,
        //cache json
            _cache = {},
        //key
            _currentParam = "";

        //the dom which created by the template
        this.Frame = null;
        //the page buttons
        this.Btns = null;

        var check = function (pIndex) {
            return (typeof pIndex === "number" && pIndex > 0 && pIndex <= _total) ? pIndex : 1;
        },
            draw = function (data) {
                var me = this;
                me.Frame = _ui.TReplace.getElement(_template, data).node;
                me.Btns = _page.create(null, _current);
                _page.bindBtn(me, me.go);
                me.onPaging();
                me.maskHide();
                me.afterPaging(data);
            },
            init = function (pData) {
                var me = this;
                _placeHolderBtn.innerHTML = "";
                _placeHolderBtn.appendChild(this.Btns);
                me.afterPaging(pData);
            };

        /*
        * page
        * @params   {number}     index
        * @params   {bool|null}  Is the first time to go?
        */
        this.go = function (pIndex, isFirst) {
            var me = this;
            me.maskShow();
            _current = check.call(me, pIndex);
            me.getData(_current, function (pData) {
                _cache[_currentParam] = pData;
                var _data = Cmd.fromJson(pData);
                draw.call(me, _data);
                if (isFirst) {
                    init.call(me, _data);
                }
            });
        };

        /*
        * reLoad the current page
        */
        this.reflesh = function () {
            this.go(_current);
        };

        /*
        * clear cache
        */
        this.clearCache = function () {
            _cache = {};
        };

        /*
        * get the ajax data:can be override
        * @params    {number|string}     index
        * @return    {string}
        */
        this.getParam = function (pIndex) {
            return "page=" + pIndex;
        };
        /*
        * ajax data: can be override,such as get data from cache
        * @params   {number}    index
        * @params   {function}  call back
        */
        this.getData = function (pIndex, pCallBack) {
            var me = this;
            _currentParam = me.getParam(pIndex);
            if (_cache[_currentParam] !== undefined) {
                pCallBack(_cache[_currentParam]);
            } else {
                Cmd.ajax(_url, _currentParam, pCallBack);
            }
        };
        /*
        * show mask: can be override
        */
        this.maskShow = function () {

        };
        /*
        * hide mask: can be override
        */
        this.maskHide = function () {

        };
        /*
        * running when paging: can be override
        */
        this.onPaging = function () {
            _placeHolderMain.innerHTML = "";
            _placeHolderMain.appendChild(this.Frame);
        };
        /*
        * running after paging: can be override
        */
        this.afterPaging = function (data) {

        };

        /*
        * set the total of the page contrl
        * @param {number}
        */
        this.setTotel = function (pTotal) {
            _total = pTotal || 1;
        }

    };

    /*
    * Animation
    * @namespace Animation
    * @Author:     yulianghuang
    * @CreateDate  2012/10/31
    */
    _ui.Animation = {
        fadeIn: function (pDom, pSpeed, pTarget, pCallBack) {
            var _speed = pSpeed || 20,
			_target = pTarget || 100,
			_val = 0;
            pDom.style.display = "";
            UI.Dom.setOpacity(pDom, _val);
            (function () {
                UI.Dom.setOpacity(pDom, _val);
                _val += 5;
                if (_val <= _target) {
                    //attention the callee is the clouser
                    setTimeout(arguments.callee, _speed);
                } else if (typeof pCallBack === "function") {
                    pCallBack();
                }
            })();
        },
        fadeOut: function (pDom, pSpeed, pTarget, pCallBack) {
            var _speed = pSpeed || 20,
			_target = pTarget || 0,
			_val = 100;
            UI.Dom.setOpacity(pDom, _val);
            (function () {
                UI.Dom.setOpacity(pDom, _val);
                _val -= 5;
                if (_val >= _target) {
                    setTimeout(arguments.callee, _speed);
                } else if (_val < 0) {
                    pDom.style.display = "none";
                    if (typeof pCallBack === "function") {
                        pCallBack();
                    }
                }
            })();
        },
        scrollTo: function (pDom) {
            var _aim = Math.min(UI.Dom.scrollHeight() - UI.Dom.clientHeight(), UI.Dom.position(pDom).y),
                _scrollDown = function () {
                    var _clock = setInterval(function () {
                        var _scTop = UI.Dom.scrollTop();
                        if (_scTop >= _aim) {
                            clearInterval(_clock);
                        } else {
                            UI.Dom.scrollTop(_scTop + Math.min(50, _aim - _scTop))
                        }
                    }, 10);
                },
                _scrollUp = function () {
                    var _clock = setInterval(function () {
                        var _scTop = UI.Dom.scrollTop();
                        if (_scTop <= _aim) {
                            clearInterval(_clock);
                        } else {
                            UI.Dom.scrollTop(_scTop - Math.min(50, _scTop - _aim))
                        }
                    }, 10);
                };
            if (UI.Dom.scrollTop() > _aim) {
                _scrollUp();
            } else {
                _scrollDown();
            }
        }
    };

    /*
    * Animation - Scroll
    * @constructor 
    * @Author:     yulianghuang 
    * @CreateDate  2012/12/17
    */
    _ui.Animation.Scroll = function (pContain, pItem, pIsY, pMoveStep, pMoveSpeed, pMoveInterval, pArrow, pAppendLength) {
        //Property
        this.Container = pContain;
        this.Items = pItem;
        this.Step = null;
        this.MoveStep = pMoveStep || 1;
        this._timer = new Core.Timer(pMoveSpeed, pMoveInterval);
        if (pIsY) {
            this.MoveProperty = "offsetHeight";
            this.ScrollProperty = "scrollTop";
        } else {
            this.MoveProperty = "offsetWidth";
            this.ScrollProperty = "scrollLeft";
        }
        this.Arrow = pArrow || 1;
        //private
        this._index = 0;
        this._itemLength = this.Items.length || 0;
        this._pausePosLength = 0;
        this._pausePos = [];

        //fill blank
        if (this.MoveStep < this._itemLength) {
            this.setStopPos(pAppendLength);
            this.fillContainer();
        }

        //cache
        this.memory = [];
    };
    _ui.Animation.Scroll.prototype = {
        /*
        * fill some element to the container
        * @param {dom} spme valid element
        */
        fillContainer: function () {
            //var _scrollHeight = this.Container
            var _minLength = Math.min(this.MoveStep * 2, this._itemLength),
                _i = 0,
                _tempNode;
            for (; _i < _minLength; _i++) {
                _tempNode = this.Items[_i].cloneNode(true);
                this.Container.appendChild(_tempNode);
            }
        },
        setStopPos: function (pAppendLength) {
            var me = this,
                _appendLength = pAppendLength || 0,
                _currentPos = 0;
            me._pausePosLength = Math.ceil(me._itemLength / me.MoveStep);
            for (var i = 0, l = me._pausePosLength; i < l; i++) {
                for (var j = i * me.MoveStep, k = (i + 1) * me.MoveStep; j < k; j++) {
                    _currentPos += this.getNodeOffset(j, _appendLength);
                }
                me._pausePos[i] = _currentPos;
            }
            me._pausePosLength++;
            me._pausePos.unshift(0);
        },
        move: function () {
            var me = this;
            me.Container[me.ScrollProperty] += me.Arrow;
        },
        beforeMove: function (pDirect) {
            var me = this;
            if (pDirect) {
                if (me._index === me._pausePosLength - 1) {
                    me.Container[me.ScrollProperty] = me._pausePos[0];
                    me._index = 1;
                } else {
                    me._index++;
                }
            } else {
                if (me._index === 0) {
                    me.Container[me.ScrollProperty] = me._pausePos[me._pausePosLength - 1];
                    me._index = me._pausePosLength - 2;
                } else {
                    me._index--;
                }
            }
        },
        getNodeOffset: function (pos, pAppendLength) {
            return pos < this._itemLength ? this.Items[pos][this.MoveProperty] + pAppendLength : 0;
            //return this.Items[pos%this._itemLength][this.MoveProperty];
        },
        init: function () {
            var me = this;
            me._timer.Event.play = function () {
                me.move.call(me);
            };
            me._timer.Event.ifPause = function () {
                return (me.Container[me.ScrollProperty] === me._pausePos[me._index]);
            };
            me._timer.Event.pause = function () {
                me.beforeMove.call(me, me.Arrow > 0);
            };
        },
        wait: function () {
            this._timer.pause();
        },
        stop: function () {
            this._timer.stop();
        },
        play: function () {
            this._timer.play();
        },
        //in ie, "display:none: "will cause some bug,you need the two method followed
        save: function () {
            var me = this;
            me.memory.push({
                index: me._index,
                scroll: me.Container[me.ScrollProperty]
            });
        },
        reset: function () {
            var me = this,
                _memery = me.memory.pop();
            me._index = _memery.index || 0;
            me.Container[me.ScrollProperty] = _memery.scroll || 0;
        }
    };

    /*
    * Animation - Scroll HTML5!!!
    * @constructor
    * @Author:     yulianghuang
    * @CreateDate  2012/12/5
    */
    _ui.Animation.Html5Scroll = function (pWorld, pItems, pIsY, pIsAppand, pMoveSpeed, pMoveInterval, pRectNum, pCombine, pArrow) {
        //Arguments
        this._rectNum = pRectNum;
        this._rectVolume = pCombine.X * pCombine.Y;
        this._isDirectY = pIsY;
        this._timer = new Core.Timer(pMoveSpeed, pMoveInterval);

        //Dom
        this.World = pWorld;
        this.Container = document.createElement("DIV");
        this.Items = [];

        var l = pItems.length;
        for (var i = 0; i < l; i++) {
            this.Items.push(pItems[i].cloneNode(true));
        }

        if (pIsAppand && l % this._rectVolume !== 0) {
            var temp = this.Items[0].cloneNode(),
                _sum = this._rectVolume - l % this._rectVolume;
            temp.innerHTML = "";
            for (var _i = 0; _i < _sum; _i++) {
                this.Items.push(temp.cloneNode());
            }
            delete temp;
        }

        this.ItemLength = this.Items.length;
        this.Rects = [];

        //calculate config
        this._bAngleA = 360 / this._rectNum;
        this._bAngleP = Math.PI * 2 / this._rectNum;
        this._bWidth = pItems[0].offsetWidth * pCombine.X;
        this._bHeight = pItems[0].offsetHeight * pCombine.Y;
        this._bSideLength = this._isDirectY ? this._bHeight : this._bWidth;
        this._bApothem = this._bSideLength / (2 * Math.tan(this._bAngleP / 2)).toFixed(2);

        //config
        this._currentRect = 0;
        this._currentItem = 0;
        this._currentAngle = 0;
        this._arrowKey = this._isDirectY ? "X" : "Y";
        this._arrow = pArrow || 1;
    };

    _ui.Animation.Html5Scroll.prototype = {
        Css: {
            container: function (pDom, pWidth, pHeight, pApothem) {
                pDom.style.webkitTransformStyle = "preserve-3d";
                pDom.style.webkitTransform = "rotateX(0deg)";
                pDom.style.position = "relative";
                pDom.style.width = pWidth + "px";
                pDom.style.height = pHeight + "px";
                pDom.style.webkitTransformOrigin = pWidth / 2 + "px " + pHeight / 2 + "px -" + pApothem.toFixed(2) + "px";
            },
            world: function (pDom, pPerspective, pWidth, pHeight) {
                pDom.style.webkitPerspective = pPerspective || "500px";
                pWidth && (pDom.style.width = pWidth + "px");
                pHeight && (pDom.style.height = pHeight + "px");
                pDom.style.display = "block";
                pDom.style.position = "relative";
                pDom.style.overflow = "hidden";
            },
            rect: function (pDom, pWidth, pHeight) {
                pDom.style.position = "absolute";
                pDom.style.webkitBackfaceVisibility = "hidden";
                pWidth && (pDom.style.width = pWidth + "px");
                pHeight && (pDom.style.height = pHeight + "px");
                pDom.style.overflow = "hidden";
            }
        },
        changeDom: function () {
            var me = this;
            me.Css.world(me.World, null, me._bWidth, me._bHeight);
            me.Css.container(me.Container, me._bWidth, me._bHeight, me._bApothem);
            for (var i = 0; i < me._rectNum; i++) {
                me.Container.appendChild(me.createRect.call(me, i));
            }
            me.fillRect.call(me, 1);
            me.World.innerHTML = "";
            me.World.appendChild(me.Container);
        },
        createRect: function (pIndex) {
            var me = this,
                _rect = document.createElement("DIV"),
                _angel = pIndex * me._bAngleP,
                _v1 = me._bApothem * Math.sin(_angel).toFixed(2),
                _v2 = 0,
                _v3 = (me._bApothem * Math.cos(_angel) - me._bApothem).toFixed(2);
            if (me._isDirectY) {
                _rect.style.webkitTransform = ["translate3d(", _v2, "px,", _v1, "px,", _v3, "px) rotateX(", -me._bAngleA * pIndex, "deg)"].join("");
            } else {
                _rect.style.webkitTransform = ["translate3d(", _v1, "px,", _v2, "px,", _v3, "px) rotateY(", me._bAngleA * pIndex, "deg)"].join("");
            }
            me.Css.rect(_rect, me._bWidth, me._bHeight);
            me.Rects.push(_rect);
            return _rect;
        },
        //1,-1
        beforeMove: function (pIsNext) {
            var me = this,
                _step = pIsNext ? 1 : -1;
            me._currentRect = (me._currentRect + _step + me._rectNum) % me._rectNum;
            me.fillRect.call(me, _step);
        },
        fillRect: function (pStep) {
            var me = this;
            me.Rects[me._currentRect].innerHTML = "";
            for (var i = 0; i < me._rectVolume; i++) {
                me.Rects[me._currentRect].appendChild(me.Items[me._currentItem].cloneNode(true));
                me._currentItem = (me._currentItem + pStep) % me.ItemLength;
            }
        },
        move: function () {
            var me = this;
            me._currentAngle = (me._currentAngle + me._arrow + 360) % 360;
            me.Container.style.webkitTransform = ["rotate" + me._arrowKey + "(", me._currentAngle, "deg)"].join('');
        },
        init: function () {
            var me = this;
            me.changeDom();
            me._timer.Event.play = function () {
                me.move.call(me);
            };
            me._timer.Event.ifPause = function () {
                return (me._currentAngle % (360 / me._rectNum)) == 0;
            };
            me._timer.Event.pause = function () {
                me.beforeMove.call(me, me._arrow > 0);
            };
        },
        wait: function () {
            this._timer.pause();
        },
        stop: function () {
            this._timer.stop();
        },
        play: function () {
            this._timer.play();
        },
        abs: function () {
            var me = this,
                _pos = me._currentAngle / me._bAngleA;
            _pos = (me._arrow > 0) ? Math.ceil(_pos) : Math.floor(_pos);
            me._currentAngle = me._bAngleA * _pos;
            me.Container.style.webkitTransform = ["rotate" + me._arrowKey + "(", me._currentAngle, "deg)"].join('');
        }
    };

    /*
    * AllYes advertisement
    * @constructor
    * @Author:     yulianghuang
    * @CreateDate  2012/11/6
    */
    _ui.AllYes = {
        Top: function (pDom, pAttr) {
            var _dom = pDom,
                _attr = pAttr || "mod_allyes_user",
                _url = _dom.getAttribute(_attr);
            Cmd.addIFrame(_url, null, function (pIFrame) {
                pIFrame.width = "100%";
                pIFrame.height = "100%";
                pIFrame.marginHeight = 0;
                pIFrame.marginWidth = 0;
                pIFrame.frameBorder = 0;
                pIFrame.scrolling = "no";
                pIFrame.style.overflow = "hidden";
                //pIFrame.style.border="none";
            }, null, _dom);
        },
        Pic: function (pDom, pHeight, pWidth) {
            this._container = pDom;
            this._height = pHeight;
            this._width = pWidth;
            this.init = function () {
                var me = this;
                me.createBody.call(me, false);
            }
        },
        Video: function (pDom, pHeight, pWidth, pControlsPanel) {

            var _controlsPanel = pControlsPanel;

            this._container = pDom;
            this._height = pHeight;
            this._width = pWidth;
            this._controls = _controlsPanel.getElementsByTagName("A");
            this._frames = [];
            this._tab = undefined;

            this.init = function () {
                var me = this;
                me.createBody.call(me, true);
                me._container.appendChild(_controlsPanel);
                me._tab = new _ui.FadeTab(me._controls, me._frames, ["current", ""]);
                var _tabCore = me._tab.TabCore,
                     _length = me._frames.length,
                    _clock = undefined,
                    play = function () {
                        pause();
                        _clock = setTimeout(function () {
                            _tabCore.change((_tabCore._currentIndex + 1) % _length);
                        }, 5000);
                    },
                    pause = function () {
                        _clock !== undefined && clearTimeout(_clock);
                    };
                _tabCore.beforeChange = function () {
                    pause.call(me);
                };
                _tabCore.onChange = function () {
                    play.call(me);
                };
                me._tab.init();
                play();
            };
        }
    };
    _ui.AllYes.Video.prototype = _ui.AllYes.Pic.prototype = {
        /*
         * prepare the date for allyes
         */
        getData: function () {
            var me = this,
                _url = me._container.getAttribute("data-allyes");

            Cmd.addIFrame(_url, function (pIFrame) {
                var _iframeDoc = _ui.Dom.iframeDocument(pIFrame),
                    _links = _iframeDoc.getElementsByTagName("A"),
                    _data = [];
                for (var i = 0, l = _links.length; i < l; i++) {
                    var _img = _links[i].getElementsByTagName("IMG")[0];
                    _data.push({
                        href: _links[i].href,
                        src: _img.src,
                        alt: _img.alt
                    });
                }
                me._data = _data;
                me.init.call(me);
            }, function (pIFrame) {
                pIFrame.style.display = "none";
            });
        },
        createBody: function (pIsHide) {
            var me = this,
                _point;
            for (var i = 0, l = me._data.length; i < l; i++) {
                var _a = document.createElement("A");
                _point = me._data[i];
                _a.href = _point.href;
                _a.target = "_blank";
                _a.innerHTML = ["<img width=\"", me._width, "\" height=\"", me._height, "\" alt=\"", _point.alt, "\" src=\"", _point.src, "\">"].join("");
                if (pIsHide) {
                    i !== 0 && (_a.style.display = "none");
                    me._frames.push(_a);
                }
                this._container.appendChild(_a);
            }
        }
    }

    /*
    * Tab Change Mode
    * @constructor
    * @Author:     yulianghuang
    * @CreateDate  2012/11/6
    */
    _ui.Tab = function (pContrls, pFrames, pContrlClass, pFramesClass, pMode, pCheck) {
        //state
        this._canClick = true;
        this._currentIndex = 0;
        //on off
        this._contrlClass = pContrlClass || ["", ""];
        this._contrls = pContrls || [];
        this._frames = pFrames || [];
        this._frameClass = pFramesClass;
        this.onChange = function () { };
        this.beforeChange = function () { };
        this.lock = false;
        this.Mode = pMode || "click";
        /*
        * hide:can be override
        */
        this.hide = function (pIndex) {
            if (this._frameClass) {
                this._frames[pIndex].className = this._frameClass[1];
            } else {
                this._frames[pIndex].style.display = "none";
            }
            this._contrls[pIndex].className = this._contrlClass[1];
        };
        /*
        * show:can be override
        */
        this.show = function (pIndex) {
            if (this._frameClass) {
                this._frames[pIndex].className = this._frameClass[0];
            } else {
                this._frames[pIndex].style.display = "";
            }
            this._contrls[pIndex].className = this._contrlClass[0];
        };
        if (pCheck) {
            this.repair();
        }
    };
    _ui.Tab.prototype = {
        change: function (pIndex) {
            if (pIndex !== this._currentIndex && !this.lock) {
                this.beforeChange(pIndex);
                var _pre = this._currentIndex;
                this._currentIndex = pIndex;
                this.hide(_pre);
                this.show(pIndex);
                this.onChange(pIndex);
            }
        },
        /*
        * init Event
        */
        init: function () {
            var me = this;
            for (var i = me._contrls.length - 1; i !== -1; i--) {
                (function (i) {
                    Core.bind(me._contrls[i], me.Mode, function (event) {
                        if (Core.fixMouseEvent(event, event.target)) {
                            me.change(i);
                            //event.stopPropagation();
                            //event.preventDefault();
                        }
                    });
                })(i);
            }
        },
        /*
        * take the element from the textarea
        * @param   {dom}        textarea
        */
        takeTextareas: function (pDoms) {
            for (var i = pDoms.length - 1; i !== -1; i--) {
                if (pDoms[i].tagName === "TEXTAREA") {
                    pDoms[i].parentNode.innerHTML = pDoms[i].value;
                }
            }
        },
        ajaxTextarea: function (pDoms, pFunc) {
            var length = pDoms.length,
                toDo = length;
            for (var i = 0; i < length; i++) {
                (function (i) {
                    Cmd.ajax(pDoms[i].getAttribute("data-url"), pDoms[i].getAttribute("data-param"), function (data) {
                        toDo--;
                        pDoms[i].parentNode.innerHTML = data;
                        if (toDo === 0) {
                            pFunc();
                        }
                    });
                })(i);
            }
        },
        ajaxOrTakeTextArea: function (pDoms, pFunc) {
            var arr1 = [], arr2 = [];
            for (var i = pDoms.length - 1; i !== -1; i--) {
                if (pDoms[i].getAttribute("data-url") != null) {
                    arr2.push(pDoms[i]);
                } else {
                    arr1.push(pDoms[i]);
                }
            }
            this.takeTextareas(arr1);
            if (arr2.length > 0) {
                this.ajaxTextarea(arr2, pFunc);
            } else {
                pFunc();
            }
        },
        /*
        *repair when the contrls'length greater than the frames'length
        */
        repair: function () {
            var _fl = this._frames.length,
                _cl = this._contrls.length;
            if (_fl < _cl) {
                this._contrls.splice(_fl, _cl - _fl);
            }
        }
    };

    /*
    * Tab Change Mode With the FadeIn/Out effect
    * @constructor
    * @Author:     yulianghuang
    * @CreateDate  2012/12/6
    */
    _ui.FadeTab = function (pContrls, pFrames, pContrlClass, pFramesClass, pCheck) {
        var _tab = new _ui.Tab(pContrls, pFrames, pContrlClass, pFramesClass, pCheck);
        this.TabCore = _tab;
        /*
        * Override the change function of the tab mode
        */
        _tab.change = function (pIndex) {
            if (pIndex !== _tab._currentIndex && !_tab.lock) {
                var _pre = _tab._currentIndex;
                _tab.lock = true;
                _tab.beforeChange(pIndex);
                _tab._currentIndex = pIndex;
                _tab._contrls[_pre].className = _tab._contrlClass[1];
                _tab._contrls[pIndex].className = _tab._contrlClass[0];
                _ui.Animation.fadeOut(_tab._frames[_pre], 30, 0, function () {
                    if (_tab._frameClass) {
                        _tab._frames[_pre].className = _tab._frameClass[1];
                        _tab._frames[pIndex].className = _tab._frameClass[0];
                    }
                    _tab.lock = false;
                });
                _ui.Animation.fadeIn(_tab._frames[pIndex], 20, 100, function () {
                    _tab.onChange(pIndex);
                });
            }
        };
    };
    _ui.FadeTab.prototype = {
        init: function () {
            this.TabCore.init();
        }
    }
    /*
    * Radio Change Mode
    * @constructor
    * @Author:     yulianghuang
    * @CreateDate  2012/11/14
    */
    _ui.Radio = function (pContrl, pAim, pClasses, pContrlText, pContrlClass) {
        var _contrl = pContrl,
        _aim = pAim,
        _classes = pClasses,
        _contrlText = pContrlText,
        _contrlClass = pContrlClass;
        this.onChange = function () {
            if (_aim.className === _classes[0]) {
                _aim.className = _classes[1];
                _contrlText && (_contrl.innerHTML = _contrlText[1]);
                _contrlClass && (_contrl.className = _contrlClass[1]);
            } else {
                _aim.className = _classes[0];
                _contrlText && (_contrl.innerHTML = _contrlText[0]);
                _contrlClass && (_contrl.className = _contrlClass[0]);
            }
        };
        this.init = function () {
            var me = this;
            Core.bind(_contrl, "click", function () {
                me.onChange();
            });
        };
    };

    /*
    * Vote Mode ★★★★☆
    * @constructor
    * @Author:     yulianghuang
    * @CreateDate  2012/11/6
    */
    _ui.Vote = function (pTip, pContainer, pBtns, pClass, pUrl) {
        this._tip = pTip;
        this._voteContainer = pContainer;
        this._voteBtn = pBtns;
        //base
        this._voteClass = pClass;
        //the server url
        this._voteUrl = pUrl;
        //execute when vote
        this.onVote = null;
        //execute to get post data
        this.onGetData = null;
    };
    _ui.Vote.prototype = {
        /*
        * vote
        * param  {event}   event
        */
        vote: function (event, i) {
            var me = this;
            me.sendRequest(event.target.getAttribute("data-mark") || i + 1);
            if (typeof me.onVote === "function") {
                me.onVote();
            }
            event.stopPropagation();
            event.preventDefault();
        },
        /*
        * send request to the server
        * param  {number}   mark
        */
        sendRequest: function (mark) {
            var me = this,
                _data = typeof this.onGetData === "function" ? this.onGetData(mark) : "mark=" + mark;
            Cmd.ajax(me._voteUrl, _data);
        },
        /*
        * hover
        * param  {event}   event
        */
        hover: function (event, i) {
            var me = this,
                _target = event.target;
            me._tip.innerHTML = _target.getAttribute("data-tip") || me.defaultTip[i] || "";
            me._voteContainer.className = me._voteClass + (_target.getAttribute("data-mark") || i + 1);
        },
        /*
        *  default tip
        */
        defaultTip: ["1分 非常无趣", "2分 马马虎虎", "3分 感觉还行", "4分 很给力哦", "5分 相当满意"],
        /*
        * bind event
        */
        init: function () {
            var me = this;
            for (var i = me._voteBtn.length - 1; i !== -1; i--) {
                (function (i) {
                    Core.bind(me._voteBtn[i], "click", function (event) {
                        me.vote(event, i);
                    });
                    Core.bind(me._voteBtn[i], "mouseover", function (event) {
                        me.hover(event, i);
                    });
                })(i);
            }
        }
    };

    /*
    * Lazy Load Pic
    * @constructor
    * @Author:     yulianghuang
    * @CreateDate  2012/11/19
    */
    _ui.LazyLoad = {
        /*
        * Lazy Load Img
        */
        img: function (pNeedUnBind) {
            var _cmd = new Core.Thread(),
                _needUnBind = pNeedUnBind,
                _loadAll = false,
            /*
            * bind event
            */
                bind = function () {
                    var me = this;
                    Core.bind(window, 'scroll', function (event) {
                        fire.call(me);
                        if (_needUnBind && _loadAll) {
                            Core.unbind(window, 'scroll', arguments.callee);
                        }
                    });
                    Core.bind(window, 'resize', function (event) {
                        fire.call(me);
                        if (_needUnBind && _loadAll) {
                            Core.unbind(window, 'resize', arguments.callee);
                        }
                    });
                },
            /*
            * start Load
            */
                fire = function () {
                    var _queue = _cmd.getPQueue();
                    if (_queue.length > 0) {
                        if (_ui.Dom.scrollTop() + _ui.Dom.clientHeight() + 100 > -_queue[0]) {
                            _cmd.fireArray();
                            return true;
                        }
                    } else {
                        _loadAll = true;
                        return false;
                    }
                },
            /*
            * do when loading
            */
                download = function (pDom) {
                    var me = this;
                    if (pDom) {
                        _ui.Dom.setOpacity(pDom, 0);
                        pDom.onload = function () {
                            me.imgLoad.call(me, pDom);
                        };
                        pDom.onerror = function () {
                            me.imgError.call(me, pDom);
                        };
                        pDom.src = pDom.getAttribute("data-src");
                    }
                };
            /*
            * do when img load
            */
            this.imgLoad = function (pDom) {
                _ui.Animation.fadeIn(pDom);
            };

            /*
            * do when img load fail
            */
            this.imgError = function (pDom) {

            };
            /*
            * add img to lazy load
            */
            this.add = function (pDom) {
                var me = this;
                _cmd.add(function (_pDom) {
                    download.call(me, _pDom);
                }, -UI.Dom.position(pDom).y, pDom);
            };
            /*
            * init the lazy mode
            * @param {array} Doms
            */
            this.init = function (pDoms) {
                var me = this;
                for (var i = 0, l = pDoms.length; i < l; i++) {
                    (function (i) {
                        me.add.call(me, pDoms[i]);
                    })(i);
                }
                //wait brower's reflash
                setTimeout(function () {
                    while (fire.call(me)) {

                    }
                    bind.call(me);
                }, 100);

            };
        },
        /*
        * lazy excute
        * @constructor
        * @Author:     yulianghuang
        * @CreateDate  2012/12/13
        * @param [{
        *     when:function(){},
        *     func:function(),
        *     isAsync:false(if true ,do need call back)
        * },{……}]
        *
        */
        Task: function (pTask) {
            var _task = pTask || [],
                _isLock = false,
            /*
            * bind the function to the window scroll
            */
                bind = function () {
                    var me = this;
                    Core.bind(window, 'scroll', function (event) {
                        fire.call(me);
                        if (_task.length === 0) {
                            Core.unbind(window, 'scroll', arguments.callee);
                        }
                    });
                    Core.bind(window, 'resize', function (event) {
                        fire.call(me);
                        if (_task.length === 0) {
                            Core.unbind(window, 'resize', arguments.callee);
                        }
                    });
                },
            /*
            * fire one task
            */
                fire = function () {
                    var me = this;
                    if (!_isLock && _task.length > 0 && _task[0].when()) {
                        _isLock = true;
                        if (_task[0].isAsync) {
                            _task.shift().func(function () {
                                _isLock = false;
                                fire.call(me);
                            });
                        } else {
                            _task.shift().func();
                            _isLock = false;
                            fire.call(me);
                        }
                    }
                };
            /*
            * add task
            */
            this.push = function (pItem) {
                _task.push(pItem);
            };
            /*
            * romove task
            */
            this.unshift = function (pItem) {
                _task.unshift(pItem);
            };
            /*
            * init the class
            */
            this.init = function () {
                setTimeout(function () {
                    fire();
                    bind();
                }, 100);
            };
        }
    };

    /*
    * give some common function
    */
    _ui.LazyLoad.Task.prototype = {
        ItemDomY: function (pDom, pFunc, pPlus, pIsAsync) {
            this.when = function () {
                return _ui.Dom.scrollTop() + _ui.Dom.clientHeight() + (pPlus || 0) > _ui.Dom.position(pDom).y;
            };
            this.isAsync = pIsAsync;
            this.func = pFunc;
        },
        ItemPosY: function (pPos, pFunc) {
            this.when = function () {
                return _ui.Dom.scrollTop() + _ui.Dom.clientHeight() > pPos;
            };
            this.func = pFunc;
        },
        ItemScroll: function (pFunc, pPlus) {
            this.when = function () {
                return _ui.Dom.scrollTop() + _ui.Dom.clientHeight() > _ui.Dom.scrollHeight() - (pPlus || 0);
            };
            this.func = pFunc;
        }
    };

    /*
    * SNS
    * @constructor
    * @Author:     fanli,yulianghuang
    * @CreateDate  2012/11/6
    */
    _ui.SNS = {
        ShareUrl: {
            sina: "http://service.weibo.com/share/share.php?url={$url}&title={$content}&pic={$pic}&appkey=968446907",
            qq: "http://v.t.qq.com/share/share.php?url={$url}&title={$content}&pic={$pic}&appkey=e5d288d65a1143e59c49231879081bb0&site=www.ctrip.com",
            renren: "http://share.renren.com/share/buttonshare?link={$url}&title={$content}",
            qzone: "http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url={$url}&title={$content}&pics={$pic}&site={$from}",
            kaixin: "http://campaign.ctrip.com/Destinations/fenxiang/fenxiang.asp?type=1&url={$url}&ti={$content}",
            douban: "http://campaign.ctrip.com/Destinations/fenxiang/fenxiang.asp?type=5&url={$url}&ti={$content}",
            souhu: "http://t.sohu.com/third/post.jsp?url={$url}&title={$content}&pic={$pic}&appkey=&content=utf-8",
            163: "http://t.163.com/article/user/checkLogin.do?info={$content}{$url}&images={$pic}&togImg=true&link=http://www.ctrip.com/&source={$from}"
        },
        ShareInfo: {
            content: encodeURIComponent(document.title),
            url: encodeURIComponent(document.location),
            pic: (function () {
                var result = [];
                var pic_list = document.getElementById("player-pic-list");
                if (pic_list) {
                    pic_list = pic_list.getElementsByTagName("img");
                    if (pic_list && pic_list.length) {
                        for (var i = 0, l = pic_list.length; i < l; i++) {
                            result[i] = pic_list[i].getAttribute("bsrc");
                        }
                    }
                }
                return {
                    sina: result.join("||"),
                    qq: result.join("|"),
                    qzone: result.join("|"),
                    souhu: result.length ? result[0] : "",
                    163: result.join(",")
                };
            })(),
            from: encodeURIComponent("携程旅行网")
        },
        share: function (type) {
            var shareUrl = _ui.SNS.ShareUrl, shareInfo = _ui.SNS.ShareInfo;
            window.open(shareUrl[type].replace(/\{\$(\w+)\}/g, function (all, key) {
                if (key === "pic") {
                    return shareInfo.pic[type];
                }
                else {
                    return shareInfo[key];
                }
            }), '', 'width=700, height=680, top=0, left=0, toolbar=no, menubar=no, scrollbars=no, location=yes, resizable=no, status=no');
        }
    };

    window.UI = _ui;

})();
































