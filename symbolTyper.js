/* symbolTyper - v0.1.0 - 2014-05-29 */
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

browserIsSupported : function(){
	return (typeof tmp.textContent !== 'undefined');
},

htmlTrim : function htmlTrim(text){
	return text.replace(/^\s+|\s+$|&nbsp;/g, '');
},

throwError :  throwError,

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

function throwError(message){
	throw new Error('symbolTyper : '+message);
}
/* src/utils.js ends. */

/* src/symbol.js begins : */
function Symbol(symbol, target, key){

	symbol.key = key;

	symbol.pattern = this.getPattern(symbol.replaced, target);

	this.validate(symbol, key);
	//power hack to insert a unicode as html entity in an input via javascript
	symbol.htmlSymbol = utils.convertToHtml(symbol.unicode);

	symbol.encoded = encodeURIComponent(utils.htmlTrim(symbol.htmlSymbol));

	symbol.before = formatSeparator(symbol.before, target);		

	symbol.after = formatSeparator(symbol.after, target);

	symbol.inserted = symbol.before+symbol.htmlSymbol+symbol.after;

	symbol.textInserted = utils.convertToText(symbol.inserted);

	return symbol;
}

function formatSeparator(separator, target){
	if(!separator){
		return '';
	}else{
		if(utils.isContentEditable(target)){
			var sep = separator.replace(/^\s+|\s+$/g, '&nbsp;');
			return utils.convertToHtml(sep);
		}
	}

	return separator;	
}

Symbol.prototype = {
	//controls the input of the plugin
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

	var supported;
	var ie;
	
	if(window.addEventListener){
		window.addEventListener('load', init);
	}
	
	if(window.attachEvent){
		window.attachEvent('onload', init);
	}
	
	function init(){
		supported = typeof (window.getSelection && document.createRange) !== 'undefined';//Modern Browsers and IE9+
		
		if(supported === false){
			throwError('This browser is not supported. This script only supports HTML5 browsers and Internet Explorer 9 and above');
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
		container : range.endContainer
	};
}

function _getPositionInputTextArea(){
	this.target.node.focus();
	
	return {
		value : this.target.node.selectionStart,
		path : new PositionPath(this.target.node, this.target.node),
		container : this.target.node
	};

}

function _setPositionElement(pos){
	var endContainer = this.target.node;
	
	if(!this.target.isText()){
		endContainer = this.target.node.firstChild;	
	}

    var range = document.createRange();//Create a range (a range is a like the selection but invisible)
    range.selectNodeContents(endContainer);//Select the entire contents of the element with the range
    range.setEnd(endContainer, pos);
    range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
    selection = window.getSelection();//get the selection object (allows you to change selection)
    selection.removeAllRanges();//remove any selections already made
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
//this allow to find node in a DOM tree by position in a tree where nodes are not the same for DOM but the same in position 
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
/* src/target.js ends. */

/* src/typer.js begins : */
function Typer(HTMLElt, symbols, onTyped){
	var _typer = this;
	var _filterKeyDown = false;
	var _IE = false;
	
	_typer.symbols = utils.clone(symbols);

	_typer.onTyped = onTyped;

	utils.IEFix();

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

		if(_filterKeyDown){
			return;
		}
		
		var targetElt = _IE ? event.srcElement : event.target;

		if(targetElt !== _target.node){
			_target = new Target(targetElt, _typer.symbols);
		}

		_target.event = event;

		_target.insertSymbols();

	   	if(typeof _typer.onTyped == 'function'){
	   		var result = _target.getStatus();

	   		_typer.onTyped(result, event);
	   	}
	}

}
/* src/typer.js ends. */

/* src/symbolTyper.js begins : */
function symbolTyper(HTMLElt, symbols, onTyped){
	if(utils.browserIsSupported() === false){
		throwError('This browser is not supported. This script only supports HTML5 browsers and Internet Explorer 9 and above.');
	}		

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
/* src/symbolTyper.js ends. */

window.symbolTyper = symbolTyper; 
}(this));