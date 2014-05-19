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