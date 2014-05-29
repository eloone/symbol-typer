/*
Target represents the editable HTML element : contenteditable, input or textarea
*/
function Target(elt, symbols){
	var _HTMLElt = elt;
	var _caret = new Caret();
	var _diffChar;
	var _symbols = symbols;

	this.node = elt;

	this.insertSymbols = function insertSymbols(){

		var newText = this.getValue();

		for(var key in _symbols){
			var symbol = _symbols[key];

			newText = this.insertSymbol(newText, symbol);

			if(symbol.matched){
				_diffChar = symbol.textInserted.length - symbol.typed.length
				this.setValue(newText);
				break;
			}
		}

	};

	this.insertSymbol = function insertSymbol(text, symbol){
		var newText = text;
	
		var pattern = '([^\\\\]|^)'+'('+symbol.pattern+')';

		var regexp = new RegExp(pattern);

		var replacedMatched = regexp.exec(newText);

		symbol.typed = '';

		if(replacedMatched){
			symbol.typed = utils.convertToText(replacedMatched[2]);
		}

		symbol.matched = false;

		//replace replaced with symbol
		if(typeof symbol.limit == 'number'){
			var count = this.getSymbolCount(symbol);

			//if unescaped replaced chars are present but not replaced by their symbol
			//they will be replaced by their symbol until limit is reached
			while(count.unreplacedCount > 0 && count.symbolCount < symbol.limit){
				newText = newText.replace(regexp, '$1'+symbol.inserted);
				count = this.getSymbolCount(symbol, newText);
				symbol.matched = true;
			}
			
		}else{
			symbol.matched = regexp.test(newText);
			newText = newText.replace(regexp, '$1'+symbol.inserted);
		}

		return newText;
	};

	this.getSymbolCount = function(symbol, txt){	

		var res = {};
		var text = txt || utils.convertToText(this.getValue());

		var rawEncodedHtml = encodeURIComponent(text);
		//get escaped replaced chars to exclude them from unreplaced count
		var pattern = '\\\\'+symbol.pattern;
		var regexp = new RegExp(pattern, 'g');

		res.symbolCount = utils.getCountChar(symbol.encoded, rawEncodedHtml);
		res.unreplacedCount = utils.getCountChar(symbol.replaced, text.replace(regexp, ''));
		res.symbol = symbol.key;

		return res;
	};
	
	//gets the count of symbols, and text entered in target
	this.getStatus = function getStatus(){
		var text = this.getValue();
		var res = { count : {}};
		var rawEncodedHtml = encodeURIComponent(text);
		var resText = '';

		for(var key in _symbols){
			var symbol = _symbols[key];
			var symbolPattern = '('+symbol.encoded+')';
			var escapedPattern = '(\\\\)('+symbol.pattern+')';	
			var regexpEscaped = new RegExp(escapedPattern, 'g');
			var regexpSymbol = new RegExp(symbolPattern, 'g');

			res.count[key] = getCountChar(symbol.encoded, rawEncodedHtml);
			
			rawEncodedHtml = rawEncodedHtml.replace(regexpSymbol, '');

			resText = utils.htmlTrim(decodeURIComponent(rawEncodedHtml));

			resText = resText.replace(regexpEscaped, '$2');

			rawEncodedHtml = encodeURIComponent(resText);
		}
		
		res.rawText = resText;
		res.fullText = text;

		return res;
	};
	
	this.setValue = function setValue(text){
		var caretPos = _caret.getPosition(_HTMLElt);
		var pos = caretPos.value + _diffChar;

		if(this.isContentEditable){
			_HTMLElt.innerHTML = text;
		}else{	
			_HTMLElt.value = text;
		}

		_caret.setPosition(pos, caretPos.path);
	};

	this.getValue = function getValue(){
		if(this.isContentEditable){
			return _HTMLElt.innerHTML;
		}else{
			return _HTMLElt.value;
		}
	};
			
	this.isContentEditable = utils.isContentEditable(_HTMLElt);	
	
}