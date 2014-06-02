 Handlebars.registerHelper('isArray', function(a, options) {
  if(typeof a.push == 'function'){
    return options.fn(this);
  }else {
    return options.inverse(this);
  }
 });

 function displaySymbolTable(symbols){
 	var symbolsTpl = document.getElementById('symbols-template').innerHTML;
    var templateSymbols = Handlebars.compile(symbolsTpl);
    var tbody = document.getElementById('tbody');

    tbody.innerHTML = templateSymbols(symbols);
 }

 function displayStatus(res){
 	var statusTpl = document.getElementById('status-template').innerHTML;
    var templateStatus = Handlebars.compile(statusTpl);
    var active_status = document.getElementById('active_status');

    active_status.innerHTML = templateStatus(res);
 }