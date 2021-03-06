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