/*
Elodie Rafalimanana Copyright 2014 - BSD License 
I dedicate this script to the fans of the Wingdings font, something to reminisce about our childhood.
symbolTyper - v0.1.0 - 2014-06-05
*/
/* src/wrappers/header.js begins : */
(function(window){
/* src/wrappers/header.js ends. */

/* src/utils.js begins : */
/* Utils provides all the function helpers that the script needs */
var tmp = document.createElement('p');
var input = document.createElement('input');
var utils = {

checkHtmlElt : function checkHtmlElt(HTMLElt, i){
	if( !HTMLElt || HTMLElt.nodeType !== 1){
		throwError('Input '+i+' : '+HTMLElt+' is not an HTML Element. \nsymbolTyper works with an HTML element or a collection (array or NodeList) of HTML elements.');
	}
},

isContentEditable : function isContentEditable(HTMLElt){
	if(HTMLElt.tagName == 'INPUT' || HTMLElt.tagName == 'TEXTAREA'){
		return false;
	}
	
	return true;
},

getCountChar : function getCountChar(char, inStr){
	//char can be an array
	//every char is always plain text (no html conversion)
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

browserIsSupported : function(){
	return (typeof tmp.textContent !== 'undefined');
},

htmlTrim : function htmlTrim(text){
	return text.replace(/^\s+|\s+$|&nbsp;/g, '');
},

throwError :  throwError,

displayError : function(error){
	if(console && console.error){
		console.error(error.message);
	}
},
//this clones objects formatted like the expected format
//arrays values are also cloned
clone : function clone(obj){
	var newObj = {};
	var valueIsObj = false;

	for(var k in obj){
		newObj[k] = {};

		for(var i in obj[k]){
			if(typeof obj[k][i] != 'undefined'){
				valueIsObj = true;
				if(typeof obj[k][i].slice == 'function'){
					newObj[k][i] = obj[k][i].slice(0);
				}else{
					newObj[k][i] = obj[k][i];
				}
				
			}
		}

		if(!valueIsObj){
			newObj[k] = obj[k];
		}

	}

	return newObj;

}

};

function throwError(message){
	throw new Error('symbolTyper stopped : '+message);
}
/* src/utils.js ends. */

/* src/symbol.js begins : */
/* Symbol represents a symbol element from the plugin input augmented with meta data */
function Symbol(symbol, target, key){

	this.validateRequiredKeys(symbol, key);

	symbol.key = key;

	symbol.pattern = this.getPattern(symbol.replaced, target);

	this.validateOptionalKeys(symbol, key);
	//power hack to insert a unicode as html reference in an input via javascript
	symbol.htmlSymbol = utils.convertToHtml(symbol.unicode);

	symbol.encoded = encodeURIComponent(utils.htmlTrim(symbol.htmlSymbol));

	symbol.before = formatSeparator(symbol.before, target);		

	symbol.after = formatSeparator(symbol.after, target);

	//inserted is html
	symbol.inserted = symbol.before+symbol.htmlSymbol+symbol.after;

	symbol.textInserted = utils.convertToText(symbol.inserted);

	return symbol;
}

function formatSeparator(separator, target){
	if(!separator){
		return '';
	}else{
		if(utils.isContentEditable(target)){
			//editable elements systematically trim end space
			var sep = separator.replace(/^\s+|\s+$/g, '&nbsp;');
			return utils.convertToHtml(sep);
		}
	}

	return separator;	
}

Symbol.prototype = {
	//controls the input of the plugin
	//required : unicode, replaced
	validateRequiredKeys : function validateRequiredKeys(symbol, key){

		if(typeof symbol.unicode == 'undefined'){
			utils.throwError('The property {unicode} is missing from the {'+key+'} symbol object. It must be a String like &#173; (decimal) or &#xf007; (hexadecimal).');
		}

		if(typeof symbol.replaced == 'undefined'){
			utils.throwError('The property {replaced} is missing from the {'+key+'} symbol object. It must be a String or an Array of strings.');
		}

		var unicodeRegex = /^(&#x[a-fA-F0-9]+|&#\d+);$/;

		if(unicodeRegex.test(symbol.unicode) === false){
			utils.throwError('This unicode format "'+symbol.unicode+'" is invalid. It must be like &#173; (decimal) or &#xf007; (hexadecimal).');
		}

		if(typeof symbol.replaced !== 'string' && typeof symbol.replaced.push !== 'function'){
			utils.throwError('The {replaced} property in {'+key+'} symbol must be a String or an Array of strings.');
		}
	},
	//optional : limit, before, after
	validateOptionalKeys : function validateOptionalKeys(symbol, key){
		
		var replacedRegex = new RegExp(symbol.pattern, 'g');

		if(symbol.limit && typeof symbol.limit !== 'number'){
			utils.throwError('The property {limit} must be a number in the {'+key+'} symbol.');
		}

		if(symbol.before){
			if(replacedRegex.test(symbol.before)){
				utils.throwError('{before} separator "'+symbol.before+'" in the {'+key+'} symbol must not contain a {replaced} string from "'+symbol.replaced+'"');
			}
		}

		if(symbol.after){
			if(replacedRegex.test(symbol.after)){
				utils.throwError('{after} separator "'+symbol.after+'" in the {'+key+'} symbol must not contain a {replaced} string from "'+symbol.replaced+'"');
			}
		}
	},
	validateFormat : function(symbols){
		for(var i in symbols){
			if(typeof symbols[i] != 'object'){
				utils.throwError('The format of the symbols object must be like {hearts : {unicode : \"&#173;\", replaced : \"<3\"}}');
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
/*
Caret is an external library to position the caret after inserting a symbol at the insert position
Support : IE9+ and html5 browsers
*/
(function(window){

	var supported;
	
	if(window.addEventListener){
		window.addEventListener('load', init);
	}
	
	if(window.attachEvent){
		window.attachEvent('onload', init);
	}
	
	function init(){
		supported = typeof (window.getSelection && document.createRange) !== 'undefined';//Modern Browsers and IE9+
		
		if(supported === false){
			throwError('This browser is not supported. This script only supports HTML5 browsers and Internet Explorer 9 and above.');
		}
	}

	function Target(target){

		if( !target || target.nodeType != 1 && target.nodeType != 3){
			throwError('The target "'+target+'" must be an HTML Element or Text node');
		}

		this.node = target;
	}

	Target.prototype = {
		isContentEditable : function(){
			if(this.node.nodeType == 1){
				return (!(this.node.tagName == 'INPUT' || this.node.tagName == 'TEXTAREA') && this.node.getAttribute('contenteditable') === 'true');
			}else{
				return false;
			}
		},
		isText : function(){
			return this.node.nodeType == 3;
		}
	}

	function Caret(){}

	Caret.prototype = {
	
		getPosition : function(target){
			this.target = new Target(target);

			if(this.target.isText()){
				throwError('Caret can get the caret\'s position only from editable HTML Elements. "'+this.target.node+'" is not editable.');
			}

			if(this.target.isContentEditable()){
				return _getPositionContentEditable.call(this);
			}else{
				return _getPositionInputTextArea.call(this);
			}		
		},
	
		setPosition : function(pos, endContainer){
			if(pos && !endContainer){
				throwError('Argument 2 "'+endContainer+'" is invalid. It must be the HTML Element where to position the caret or a PositionPath.');
			}

			if(endContainer instanceof PositionPath){
				var endNode = getNodeByPosition(endContainer);
				this.target = new Target(endNode);
			}else{
				this.target = new Target(endContainer);
			}

			if(this.target.isContentEditable() || this.target.isText()){
				return _setPositionElement.call(this, pos);
			}else{
				return _setPositionInputTextArea.call(this, pos);
			}
		}
	};

//private methods
function _getPositionContentEditable(){

	this.target.node.focus();

	var range = window.getSelection().getRangeAt(0);

	return {
		value : range.endOffset,
		path : new PositionPath(this.target.node, range.endContainer),
		container : range.endContainer,
		//range.endContainer is a text node
		//the text that contains the caret
		textContainer : range.endContainer.nodeValue || ''
	};
}

function _getPositionInputTextArea(){
	this.target.node.focus();
	
	return {
		value : this.target.node.selectionStart,
		path : new PositionPath(this.target.node, this.target.node),
		container : this.target.node,
		//this.target.node is textarea or input
		//the text that contains the caret
		textContainer : this.target.node.value || ''
	};

}

//sets the caret position in text node or html editable element
function _setPositionElement(pos){
	//endContainer should be a textNode or an element containing a textNode
	var endContainer = this.target.node;
	
	if(!this.target.isText()){
		endContainer = this.target.node.firstChild;	
	}

	if(endContainer.nodeType != 3){
		throwError('The endContainer you specified to position the caret should be a textNode or an Element containing a textNode as first child.');
	}

	//this is for IE because it considers blank spaces &nbsp; and symbols inserted as separate textNodes 
	//therefore the position path technique doesn't map the position of the endContainer originally containing the caret
	//after you insert symbols or spaces new nodes appear  and the position path is not the same anymore
	//so you need to position the caret in those new nodes going from the original node where you wanted to position it
	//otherwise you try to insert at a position greater than the textNode length it will trigger an index error
	//basically you move the caret in the next node until you can position it at the wanted position but in a node that has sufficient length to contain it
	while(pos > endContainer.length && endContainer.nextSibling){
		pos = pos - endContainer.length;
		endContainer = endContainer.nextSibling;
	}

	//if you still overflow the container it means the pos input is purposefully too big
	//we simply position the caret at the end of the endContainer (avoids the index size error)
	if(pos > endContainer.length){
		pos = endContainer.length;
	}

    var range = document.createRange();

    range.selectNodeContents(endContainer);
    range.setEnd(endContainer, pos);
    range.collapse(false);
    selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
     
}

function _setPositionInputTextArea(pos){
	this.target.node.setSelectionRange(pos, pos);	
}

//utils functions
function throwError(message){
	throw new Error('Caret : '+message);
}
//retrieves a node in a DOM tree given a PositionPath object
//the PositionPath object gives the path array needed to find the child node from the root node
function getNodeByPosition(positionPath){
	var tree = positionPath.getTree();
	var node = tree.root;
	var pathValues = tree.path;

	for(var i = 0; i < pathValues.length; i++){
		node = node.childNodes[pathValues[i]];
	}

	return node;
}

//path is an array that locates a node in a DOM tree under a root node
//[0,2,3] = child node is the 3rd child of the 2nd child of the 1st child of root node
//this allows to find node in a DOM tree by position in a tree where nodes are not the same for DOM but the same in position 
//for example when the tree was dynamically modified
function PositionPath(targetNode, textNode){
	var tree = {};
	var path = [];

	path = pathFromNode(targetNode, textNode, path);

	this.getTree = function(){
		return {
			root : targetNode,
			path : path
		};
	};
}

//array that locates a node in a DOM tree under a root node
function pathFromNode(targetNode, node, path){

	if(targetNode === node || typeof node == 'undefined' || typeof node.parentNode == 'undefined'){
		return path;
	}

	var childIndex = getIndex(node.parentNode, node);

	path.unshift(childIndex);

	return pathFromNode(targetNode, node.parentNode, path);

}

function getIndex(parentNode, childNode){
	var index;

	for(var i = 0; i < parentNode.childNodes.length; i++){
		if(parentNode.childNodes[i] === childNode){
			return i;
		}
	}
}

window.Caret = Caret;

}(this));
/* src/caret.js ends. */

/* src/target.js begins : */
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
/* src/target.js ends. */

/* src/typer.js begins : */
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
/* src/typer.js ends. */

/* src/symbolTyper.js begins : */
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

/* src/symbolTyper.js ends. */

/* src/wrappers/footer.js begins : */
window.symbolTyper = symbolTyper;

}(this));
/* src/wrappers/footer.js ends. */
