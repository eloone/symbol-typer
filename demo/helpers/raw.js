module.exports.register = function (Handlebars, options)  { 
  Handlebars.registerHelper("raw", function(options) {
  	return options.fn(this).replace(/\[\[/g, '{{').replace(/\{\{\[/g, '{{{').replace(/\]\]/g, '}}').replace(/\}\}\]/g, '}}}');
  });
};