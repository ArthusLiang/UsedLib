//The Final Clouser
//author:Arthus 2012.10
//The map loading mangement mode
(function () {
    var currentMap = window.$$Global.MapConfig.Mode,
        modeType=window.$$Global.MapConfig.VmapUrl,
    // The task queue
    queue = [],
    //If the google map API is loaded....(include gaode - -)

    urlConfig = {
        GMAP: "https://maps.google.com/maps/api/js?sensor=false&callback=MapCallBack",
        AMAP: "http://api.amap.com/webapi/init?v=1.1",
        VMAP: modeType
    },
    //the main 
    _loadHelper = function (func) {
        //if the map is loaded ,exec function immidiately
        //else push the function into the queue
        if (window.VMap !== undefined) {
            func();
        } else {
            queue.push(func);
        }
    };

    //The callBack function for google
    window.MapCallBack = function () {
        window.InitVmap();
        while (queue.length > 0) {
            queue.pop()();
        }
    }

    /*
     * add one javascript
     * @param    {string}      src
     * @param    {object|null} callback function,arguments followed
     */
    var loadMapJs = function (osrc, callBack) {
        var js = document.createElement("script"),
            _arguments = Array.prototype.slice.call(arguments, 2);
        js.charset = "UTF-8";
        js.src = osrc;
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

    loadMapJs(urlConfig.VMAP,function(){
        loadMapJs(urlConfig[currentMap], function () {
            if(currentMap != "GMAP"){
                MapCallBack();
            }
        });
    });

    window.LoadMap = _loadHelper;
})();