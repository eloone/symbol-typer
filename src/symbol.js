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