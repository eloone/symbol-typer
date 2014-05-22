function symbolTyper(HTMLElt, symbols, onTyped){
	if(typeof HTMLElt.length == 'undefined'){
		new Typer(HTMLElt, symbols, onTyped);
	}else{
		for(var i = 0; i < HTMLElt.length; i++){
			new Typer(HTMLElt[i], symbols, onTyped);
		}
	}
}

function Typer(HTMLElt, symbols, onTyped){
	var typer = this;
	var filterKeyDown = false;
	var tmp = document.createElement('p');
	var input = document.createElement('input');
	var originalText = '';
	var IE = false;
	var target;

	typer.symbols = clone(symbols);

	typer.onTyped = onTyped;
	
	IEFix();
	
	if(typeof HTMLElt.length == 'undefined'){
		enableSymbols(HTMLElt);
	}else{
		for(var i = 0; i < HTMLElt.length; i++){
			enableSymbols(HTMLElt[i]);
		}
	}

	function enableSymbols(HTMLElt){

		if( HTMLElt.nodeType !== 1){
			throw new Error('symbolTyper takes an HTML Element or a collection of HTML Elements as argument');
		}

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

		if(typeof typer.symbols == 'undefined'){
			throw new Error('The 2nd argument in symbolTyper is missing. \n It should be an object of symbols like {hearts : {unicode : "&#xf0e7;", replaced: "*"}}');
		}

		for(var i in typer.symbols){
			var symbol = typer.symbols[i];

			//power hack to insert a unicode as html entity in an input via javascript
			symbol.htmlSymbol = convertToHtml(symbol.unicode);

			symbol.encoded = encodeURIComponent(htmlTrim(symbol.htmlSymbol));

			symbol.encodedWithPadding = encodeURIComponent(symbol.htmlSymbol);

			symbol.convertedUnicode = convertToText(symbol.unicode);


			if(!symbol.before){
				symbol.before = '';
			}else{
				if(isContentEditable(target)){
					symbol.before = symbol.before.replace(/^\s+|\s+$/g, '&nbsp;');
				}
			}			

			if(!symbol.after){
				symbol.after = '';
			}else{
				if(isContentEditable(target)){
					symbol.after = symbol.after.replace(/^\s+|\s+$/g, '&nbsp;');
				}
			}

			if(isContentEditable(target)){
				if(symbol.replaced.push){
					symbol.replaced.push('9');
				}
			}

			symbol.inserted = symbol.before+symbol.htmlSymbol+symbol.after;

			symbol.target = target;
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

var caret = new Caret(targetElt);

//console.log(caret.getPosition());

		target.event = event;

		target.insertSymbols();

	   	if(typeof typer.onTyped == 'function'){
	   		var result = target.getStatus();

	   		typer.onTyped(result, event);
	   	}
	}
	

	function Target(elt){
		var HTMLElt = elt;
		var caret = new Caret(elt);
		var previousValue;
		var diffChar;

		this.insertSymbols = function insertSymbols(){
			var newText = this.getValue();
console.log(typer.symbols);
			for(var key in typer.symbols){
				var symbol = typer.symbols[key];

				newText = this.insertSymbol(newText, symbol);
				
				if(symbol.matched){
					console.log('matched');
					diffChar = symbol.convertedUnicode.length - symbol.typed.length
					console.log('diffChar', diffChar);
					console.log(symbol.replaced);
					this.setValue(newText);
				}
			}

		};

		this.getSymbolPattern = function getSymbolPattern(symbolReplaced){
			
			var specialCharRegex = /[-[\]{}()*+?.,\\^$#\s]/g;

			if(typeof symbolReplaced.push == 'function'){
				var pattern = [];

				for(var i = 0; i < symbolReplaced.length; i++){
					var symbolPattern = symbolReplaced[i];
					pattern.push(symbolPattern.replace(specialCharRegex, '\\$&'));
				}

				pattern = '('+pattern.join('|')+')';
			}else{
				var pattern = symbolReplaced.replace(specialCharRegex, '\\$&');
			}

			if(this.isContentEditable()){
				pattern = convertToHtml(pattern);
			}

			return pattern;
		};

		this.insertSymbol = function insertSymbol(text, symbol){
			var newText = text;
		
			var pattern = '([^\\\\]|^)'+'('+this.getSymbolPattern(symbol.replaced)+')';

			var regexp = new RegExp(pattern);

			var replacedMatched = regexp.exec(newText);

			symbol.typed = '';

			if(replacedMatched){
				symbol.typed = convertToText(replacedMatched[2]);
			}
console.log('symbol', symbol);
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

		this.getDisplayedSymbol = function(symbol){
			if(this.isContentEditable()){
				return symbol.htmlContentEditable;
			}

			return symbol.htmlSymbol;
		};

		this.getSymbolCount = function(symbol, txt){			
			var res = {};
			var text = txt || convertToText(this.getValue());
			var rawEncodedHtml = encodeURIComponent(text);
			//get escaped replaced chars to exclude them from unreplaced count
			var pattern = '\\\\'+this.getSymbolPattern(symbol.replaced);
			var regexp = new RegExp(pattern, 'g');

			res.symbolCount = getCountChar(symbol.encoded, rawEncodedHtml);
			res.unreplacedCount = getCountChar(symbol.replaced, text.replace(regexp, ''));

			return res;
		};
		
		this.getStatus = function getStatus(){
			var text = this.getValue();
			var res = { count : {}};
			var rawEncodedHtml = encodeURIComponent(text);
			var resText = '';

			for(var key in typer.symbols){
				var symbol = typer.symbols[key];
				var symbolPattern = '('+symbol.encoded+')|('+symbol.encodedWithPadding+')';
				var escapedPattern = '(\\\\)('+this.getSymbolPattern(symbol.replaced)+')';
				var regexpEscaped = new RegExp(escapedPattern, 'g');
				var regexpSymbol = new RegExp(symbolPattern, 'g');

				res.count[key] = getCountChar(symbol.encoded, rawEncodedHtml);
				
				rawEncodedHtml = rawEncodedHtml.replace(regexpSymbol, '');

				resText = htmlTrim(decodeURIComponent(rawEncodedHtml));

				resText = resText.replace(regexpEscaped, '$2');

				rawEncodedHtml = encodeURIComponent(resText);
			}
			
			res.rawText = resText;
			res.fullText = text;
			res.originalText = originalText;

			return res;
		};
		
		this.setValue = function setValue(text){
			var caretPos = caret.getPosition();
			var pos = caretPos.value + diffChar;
console.log(caretPos.value);
			if(this.isContentEditable()){
				HTMLElt.innerHTML = text;
			}else{	
				HTMLElt.value = text;
			}

			caret.setPosition(pos, caretPos.path);
		};

		this.getValue = function getValue(){
			if(this.isContentEditable()){
				return HTMLElt.innerHTML;
			}else{
				return HTMLElt.value;
			}
		};
				
		this.isContentEditable = function isContentEditable(){
			if(HTMLElt.tagName == 'INPUT' || HTMLElt.tagName == 'TEXTAREA'){
				return false;
			}
			
			return true;
		};
		
		
	}

	function isContentEditable(HTMLElt){
		if(HTMLElt.tagName == 'INPUT' || HTMLElt.tagName == 'TEXTAREA'){
			return false;
		}
		
		return true;
	};

	function getCountChar(char, inStr){
		if(typeof char.push == 'function'){
			var count = 0;

			for(var i = 0; i < char.length; i++){
				count += getCountChar(char[i], inStr);
			}

			return count;
		}

   		return (inStr.split(char).length - 1);
	}

	function convertToHtml(text){
		tmp.innerHTML = text;
		return tmp.innerHTML;
	}

	function convertToText(html){
		tmp.innerHTML = html;
		return tmp.textContent;
	}
	
	function IEFix(){
		if(typeof String.prototype.trim !== 'function') {
		  String.prototype.trim = function() {
		    return this.replace(/^\s+|\s+$/g, ''); 
		  }
		}
	}

	function htmlTrim(text){
		return text.replace(/^\s+|\s+$|&nbsp;/g, '');
	}

	function clone(obj){
		var newObj = {};
		var notObj = true;

		for(var k in obj){
			newObj[k] = {};

			for(var i in obj[k]){
				if(typeof obj[k][i] != 'undefined'){
					notObj = false;
					if(typeof obj[k][i].slice == 'function'){
						newObj[k][i] = obj[k][i].slice(0);
					}else{
						newObj[k][i] = obj[k][i];
					}
					
				}
			}

			if(notObj){
				newObj[k] = obj[k];
			}

		}

		return newObj;

	}
	
}

