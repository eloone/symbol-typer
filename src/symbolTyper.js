function symbolTyper(HTMLElt, symbols, onTyped){

	if(typeof HTMLElt == 'undefined'){
		utils.throwError('Argument 1 is missing. It must be an HTML Element or a collection of HTML elements.');
	}

	if(typeof symbols !== 'object'){
		utils.throwError('Argument 2 is missing. It should be an object of symbols like {hearts : {unicode : "&#xf0e7;", replaced: "*"}}.');
	}

	if(typeof HTMLElt.length == 'undefined'){
		utils.checkHtmlElt(HTMLElt, 0);
		return new Typer(HTMLElt, symbols, onTyped);
	}else{
		var res = {};	

		for(var i = 0; i < HTMLElt.length; i++){
			utils.checkHtmlElt(HTMLElt[i], i);
			HTMLElt[i].id = HTMLElt[i].id || 'symbol_typer_'+i;
			res[HTMLElt[i].id] = new Typer(HTMLElt[i], symbols, onTyped);
		}

		return res;
	} 

}