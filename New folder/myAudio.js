/*
* selector mode;
* Arthus 2014 10 8
*/
(function(window,document){

	var myAudio ={
		start:function(tag){
			var me =this;
			navigator.webkitGetUserMedia({audio:true},function(e){
				var context =new webkitAudioContext(),
	                            		volume = context.createGain(),
	                            		delay = context.createDelay(20),
	                            		filter = context.createBiquadFilter(),
	                            		panner = context.createPanner(),
	                            		//get media
	                            		audioInput = context.createMediaStreamSource(e);

	                            		audioInput.connect(volume);
			                        	volume.connect(panner);
			                        	//go to destination
			                        	panner.connect (context.destination); 
			                        	var _px= 10;
			                        	panner.setPosition(_px, _px, _px);

			                        	filter.type=5;
			                        	filter.q.value=10;
			                        	filter.frequency.value=140;
			                        	//tag.src=window.webkitURL.createObjectURL(e);
			},function(){});
		}
	};


	window.onload=function(){
		var _au=document.getElementById('au');
		myAudio.start(_au);
	};

})(window,document);

