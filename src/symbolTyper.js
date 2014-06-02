/* This is where the symbolTyper library starts */
function symbolTyper(HTMLElt, symbols, onTyped){

	try{

		var elements = [];

		utils.IEFix();

		if(utils.browserIsSupported() === false){
			utils.throwError('This browser is not supported. This script only supports HTML5 browsers and Internet Explorer 9 and above.');
		}

		if(typeof HTMLElt == 'undefined'){
			utils.throwError('Argument 1 is missing. It must be an HTML Element or a collection (array or NodeList) of HTML elements.');
		}
	
		if(typeof symbols !== 'object'){
			utils.throwError('Argument 2 is missing. It should be an object of symbols like {hearts : {unicode : "&#xf0e7;", replaced: "*"}}.');
		}

		if(typeof HTMLElt.length == 'undefined'){
			elements.push(HTMLElt);
		}else{
			elements = HTMLElt;
		}

		var res = {}, i = 0;	

		do{
			utils.checkHtmlElt(elements[i], i);
			elements[i].id = elements[i].id || 'symbol_typer_'+i;
			res[elements[i].id] = new Typer(elements[i], symbols, onTyped);
			i++;
		}while(i < elements.length);

		//if only one element we enable direct access to the typer without the id key
		//but access through the id key will still work
		//memory cost is low since keys with object value are only references to the object
		if(i == 1){
			for(var k in res){
				res[k][k] = res[k];
				res = res[k];
			}
		}

		return res;	

	}catch(e){
		//this will display known errors that prevent the library from working but doesn't block the other existing scripts
		utils.displayError(e);
	}

}
