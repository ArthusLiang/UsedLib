(function(window,document){
	var _note={};
	

	define('note','evolution',function(evolution){
		evolution.extend({
			note:_note
		});
		return evolution;
	});

})(window,document);
