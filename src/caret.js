(function(window){

	var html5;
	var ie;
	
	if(window.addEventListener){
		window.addEventListener('load', init);
	}
	
	if(window.attachEvent){
		window.attachEvent('onload', init);
	}
	
	function init(){
		html5 = (window.getSelection && document.createRange);//Modern Browsers 
		ie = (document.selection && document.body.createTextRange);//<IE9
	}

	function Target(target){

		if( !target || target.nodeType != 1 && target.nodeType != 3){
			throw new Error('Caret : the target "'+target+'" must be an HTML Element or Text node');
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
				throw new Error('Caret can get the caret\'s position only from editable HTML Elements. "'+this.target.node+'" is not editable.');
			}

			if(this.target.isContentEditable()){
				return _getPositionContentEditable.call(this);
			}else{
				return _getPositionInputTextArea.call(this);
			}		
		},
	
		setPosition : function(pos, endContainer){
			if(pos && !endContainer){
				throw new Error('Caret : Argument 2 "'+endContainer+'" is invalid. It must be the HTML Element where to position the caret or a PositionPath.');
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

	if(html5){
		var range = window.getSelection().getRangeAt(0);

      		return {
      			value : range.endOffset,
      			path : new PositionPath(this.target.node, range.endContainer),
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
        	path : new PositionPath(this.target.node, range1.parentElement()),
        	container : range1.parentElement()
        };
	}
}

function _getPositionInputTextArea(){
	this.target.node.focus();
	
	if(html5){
		return {
			value : this.target.node.selectionStart,
			path : new PositionPath(this.target.node, this.target.node),
			container : this.target.node
		};
	}
	
	if(ie){
	 var pos = 0,
        range = this.target.node.createTextRange(),
        range2 = document.selection.createRange().duplicate(),
        bookmark = range2.getBookmark();

        range.moveToBookmark(bookmark);
        while (range.moveStart('character', -1) !== 0) pos++;
        return {
        	value : pos,
        	path : new PositionPath(this.target.node, range.parentElement()),
        	container : range.parentElement()
        };
	}
}

function _setPositionElement(pos){
	var endContainer = this.target.node;
	
	if(!this.target.isText()){
		endContainer = this.target.node.firstChild;	
	}

    if (html5) {
       // endContainer.focus();
     //   window.getSelection().collapse(endContainer, pos);
        var range = document.createRange();//Create a range (a range is a like the selection but invisible)
        range.selectNodeContents(endContainer);//Select the entire contents of the element with the range
        range.setEnd(endContainer, pos);
        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
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
     
}

function _setPositionInputTextArea(pos){
	if(html5){
		this.target.node.setSelectionRange(pos, pos);
	}
}

//utils functions

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
function PositionPath(target, textNode){
	var tree = {};
	var path = [];

	path = pathFromNode(target, textNode, path);

	this.getTree = function(){
		return {
			root : target,
			path : path
		};
	};
}

//array that locates a node in a DOM tree under a root node
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

window.Caret = Caret;

}(this));