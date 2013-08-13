/*
 * @namespace   Validation
 * @Author:     yulianghuang
 * @CreateDate  2012/12/10
 * @require UI.js
 */
(function(){
    //Reg
    var _regEmail=/^([\.a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((.[a-zA-Z0-9_-]{2,3}){1,2})$/,
        _regNum=/^\d+$/,
        _regInteger=/^\-?\d+$/,
        _regDecimal=/^\-?\d*\.?\d+$/,
        _regChinese=/[^\u4e00-\u9fa5]/,
        _regIdCard = /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[A-Z])$/,
        _regMobilePhone=/^([0-9]{11})?$/,
        _regTirm=/\s|\t|\n|\r/g;

    var _validation={};

    /*
     * The exposed public object to validate a form:
     * @param fields - Obj - {
     *    id:{
     *         required:{
     *             err:"in"
     *         },
     *         emails:{
     *             err:"The input can't be valid",,
     *             args:["1"]
     *         }
     *     }
     * }
     * @param callback - Function - The callback after validation has been performed.
     */
    _validation.ValidateForm=function(pFields,pCallBack,pIsAuto,pErrorTemplate){
        var _felids=pFields,
            _callBack=pCallBack,
            _errorContainer=document.createElement("DIV"),
            /*
             * {id:dom} errTip
             */
            _errorTips={},
            /*
             * {id:dom} field inputs
             */
            _inputs={};
        this.ErrorIptClass="input_error";
        this.ErrorIptClassReg =new RegExp(this.ErrorIptClass);
        this.ErrorTipTemplate=pErrorTemplate || '<b></b><i></i><div class="alert_info">$text$</div>';
        //"<div class=\"c_alertinfo\">$text$</div>";
        /*
         * when ipt onfoucs
         */
        this.onIptFoucs=function(event){
            var _target=event.target,
                _id=_target.id,
                _def=_target.getAttribute("data-default");
            _def!=null && _target.value ===_def && (_target.value="");
            if(_errorTips[_id]){
                _errorTips[_id].style.display="none";
                UI.Dom.removeClass(_target,this.ErrorIptClass);
            }
            UI.Dom.removeClass(_target,"input_default");
        };
        /*
         * when ipt onblur
         */
        this.onIptBlur=function(event){
            var me=this,
                _target=event.target,
                _id=_target.id,
                _def=_target.getAttribute("data-default");
            if( _def!=null && _target.value.replace(_regTirm,"")===""){
                _target.value=_def;
                UI.Dom.addClass(_target,"input_default");
            }
            me.checkRules.call(me,_id,_felids[_id]);
        };

        /*
         * target check
         */
        this.trigger=function(event){
            var me=this,
                _sign=true;
            me.hideTip.call(me);
            for(var key in _felids){
                if(!me.checkRules.call(me,key,_felids[key])){
                    _sign=false;
                    break;
                }
            }
            if(_sign){
                typeof _callBack === "function" && _callBack();
            }else{
                event.stopPropagation();
                event.preventDefault();
            }
        };
        /*
         * check one rule
         */
        this.checkRules=function(pId,pRules){
            var me=this,
                _ipt=_inputs[pId],
                _rules =pRules,
                //temp arguments
                _tempArr,
                //temp point
                _args;
            for(var key in _rules){
                if(typeof me.Check[key] === "function"){
                    //get params
                    _tempArr=[_ipt];
                    _args=_rules[key].args;
                    if(Core.isArray(_args)){
                        for(var i= 0,l=_args.length;i<l;i++){
                            _tempArr.push(_args[i]);
                        }
                    }
                    //get return
                    if(!me.Check[key].apply(me,_tempArr)){
                        me.showTip.call(me,_ipt,_rules[key].err);
                        return false
                    }
                }
            }
            return true
        };
        /*
         * hide all errors
         */
        this.hideTip=function(){
            for(var i in _errorTips){
                _errorTips[i].style.display="none";
            }
            for(var j in _inputs){
                _inputs[j].className!==undefined && (_inputs[j].className=_inputs[j].className.replace(this.ErrorIptClassReg,""));
            }
        };
        /*
         * show or create an error tip
         */
        this.showTip=function(pIpt,pError){
            var me=this,
                _tip=_errorTips[pIpt.id];
            if(_tip){
                _tip.style.display="";
                _tip.innerHTML=me.ErrorTipTemplate.replace(/\$text\$/,pError);
            }else{
                me.createTip.call(me,pIpt,pError);
            }
            UI.Dom.addClass(pIpt,this.ErrorIptClass);
        };
        /*
         * can be override
         */
        this.createTip=function(pDom,pText){
            var me=this,
                _div = document.createElement("DIV"),
                _pos=UI.Dom.position(pDom);
            _div.style.position="absolute";
            _div.className="base_alert";
            _div.innerHTML=me.ErrorTipTemplate.replace(/\$text\$/,pText);
            _div.style.top=_pos.y+"px";
            _div.style.left=_pos.x+pDom.offsetWidth+"px";
            //Add
            _errorContainer.appendChild(_div);
            _errorTips[pDom.id]=_div;
        };
        /*
         * reset the position of tips
         */
        this.onResize=function(){
            var _point,_pos,_div;
            for(var i in _errorTips){
                _div=_errorTips[i];
                _point=_inputs[i];
                _pos=UI.Dom.position(_point);
                _div.style.top=_pos.y+"px";
                _div.style.left=_pos.x+_point.offsetWidth+"px";
            }
        };
        /*
         * initail
         */
        this.init=function(pIsAuto){
            var me = this,
                _tempPoint;
            document.getElementsByTagName("BODY")[0].appendChild(_errorContainer);
            for(var key in _felids){
                _tempPoint = document.getElementById(key);
                _tempPoint && (_inputs[key]=_tempPoint);
            }
            Core.bind(window,"resize",function(){
                me.onResize.call(me);
            });
            if(pIsAuto){
                for(var k in _inputs){
                    var _def=_inputs[k].getAttribute("data-default");
                    if(_def!=null && _inputs[k].value.replace(_regTirm,"")===""){
                        _inputs[k].value = _def;
                        UI.Dom.addClass(_inputs[k],"input_default");
                    }
                    Core.bind(_inputs[k],"blur",function(event){
                        me.onIptBlur.call(me,event);
                    });
                    Core.bind(_inputs[k],"focus",function(event){
                        me.onIptFoucs.call(me,event);
                    });
                }
            }else{
                for(var k in _inputs){
                    var _def=_inputs[k].getAttribute("data-default");
                    if(_def!=null){
                        _inputs[k].value = _def;
                        UI.Dom.addClass(_inputs[k],"input_default");
                        Core.bind(_inputs[k],"blur",function(event){
                            var _dom =event.target,
                                _default=_dom.getAttribute("data-default") || "";
                            if(_dom.value.replace(_regTirm,"")===""){
                                _dom.value= _default;
                                UI.Dom.addClass(_dom,"input_default");
                            }
                        });
                        Core.bind(_inputs[k],"focus",function(event){
                            var _dom =event.target,
                                _default=_dom.getAttribute("data-default") || "";
                            if(_dom.value===_default){
                                _default && (_dom.value= "");
                            }
                            UI.Dom.removeClass(_dom,"input_default");
                        });
                    }
                }
                Core.bind(document.body,"click",function(){
                    me.hideTip.call(me);
                });
            }
        };
        this.init(pIsAuto);
    };

    /*
     * check method
     */
    _validation.ValidateForm.prototype={
        Check:{
            required:function(pIpt){
                if(pIpt.type=="checkbox"){
                    return (pIpt.checked === true)
                }
                return pIpt.value != null &&  pIpt.value != pIpt.getAttribute("data-default") && pIpt.value.replace(_regTirm,"")!=="";
            },
            requiredOrDefault:function(pIpt){
                if(pIpt.type=="checkbox"){
                    return (pIpt.checked === true)
                }
                return pIpt.value != null &&  pIpt.value.replace(_regTirm,"")!=="";
            },
            matchOne:function(pIpt,values){
                var _val= pIpt.value
                for(var key in values){
                    if(_val=== values[key]) return true;
                }
                return false;
            },
            matchAll:function(pIpt,values){
                var _val= pIpt.value
                for(var key in values){
                    if(_val!== values[key]) return false;
                }
                return true;
            },
            matchNone:function(pIpt,values){
                var _val= pIpt.value
                for(var key in values){
                    if(_val=== values[key]) return false;
                }
                return true;
            },
            email:function(pIpt){
                return _regEmail.test(pIpt.value);
            },
            emails:function(pIpt,pChar,pMax){
                var _arr = pIpt.value.split(pChar),
                    _l=_arr.length;
                if(pMax!==undefined && _l > pMax){
                    return false;
                }
                for(var key= 0;key<_l;key++){
                    if(!_regEmail.test(_arr[key])) return false;
                }
                return true;
            },
            idCard:function(pIpt){
                return _regIdCard.test(pIpt.value);
            },
            mobilePhone:function(pIpt){
                return _regMobilePhone.test(pIpt.value);
            },
            num:function(pIpt){
                return _regNum.test(pIpt.value);
            },
            numInteger:function(pIpt){
                return _regInteger.test(pIpt.value);
            },
            numDecimal:function(pIpt){
                return _regDecimal.test(pIpt.value);
            },
            chinese:function(pIpt){
                return _regChinese.test(pIpt.value);
            },
            len:function(pIpt,pMin,pMax){
                var _len=pIpt.value.length;
                return _len>pMin && _len<pMax;
            },
            lenTrim:function(pIpt,pMin,pMax){
                var _len=pIpt.value.replace(_regTirm,"").length;
                return _len>pMin && _len<pMax;
            },
            lenChinese:function(pIpt,pMin,pMax){
                var _len= 0,
                    _val=pIpt.value;
                for(var i=0;i<_val.length;i++){
                    _len+=_val.charAt(i)>'~'?2:1;
                }
                return _len>pMin && _len<pMax;
            },
            lenChineseTrim:function(pIpt,pMin,pMax){
                var _len= 0,
                    _val=pIpt.value.replace(_regTirm,"");
                for(var i=0;i<_val.length;i++){
                    _len+=_val.charAt(i)>'~'?2:1;
                }
                return _len>pMin && _len<pMax;
            },
            numRange:function(pIpt,pMin,pMax,pIsMinClouser,pIsMaxClouser){
                var _val=pIpt.value;
                return (_val>pMin || (pIsMinClouser && _val===pMin)) && (_val<pMax || (pIsMaxClouser && _val===pMax));
            },
            attrExist:function(pIpt,pAttr){
                return pIpt.getAttribute(pAttr) != null;
            },
            attrEq:function(pIpt,pAttr,pEq){
                return pIpt.getAttribute(pAttr) == pEq;
            },
            attrReg:function(pIpt,PAttr,pReg){
                var _attrValue=pIpt.getAttribute("pAttr");
                return typeof _attrValue === "string" && pReg.test(_attrValue);
            },
            delegate:function(pIpt,pDelegate){
                return pDelegate(pIpt);
            },
            delegate2:function(pIpt,pDelegate){
                return pDelegate(pIpt);
            }
        }
    };

    window.Validation=_validation;
})();