/* Typer takes care of binding keyboard events to the symbol replacing process in Target */
function Typer(HTMLElt, symbols, onTyped){
	var _typer = this;
	var _filterKeyDown = false;
	var _IE = false;

	//symbols are cloned per instance to avoid mixing objects between instances since object are only references
	_typer.symbols = utils.clone(symbols);

	_typer.onTyped = onTyped;

	enableSymbols(HTMLElt);

	var _target = new Target(HTMLElt, _typer.symbols);

	this.getStatus = function(){
		return _target.getStatus();
	};

	this.renderSymbols = function(){
		_target.insertSymbols();
	};

	function enableSymbols(HTMLElt){

		initSymbols(HTMLElt);

		if(HTMLElt.addEventListener){
			HTMLElt.addEventListener('keyup', onKeyup);

			HTMLElt.addEventListener('keydown', onKeydown);
		}

		if(HTMLElt.attachEvent){
			_IE = true;

			HTMLElt.attachEvent('onkeyup', onKeyup);

			HTMLElt.attachEvent('onkeydown', onKeydown);
		}

	}

	function initSymbols(target){

		Symbol.prototype.validateFormat(_typer.symbols);

		for(var i in _typer.symbols){
			_typer.symbols[i] = new Symbol(_typer.symbols[i], target, i);
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

		_filterKeyDown = forbiddenKey || event.ctrlKey || event.metaKey;
	}

	function onKeyup(event){
		try{
			//no symbol activity for those keys
			if(_filterKeyDown){
				return;
			}

			var targetElt = _IE ? event.srcElement : event.target;

			if(targetElt !== _target.node){
				_target = new Target(targetElt, _typer.symbols);
			}

			_target.insertSymbols();

		   	if(typeof _typer.onTyped == 'function'){
		   		var result = _target.getStatus();

		   		_typer.onTyped(result, event);
		   	}
	   }
	   catch(e){
	   		utils.displayError(e);
	   }
	}

}