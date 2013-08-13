/*
 * The Map Api in the GoogleMap Format mostly
 * @Description If the object needs to be packaged with some method,we put the original object the proprety of our object. Else the instuctor method of our object will return the original object.
 * @Author:     yulianghuang
 * @CreateDate  2012/10
 */
(function () {
    var currentMap =window.$$Global.MapConfig.Mode;
    //The mode to Enable the Api has been loaded, not finishedd
    //InitVacationMap();
    window.InitVmap = InitVacationMap;

    //Init Function
    function InitVacationMap() {
        //The Map Common method
        var Merge = function (def, op) {
            var temp = Clone(def);
            if (op != null) {
                for (var p in op) {
                    temp[p] = Clone(op[p]);
                }
            }
            return temp;
        },
        isArray=function (pObj) {
            return Object.prototype.toString.call(pObj) === '[object Array]';
        },
        /*
         * deep clone the obj
         * @para   {object} source object
         * @return {object} the new obect
         */
        Clone=function (pObj) {
            var o;
            if (typeof pObj === "object") {
                if (pObj === null) {
                    o = null;
                } else {
                    if (isArray(pObj)) {
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
        ChangeProprety = function (obj, souce, aim) {
            if (obj[souce] !== undefined) {
                obj[aim] = obj[souce];
                //we don't delete the souce ,just because we want to avoid deep clone
            }
        },
        //class
		_gMap = {
		    //Init
		    Map: function (containerId, options) {
		        var _options = Merge({
		            latLng: [39.915, 116.404],
		            zoom: 10,
		            mapTypeId: google.maps.MapTypeId.ROADMAP,
                    hasContrl:true,
                    foldOverView:true
		        }, options);
		        this.Obj = new google.maps.Map(document.getElementById(containerId), {
		            panControl: true,
		            zoomControl: _options.hasContrl ,
		            mapTypeControl: true,
		            scaleControl: _options.hasContrl,
		            streetViewControl: true,
		            overviewMapControl: _options.hasContrl,
                    overviewMapControlOptions:{opened:_options.foldOverView},
                    center: new google.maps.LatLng(_options.latLng[0], _options.latLng[1]),
		            zoom: _options.zoom,
		            mapTypeId: _options.mapTypeId
		        });
		    },
		    // a point in geographical coordinates: latitude and longitude
		    LatLng: function (lat, lng) {
		        this.lat = lat;
		        this.lng = lng;
		        this.Obj = new google.maps.LatLng(lat, lng);
		    },
		    Marker: function (options) {
		        if (options.position != null && options.position.Obj != null) options.position = options.position.Obj;
		        this.Obj = new google.maps.Marker(options);
		    },
		    //Arguments:position，zIndex，icon，content(title),cursor,visible,shadow,draggable
		    MarkerImage: function (url, size, origin) {
		        var _size = size ? size.Obj : null,
				_orign = origin ? origin.Obj : null;
		        return new google.maps.MarkerImage(url, size, origin);
		    },
		    Point: function (x, y) {
		        this.X = x;
		        this.Y = y;
                this.Obj=new google.maps.Point(x, y);
		    },
		    //google map has two more arguments,but AMap don't support.
		    Size: function (width, height) {
		        this.Width = width;
		        this.Height = height;
		        return new google.maps.Size(width, height);
		    },
            MyOverLayer:function(pDom,pLatLng,pOffset){
                this.LatLng=pLatLng;
                this.Dom=pDom;
                this.Offset=pOffset;
            }
		},

		_aMap = {
		    //Init
		    Map: function (containerId, options) {
		        var _options = Merge({
		            latLng: [39.915, 116.404],
		            zoom: 10,
                    hasContrl:true,
                    foldOverView:true
		        }, options);
		        var me = this.Obj = new AMap.Map(containerId, {
		            center: new AMap.LngLat(_options.latLng[1], _options.latLng[0]),
		            level: _options.zoom
		        });
                if(_options.hasContrl){
                    me.plugin(["AMap.ToolBar", "AMap.OverView,AMap.Scale"], function () {
                        me.addControl(new AMap.ToolBar({
                            direction: true,
                            ruler: true,
                            autoPosition: false
                        }));
                        me.addControl(new AMap.OverView({isOpen:_options.foldOverView}));
                        me.addControl(new AMap.Scale());
                    });
                }
		    },
		    // a point in geographical coordinates: latitude and longitude
		    LatLng: function (lat, lng) {
		        this.lat = lat;
		        this.lng = lng;
		        this.Obj = new AMap.LngLat(lng, lat);
		    },
		    //Arguments:position，zIndex，icon，content(title),cursor,visible,shadow
		    Marker: function (options) {
		        if (options.position != null && options.position.Obj != null) options.position = options.position.Obj;
		        if (options.title != null && options.icon != null) {
                    options.content = ["<img src=\"", options.icon.image, "\" title=\"", options.title, "\"></img>"].join("");
		        }
		        this.Obj = new AMap.Marker(options);
		    },
		    MarkerImage: function (url, size, origin) {
		        var _option = { image: url };
		        if (size) _option.size = size.Obj;
		        if (origin) _option.imageOffset = origin.Obj;
		        return new AMap.Icon(_option);
		    },
		    Point: function (x, y) {
		        this.X = x;
		        this.Y = y;
                this.Obj= new AMap.Pixel(x, y);
		    },
		    Size: function (width, height) {
		        this.Width = width;
		        this.Height = height;
		        return new AMap.Size(width, height);
		    },
            MyOverLayer:function(pDom,pLatLng,pOffset){
                this.LatLng=pLatLng;
                this.Dom=pDom;
                if(pDom!=null && pDom.tagName!=="DIV"){
                    var _temp =document.createElement("DIV");
                    _temp.appendChild(pDom);
                    this.Dom = _temp;
                }else{
                    this.Dom=pDom;
                }
                this.Dom.style.zIndex=1010;
                this.Offset=pOffset;
                var _args={position: this.LatLng.Obj,content: this.Dom,zIndex:10};
                if(pOffset!=null &&pOffset.Obj!=null){
                    _args.offset=pOffset.Obj;
                }
                this.Obj= new VMap.Marker(_args).Obj;
            }
		};

        //prototpye
        _gMap.Map.prototype = {
            //Set or Get the map center
            setCenter: function (LatLng) {
                this.Obj.setCenter(LatLng.Obj);
            },
            getCenter: function () {
                var temp = this.Obj.getCenter();
                return new _gMap.LatLng(temp.Xa, temp.Ya);
            },
            //Set or Get the map zoom
            setZoom: function (num) {
                this.Obj.setZoom(num);
            },
            getZoom: function () {
                return this.Obj.getZoom();
            }
        };

        //Marker
        _gMap.Marker.prototype = {
            bindMap: function (map) {
                this.Obj.setMap(map.Obj);
            },
            unBindMap: function (map) {
                this.Obj.setMap(null);
            }
        };

        if(currentMap==="GMAP"){
            _gMap.MyOverLayer.prototype =  new google.maps.OverlayView();
            _gMap.MyOverLayer.prototype.draw=function(){
                var _overlayProjection = this.getProjection(),
                    _pos = _overlayProjection.fromLatLngToDivPixel(this.LatLng.Obj);
                    _dom =this.Dom;
                if(this.Offset){
                    _pos.x+=this.Offset.X;
                    _pos.y+=this.Offset.Y;
                }
                //var size = new google.maps.Size(-26, -42); // 修正坐标的值;
                _dom.style.left = _pos.x + 'px';
                _dom.style.top = _pos.y + 'px';
            };
            _gMap.MyOverLayer.prototype.onAdd=function(){
                this.Dom.style.position="absolute";
                var _panel = this.getPanes();
                _panel.overlayMouseTarget.appendChild(this.Dom);
            };
            _gMap.MyOverLayer.prototype.onRemove=function(){
                this.Dom.parentNode.removeChild(this.Dom);
            };
            _gMap.MyOverLayer.prototype.bindMap=function(map){
                this.setMap(map.Obj);
            };
            _gMap.MyOverLayer.prototype.unBindMap=function(){
                this.setMap(null);
            }
        };


        _aMap.Map.prototype = {
            //Set or Get the map center
            setCenter: function (LatLng) {
                this.Obj.setCenter(LatLng.Obj);
            },
            getCenter: function () {
                var temp = this.Obj.getCenter();
                return new _aMap.LatLng(temp.lat, temp.lng);
            },
            //Set or Get the map zoom
            setZoom: function (num) {
                this.Obj.setZoom(num);
            },
            getZoom: function () {
                return this.Obj.getZoom();
            }
        };

        _aMap.Marker.prototype = {
            bindMap: function (map) {
                map.Obj.addOverlays(this.Obj);
            },
            unBindMap: function (map) {
                map.Obj.removeOverlays(this.Obj);
            }
        };

        _aMap.MyOverLayer.prototype={
            bindMap:_aMap.Marker.prototype.bindMap,
            unBindMap:_aMap.Marker.prototype.unBindMap
        };

        //set the map mode,I`ve already known that the amap & gmap can`t be used at the same page...
        switch (currentMap) {
            case 'GMAP': window.VMap = _gMap; break;
            case 'AMAP': window.VMap = _aMap; break;
            default: window.VMap = _gMap; break;
        }

    }

})();
