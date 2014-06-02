$(document).ready(function(){

	var symbols = {

        arrow_right : {
            unicode : '&#xf0a9;',
            before : ' ',
            after : ' ',
            replaced : ['->', '=>']
        },

        smileys : {
            unicode : '&#xf118;',
            before : ' ',
            after : ' ',
            replaced : [':-)', ':)']
        },

        bolts : {
            unicode : '&#xf0e7;',
            before : ' ',
            after : ' ',
            replaced : ['*', 'bolt'],
            limit : 5
        },
  
        hearts : {
            unicode : '&#xf004;',
            replaced : ['<3'],
            limit : 5
        }
    };

    displaySymbolTable(symbols);

    //example when symbolTyper is applied to several elements 
    var typer = $('.editable').symbolTyper(symbols, onTyped);
    
	//example when symbolTyper is applied to only one element 
    var otherTyper = $('#single_input').symbolTyper(symbols, onTyped);

    $('button.grouped').on('click', function(){
    	 var id = $(this).data('id');
         var t = typer[id].getStatus();
         console.log(t);
    });

    //when only one element the id is not required to get the status
    $('button.single').on('click', function(){
    	//the id is not required to get the status but still works
    	//this is still valid :
    	//var t = otherTyper['single_input'].getStatus();
        var t = otherTyper.getStatus();
        console.log(t);
    });

    function onTyped(res, event){
		displayStatus(res);
    }
});