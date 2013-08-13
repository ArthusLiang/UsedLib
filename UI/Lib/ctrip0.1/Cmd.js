/*
 * the initail mode
 * @Author:     yulianghuang
 * @CreateDate  2012/11/5
 */
(function () {
    var _cmd = {};
    //jsonp的时候回调函数用
    _cmd.JsonPData=undefined,
    /*
     * Ajax Mode     internal
     * @param  {string}         url
     * @param  {string}         requestType:post,get...
     * @param  {string|null}    arguments、
     * @param  {function|null}  callback function
     */
    _cmd.ajax = function (url, content, callback) {
        var xmlVer = ["MSXML2.XMLHTTP", "Microsoft.XMLHTTP"], xmlObj;
        try {
            xmlObj = new XMLHttpRequest();
        } catch (e) {
            for (var i = 0; i < xmlVer.length; i++)
                try {
                    xmlObj = new ActiveXObject(xmlVer[i]);
                    break;
                } catch (e) { }
        }
        if (!xmlObj)
            return;
        xmlObj.open(content ? "POST" : "GET", url || location.href, !!callback);
        //xmlObj.setRequestHeader("Content-Type", "text/javascript");
        xmlObj.setRequestHeader("Content-Type", "application\/x-www-form-urlencoded");
        //xmlObj.setRequestHeader("Content-Type", "application\/x-javascript");
        xmlObj.setRequestHeader("If-Modified-Since", new Date(0));
        function getReturnValue() {
            return (xmlObj.status == 200 ? (/xml/i.test(xmlObj.getResponseHeader("content-type")) ? xmlObj.responseXML : xmlObj.responseText) : null);
        }
        if (callback)
            xmlObj.onreadystatechange = function () {
                if (xmlObj.readyState == 4) {
                    var txt = getReturnValue();
                    if (callback(txt) === true) {
                        setTimeout(function () {
                            _cmd.ajax(url, content, callback);
                        }, 1000);
                    }
                }
            };
        xmlObj.send(content || "");
        return callback ? xmlObj : getReturnValue();
    };
    /*
     * convert string to json
     * @param     {string}      the json string
     * @param     {object}      the json object
     */
    _cmd.fromJson = function (pData) {
        var variable;
        try {
            variable=eval("("+pData+")");
        } catch(e){};
        return variable;
    };
    /*
     * Cookie Mode
     * @Author:     yulianghuang
     * @CreateDate  2012/11/5
     */
    _cmd.Cookie = new function () {
        var _obj = {};
        /*
         * transform the cookie string to the javascript object
         * @return {object} cookie object
         */
        this.GetCookieObj = function () {
            var cookies = document.cookie.split("; "),
                _temp;
            _obj={};
            for (var i = cookies.length - 1; i !== -1; i--) {
                _temp = cookies[i].split("=");
                if (_temp.length > 1) {
                    var _key=_temp[0];
                    _temp.shift();
                    _obj[_key] = _temp.join("=");
                }
            }
            return _obj;
        };
        /*
         * get the cookie value by key
         * @param   {string}        key
         * @return  {string|null}   value
         */
        this.GetCookie = function (key) {
            this.GetCookieObj();
            return _obj[key];
        };
        /*
         * set the cookie value (temp use)
         */
        this.SetCookie=function(key,value){
            document.cookie = key+"="+value;
        };

    };

    /*
     * add event
     * @param   {dom}      the dom which you bind event to
     * @param   {string}   the tpye name of the function
     * @param   {function} the function
     */
    _cmd.addEvent=function(obj,type,fn){
        if(obj.addEventListener) obj.addEventListener(type,fn,false);
        else if(obj.attachEvent){
            obj["e"+type+fn]=fn;
            obj[type+fn]=function(){obj["e"+type+fn](window.event);}
            obj.attachEvent("on"+type,obj[type+fn]);
        }
    };
    /*
     * remove event
     * @param   {dom}      the dom which you bind event to
     * @param   {string}   the tpye name of the function
     * @param   {function} the function
     */
    _cmd.removeEvent=function(obj,type,fn){
        if(obj.removeEventListener) obj.removeEventListener(type,fn,false);
        else if(obj.detachEvent){
            obj.detachEvent("on"+type,obj[type+fn]);
            obj[type+fn]=null;
            obj["e"+type+fn]=null;
        }
    }

    /*
     * Cookie Mode
     * @Author:     yulianghuang
     * @CreateDate  2012/12/19
     * @param      {string}             the link address of the iframe
     * @param      {function|null}      the callBack function
     * @param      {function|null}      this function will be executed before the iframe starts to load
     * @param      {string|null}        the charset of the iframe
     * @param      {dom|null}           the node which the iframe will be appended to,null refers to body
     */
    _cmd.addIFrame=function(pSrc,pCallBack,pSetIframe,pCharset,pParentNode){
        var  _iframe=document.createElement("IFRAME"),
             _parent=pParentNode || document.getElementsByTagName("BODY")[0];
        _iframe.src =pSrc;
        _iframe.charset = pCharset || "UTF-8";
        typeof pSetIframe ==="function" && pSetIframe(_iframe);
        _cmd.addEvent(_iframe,"load",function(){
            typeof pCallBack ==="function" && pCallBack(_iframe);
        });
        _parent.appendChild(_iframe);
    };


    /*
    * the script load mode
    * @Author:     yulianghuang
    * @CreateDate  2012/11/5
    */
    _cmd.Load = new function () {
        //variable
        var _jCookie = _cmd.Cookie.GetCookie("privateJs") || "",
            //cookieValue
            _jCookieArray=_jCookie.split(","),
            //is debug
            _isDebug = _jCookieArray.length>1,

            //addList use
            _toDo = 0;
        this.ReleaseNo=undefined;
        this.MergeUrl=undefined;
        //write
        this.IsCreateMerge=false;
        //read

        this.IsLoadMerge=false;
        //method
        var addItem = function (pObj, pIndex) {
                var me = this,
                    _self = arguments.callee;
                if (pIndex < pObj.length) {
                    var _obj = pObj[pIndex];
                    if (Object.prototype.toString.call(_obj) === '[object Array]') {
                        var l = _toDo = _obj.length;
                        for (var i = 0; i < l; i++) {
                            me.addJs.call(me,_obj[i], function (pObj, pIndex) {
                                _toDo--;
                                if (_toDo === 0) {
                                    _self.call(me, pObj, pIndex + 1);
                                }
                            }, pObj, pIndex);
                        }
                    } else if (typeof _obj === "string") {
                        me.addJs.call(me,_obj, function () {
                            _self.call(me, pObj, pIndex + 1);
                        });
                    } else {
                        _self.call(me, pObj, pIndex + 1);
                    }
                }
            },
            createMerge=function(pSrcList){
                var _arr=[];
                for(var i=0;i<pSrcList.length;i++){
                    _arr=_arr.concat(pSrcList[i]);
                }
                var _source=_arr.join(","),
                    _ajaxUrl="http://localhost/webresource/MergeHandler.ashx",
                    _ajaxParam=["newFile=",this.MergeUrl,"&source=",_source].join("");
                Cmd.ajax(_ajaxUrl,_ajaxParam,function(data){

                });
            },
            config=function(){
                var _temp = _cmd.Cookie.GetCookie("MergeUrl");
                if(_temp){
                    this.MergeUrl=_temp;
                    this.IsLoadMerge=true;
                }
            };
        //window.CMD.Load.addList(["/r1.js","/r2.js","/ir3.js"],"/ir3.js","/ir3.js");
        this.addList = function () {
            var me =this;
            if(this.IsLoadMerge && this.MergeUrl!==undefined){
                this.addJs.call(me,this.MergeUrl);
            }else{
                var _srcs = Array.prototype.slice.call(arguments);
                addItem.call(this, _srcs, 0);
                if(this.MergeUrl!== undefined && this.IsCreateMerge){
                    createMerge.call(me,_srcs);
                }
            }
        };

        /*
        * get javascripts from a merge page     window.CMD.Load.mergeJs("/r1.js,/r2.js,r3.js","merge.js?src=");
        * @param  {string}         srcs
        * @param  {string}         mergePage
        * @param  {function|null}  callback function,arguments followed
        */
        this.mergeJs = function (pSrcs, pMergeUrl, callBack) {
            var _arguments = Array.prototype.slice.call(arguments, 3),
                me=this;
            this.addJs.call(me,pMergeUrl + pSrcs, callBack, _arguments)
        };

        /*
        * add one javascript
        * @param    {string}      src
        * @param    {object|null} callback function,arguments followed
        * @param    {boolen}      not use releaseNo
        */
        this.addJs = function (osrc, callBack,isJsonP,pCharset) {
            var js = document.createElement("script"),
            _arguments = Array.prototype.slice.call(arguments, 2);
            if (_isDebug) {
                osrc.replace(_jCookieArray[0], _jCookieArray[1]);
            }
            js.charset =pCharset || "UTF-8";
            js.src = (this.ReleaseNo===undefined || isJsonP) ? osrc:osrc+"?releaseno="+this.ReleaseNo;
            js.type = "text/javascript";
            document.getElementsByTagName("head")[0].appendChild(js);
            js.onload = js.onreadystatechange = function () {
                if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
                    if (callBack != null) {
                        callBack.apply(this, _arguments)
                    }
                    js.onload = js.onreadystatechange = null;
                }
            };
        };
        config();
    };

     var _plugNode = _cmd.Cookie.GetCookie("PlugNode");
     if(_plugNode){
         _cmd.Load.addJs(_plugNode+"/common/breathe.js",function(){
             _cmd.Load.addJs(_plugNode+"/pre/plug.js");
         });
     }

    window.Cmd = _cmd;
})();