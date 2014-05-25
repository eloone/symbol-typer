function Typer(HTMLElt, symbols, onTyped){
var typer = this;
var filterKeyDown = false;
var originalText = '';
var IE = false;
var _target;

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

		typer.symbols[i] = new Symbol(typer.symbols[i], target, i);		

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

	if(!(_target instanceof Target)){
		_target = new Target(targetElt);
	}

	_target.event = event;

	_target.insertSymbols(typer.symbols);

   	if(typeof typer.onTyped == 'function'){
   		var result = _target.getStatus();

   		typer.onTyped(result, event);
   	}
}

}