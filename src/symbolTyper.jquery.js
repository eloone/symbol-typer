jQuery.fn.symbolTyper = function(symbols, onTyped){
	var typers = [];

	try{
		this.each(function(){
			typers.push(this);
		});

		if(!typers[0]){
			utils.throwError('No HTML element found for selector "'+this.selector+'"');
		}

		return new symbolTyper(typers, symbols, onTyped);		
	}catch(e){
		utils.displayError(e);
	}
};
