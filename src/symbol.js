function Symbol(symbol, target){

	//power hack to insert a unicode as html entity in an input via javascript
	symbol.htmlSymbol = utils.convertToHtml(symbol.unicode);

	symbol.encoded = encodeURIComponent(utils.htmlTrim(symbol.htmlSymbol));

	symbol.convertedUnicode = utils.convertToText(symbol.unicode);

	symbol.pattern = this.getPattern(symbol.replaced, target);

	if(!symbol.before){
		symbol.before = '';
	}else{
		if(utils.isContentEditable(target)){
			symbol.before = symbol.before.replace(/^\s+|\s+$/g, '&nbsp;');
		}
	}			

	if(!symbol.after){
		symbol.after = '';
	}else{
		if(utils.isContentEditable(target)){
			symbol.after = symbol.after.replace(/^\s+|\s+$/g, '&nbsp;');
		}
	}

	symbol.inserted = symbol.before+symbol.htmlSymbol+symbol.after;

	symbol.textInserted = utils.convertToText(symbol.inserted);

	return symbol;
}

Symbol.prototype = {
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