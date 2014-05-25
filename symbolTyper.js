/* symbolTyper - v0.1.0 - 2014-05-25 */
(function(window){
/* src/utils.js begins : */
var tmp = document.createElement('p');
var input = document.createElement('input');
var utils = {

checkHtmlElt : function checkHtmlElt(HTMLElt, i){
	if( !HTMLElt || HTMLElt.nodeType !== 1){
		throw new Error('symbolTyper : Input '+i+' is not an HTML Element');
	}
},

isContentEditable : function isContentEditable(HTMLElt){
	if(HTMLElt.tagName == 'INPUT' || HTMLElt.tagName == 'TEXTAREA'){
		return false;
	}
	
	return true;
},

getCountChar : function getCountChar(char, inStr){
	if(typeof char.push == 'function'){
		var count = 0;

		for(var i = 0; i < char.length; i++){
			count += getCountChar(char[i], inStr);
		}

		return count;
	}

		return (inStr.split(char).length - 1);
},

convertToHtml : function convertToHtml(text){
	tmp.innerHTML = text;
	return tmp.innerHTML;
},

convertToText : function convertToText(html){
	tmp.innerHTML = html;
	return tmp.textContent;
},

IEFix : function IEFix(){
	if(typeof String.prototype.trim !== 'function') {
	  String.prototype.trim = function() {
	    return this.replace(/^\s+|\s+$/g, ''); 
	  }
	}
},

htmlTrim : function htmlTrim(text){
	return text.replace(/^\s+|\s+$|&nbsp;/g, '');
},

throwError : function throwError(message){
	throw new Error('symbolTyper : '+message);
},

clone : function clone(obj){
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

};
/* src/utils.js ends. */

/* src/symbol.js begins : */
function Symbol(symbol, target, key){

	symbol.key = key;

	symbol.pattern = this.getPattern(symbol.replaced, target);

	this.validate(symbol, key);
	//power hack to insert a unicode as html entity in an input via javascript
	symbol.htmlSymbol = utils.convertToHtml(symbol.unicode);

	symbol.encoded = encodeURIComponent(utils.htmlTrim(symbol.htmlSymbol));

	if(!symbol.before){
		symbol.before = '';
	}else{
		if(utils.isContentEditable(target)){
			symbol.before = symbol.before.replace(/^\s+|\s+$/g, '&nbsp;');
			symbol.before = utils.convertToHtml(symbol.before);
		}
	}			

	if(!symbol.after){
		symbol.after = '';
	}else{
		if(utils.isContentEditable(target)){
			symbol.after = symbol.after.replace(/^\s+|\s+$/g, '&nbsp;');
			symbol.after = utils.convertToHtml(symbol.after);
		}
	}

	symbol.inserted = symbol.before+symbol.htmlSymbol+symbol.after;

	symbol.textInserted = utils.convertToText(symbol.inserted);

	return symbol;
}

Symbol.prototype = {
	validate : function validate(symbol, key){
		if(typeof symbol.unicode == 'undefined'){
			utils.throwError('Missing {unicode} property in the {'+key+'} symbol object');
		}

		if(typeof symbol.replaced == 'undefined'){
			utils.throwError('Missing {replaced} property in the {'+key+'} symbol object');
		}

		var unicodeRegex = /^(&#x[a-fA-F0-9]+|&#\d+);$/;

		if(unicodeRegex.test(symbol.unicode) === false){
			utils.throwError('This unicode format "'+symbol.unicode+'" is invalid. It must be like &#173; (decimal) or &#xf007; (hexadecimal)');
		}

		if(typeof symbol.replaced !== 'string' && typeof symbol.replaced.push !== 'function'){
			utils.throwError('{replaced} property in {'+key+'} symbol must be a String or an Array of strings');
		}

		var replacedRegex = new RegExp(symbol.pattern, 'g');

		if(symbol.before){
			if(replacedRegex.test(symbol.before)){
				utils.throwError('{before} separator "'+symbol.before+'" in {'+key+'} symbol must not contain a {replaced} string from "'+symbol.replaced+'"');
			}
		}

		if(symbol.after){
			if(replacedRegex.test(symbol.after)){
				utils.throwError('{after} separator "'+symbol.after+'" in {'+key+'} symbol must not contain a {replaced} string from "'+symbol.replaced+'"');
			}
		}
	},

	getPattern : function getPattern(symbolReplaced, target){

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

		if(utils.isContentEditable(target)){
			pattern = utils.convertToHtml(pattern);
		}

		return pattern;
	}
};
/* src/symbol.js ends. */

/* src/caret.js begins : */
(function(window){

	var html5;
	var ie;

	var test;
	
	if(window.addEventListener){
		window.addEventListener('load', init);
	}
	
	if(window.attachEvent){
		window.attachEvent('load', init);
	}
	
	function init(){
		html5 = (window.getSelection && document.createRange);//Modern Browsers 
		ie = (document.selection && document.body.createTextRange);//<IE9
	}

	function Caret(target){
		this.target = target;

		if( target.nodeType != 1){
			throw new Error('Caret expects an HTML Element as argument in new Caret(HTMLElement)');
		}
	
		this.isContentEditable = (!(target.tagName == 'INPUT' || target.tagName == 'TEXTAREA') && target.getAttribute('contenteditable') === 'true');
	}

	Caret.prototype = {
	
		getPosition : function(){
			if(this.isContentEditable){
				return this._getPositionContentEditable();
			}else{
				return this._getPositionInputTextArea();
			}		
		},
	
		setPosition : function(pos, endContainer){
			if(this.isContentEditable){
				return this._setPositionContentEditable(pos, endContainer);
			}else{
				return this._setPositionInputTextArea(pos, endContainer);
			}
		},
	
		_getPositionContentEditable : function(){
			this.target.focus();

			if(html5){
				var range = window.getSelection().getRangeAt(0);

	          		return {
	          			value : range.endOffset,
	          			path : new PositionPath(this.target, range.endContainer),
	          			container : range.endContainer
	          		};
			}
	
			if(ie){
	            var range1 = document.selection.createRange(),
	                range2 = document.body.createTextRange();
	            
	            range2.moveToElementText(range1.parentElement());
	            range2.setEndPoint('EndToEnd', range1);
	            
	            return {
	            	value : range2.text.length,
	            	container : range1.parentElement()
	            };
			}
		},
	
		_getPositionInputTextArea : function(){
			this.target.focus();
			
			if(html5){
				return {
					value : this.target.selectionStart,
					container : this.target
				};
			}
			
			if(ie){
			 var pos = 0,
	            range = this.target.createTextRange(),
	            range2 = document.selection.createRange().duplicate(),
	            bookmark = range2.getBookmark();
	
		        range.moveToBookmark(bookmark);
		        while (range.moveStart('character', -1) !== 0) pos++;
		        return {
		        	value : pos,
		        	container : range.parentElement()
		        };
			}
		},
	
		_setPositionContentEditable : function(pos, positionPath){
			var endContainer;

			if(typeof positionPath == 'undefined'){
				endContainer = this.target.firstChild;
			}

			if(positionPath instanceof PositionPath){
				endContainer = getNodeByPosition(positionPath);
			}

			if(typeof endContainer == 'undefined' ){
				if(isChildOf(this.target, positionPath)){
					endContainer = positionPath;
				}else{
					console.warn('Caret.setPosition : Specified end container must be a child of the caret\'s target');
				}
			}
	
		    if (html5) {
		       // endContainer.focus();
		     //   window.getSelection().collapse(endContainer, pos);
		        var range = document.createRange();//Create a range (a range is a like the selection but invisible)
		        range.selectNodeContents(this.target);//Select the entire contents of the element with the range
		        range.setEnd(endContainer, pos);
		        range.collapse();//collapse the range to the end point. false means collapse to end rather than the start
		        selection = window.getSelection();//get the selection object (allows you to change selection)
		        selection.removeAllRanges();//remove any selections already made
		        selection.addRange(range);
		    }
	
		    if(ie){
			      var range = document.body.createTextRange();
			      range.moveToElementText(endContainer);
			      range.moveStart('character', pos);
			      range.collapse(true);
			      range.select();    		
			}
		     
		},
	
		_setPositionInputTextArea : function(pos){
			if(html5){
				this.target.setSelectionRange(pos, pos);
			}
		}
	};

function getNodeByPosition(positionPath){
	var path = positionPath.getPath();
	var node = path.root;
	var pathValues = path.path;

	for(var i = 0; i < pathValues.length; i++){
		node = node.childNodes[pathValues[i]];
	}

	return node;
}

function PositionPath(target, textNode){
	var tree = {};
	var path = [];

	path = pathFromNode(target, textNode, path);

	this.getPath = function(){
		return {
			root : target,
			path : path
		};
	};
}

function pathFromNode(target, node, path){

	if(target === node || typeof node == 'undefined' || typeof node.parentElement == 'undefined'){
		return path;
	}

	var childIndex = getIndex(node.parentElement, node);

	path.unshift(childIndex);

	return pathFromNode(target, node.parentElement, path);

}

function getIndex(parentNode, childNode){
	var index;

	for(var i = 0; i < parentNode.childNodes.length; i++){
		if(parentNode.childNodes[i] === childNode){
			return i;
		}
	}
}

function isChildOf(parent, node){
	for(var i = 0; i < parent.childNodes.length; i++ ){
		if(parent.childNodes[i] === node){
			return true;
		}
	}

	return false;
}

window.Caret = Caret;

}(this));
/* src/caret.js ends. */

/* src/target.js begins : */
function Target(elt){
	var _HTMLElt = elt;
	var _caret = new Caret(elt);
	var _diffChar;
	var _symbols;

	this.insertSymbols = function insertSymbols(symbols){
		_symbols = symbols;
		
		var newText = this.getValue();

		for(var key in _symbols){
			var symbol = _symbols[key];

			newText = this.insertSymbol(newText, symbol);

			if(symbol.matched){
				_diffChar = symbol.textInserted.length - symbol.typed.length
				this.setValue(newText);
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
	
	this.getStatus = function getStatus(){
		var text = this.getValue();
		var res = { count : {}};
		var rawEncodedHtml = encodeURIComponent(text);
		var resText = '';

		for(var key in _symbols){
			var symbol = _symbols[key];
			var symbolPattern = '('+symbol.encoded+')|('+symbol.encodedWithPadding+')';
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
		var caretPos = _caret.getPosition();
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
/* src/target.js ends. */

/* src/typer.js begins : */
function Typer(HTMLElt, symbols, onTyped){
var _typer = this;
var _filterKeyDown = false;
var _IE = false;
var _target;

_typer.symbols = utils.clone(symbols);

_typer.onTyped = onTyped;

utils.IEFix();

enableSymbols(HTMLElt);

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

	for(var i in _typer.symbols){
		var symbol = _typer.symbols[i];

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

	if(_filterKeyDown){
		return;
	}
	
	var targetElt = _IE ? event.srcElement : event.target;

	if(!(_target instanceof Target)){
		_target = new Target(targetElt);
	}

	_target.event = event;

	_target.insertSymbols(_typer.symbols);

   	if(typeof _typer.onTyped == 'function'){
   		var result = _target.getStatus();

   		_typer.onTyped(result, event);
   	}
}

}
/* src/typer.js ends. */

/* src/symbolTyper.js begins : */
function symbolTyper(HTMLElt, symbols, onTyped){

	if(typeof HTMLElt == 'undefined'){
		utils.throwError('Argument 0 is missing. It must be an HTML Element or a collection of HTML elements.');
	}

	if(typeof symbols !== 'object'){
		utils.throwError('Argument 1 is missing. It should be an object of symbols like {hearts : {unicode : "&#xf0e7;", replaced: "*"}}.');
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
/* src/symbolTyper.js ends. */

window.symbolTyper = symbolTyper; 
}(this));