/* Target represents the editable HTML element : contenteditable, input or textarea */
function Target(elt, symbols){
	var _HTMLElt = elt;
	var _caret = new Caret();
	var _diffChar;
	var _symbols = symbols;
	var _typed;

	this.node = elt;

	this.insertSymbols = function insertSymbols(){

		var newText = this.getValue();

		for(var key in _symbols){
			var symbol = _symbols[key];

			newText = this.insertSymbol(newText, symbol);

			if(symbol.matched){
				_diffChar = symbol.textInserted.length - symbol.typed.length;
				_typed = symbol.typed;
				this.setValue(newText);
				break;
			}
		}

	};

	this.insertSymbol = function insertSymbol(text, symbol){
		var newText = text;

		var plainText = utils.convertToText(text);
	
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

	this.getSymbolCount = function getSymbolCount(symbol, txt){
		//in this function we deal only with plain text to avoid evaluating tags when counting symbols
		var res = {};
		var text = utils.convertToText(txt || this.getValue());

		var rawEncodedHtml = encodeURIComponent(text);
		//get escaped replaced chars to exclude them from unreplaced count
		var pattern = '\\\\'+utils.convertToText(symbol.pattern);
		var regexp = new RegExp(pattern, 'g');

		res.symbolCount = utils.getCountChar(symbol.encoded, rawEncodedHtml);
		//symbol.replaced is plain text chars
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

			res.count[key] = utils.getCountChar(symbol.encoded, rawEncodedHtml);
			
			rawEncodedHtml = rawEncodedHtml.replace(regexpSymbol, '');

			resText = utils.htmlTrim(decodeURIComponent(rawEncodedHtml));

			resText = resText.replace(regexpEscaped, '$2');

			rawEncodedHtml = encodeURIComponent(resText);
		}
		
		res.rawText = utils.convertToText(resText);
		res.fullText = utils.convertToText(text);
		res.targetId = this.node.id;

		return res;
	};
	
	this.setValue = function setValue(text){
		//this gets executed only when a symbol was matched and needs to be inserted
		var caretPos = _caret.getPosition(_HTMLElt);
		//position of the typed chars to be replaced in the endcontainer the caret will be repositioned in
		var typedIndex = caretPos.textContainer.indexOf(_typed);
		//caretPos.value <= typedIndex when you delete and unreplaced chars have to be replaced forward
		//when we delete, it always counts as 1 char = 1 symbol
		//when you insert caretPos.value > typedIndex
		var pos = caretPos.value > typedIndex ? caretPos.value + _diffChar : caretPos.value;

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