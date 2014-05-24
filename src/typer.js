function Typer(HTMLElt, symbols, onTyped){
var typer = this;
var filterKeyDown = false;
var originalText = '';
var IE = false;
var target;

typer.symbols = utils.clone(symbols);

typer.onTyped = onTyped;

utils.IEFix();

enableSymbols(HTMLElt);

function enableSymbols(HTMLElt){

	initSymbols(HTMLElt);

	if(HTMLElt.addEventListener){
		HTMLElt.addEventListener('keyup', onKeyup);

		HTMLElt.addEventListener('keydown', onKeydown);
	}
	
	if(HTMLElt.attachEvent){
		IE = true;
		
		HTMLElt.attachEvent('onkeyup', onKeyup);

		HTMLElt.attachEvent('onkeydown', onKeydown);
	}
	
}

function initSymbols(target){

	for(var i in typer.symbols){
		var symbol = typer.symbols[i];

		typer.symbols[i] = new Symbol(typer.symbols[i], target);		

	}

}

function onKeydown(event){
	//enter/left/right
    var forbidden = [13, 39, 37];
    var forbiddenKey = false;
    
    for(var i = 0; i < forbidden.length; i++){
    	if(forbidden[i] == event.keyCode){
    		forbiddenKey = true;
    		break;
    	}
    }

	filterKeyDown = forbiddenKey || event.ctrlKey || event.metaKey;
}

function onKeyup(event){

	if(filterKeyDown){
		return;
	}
	
	var targetElt = IE ? event.srcElement : event.target;

	if(!(target instanceof Target)){
		target = new Target(targetElt);
	}

	target.event = event;

	target.insertSymbols(typer.symbols);

   	if(typeof typer.onTyped == 'function'){
   		var result = target.getStatus();

   		typer.onTyped(result, event);
   	}
}

}