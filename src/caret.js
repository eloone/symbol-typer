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
	var endContainer = this.target.node;
	
	if(!this.target.isText()){
		endContainer = this.target.node.firstChild;	
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