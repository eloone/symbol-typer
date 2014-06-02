window.onload = function(){

    var input = document.getElementById('input');
    var inputDiv = document.getElementById('inputDiv');
    var textarea = document.getElementById('textarea');
    var singleInput = document.getElementById('single_input');
    var btns = document.getElementsByTagName('button');
    var inputs = [input, inputDiv, textarea];

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
            replaced : '<3',
            limit : 5
        }
    };

    displaySymbolTable(symbols);

    //example when symbolTyper is applied to several elements 
    var typer = new symbolTyper(inputs, symbols, onTyped);

    //example when symbolTyper is applied to only one element 
    var otherTyper = new symbolTyper(singleInput, symbols, onTyped);

    for(var i = 0; i < btns.length; i ++){
        btns[i].onclick = function(){
            var id = this.getAttribute('data-id');
            
            if(this.className.indexOf('grouped') > -1){
                var t = typer[id].getStatus();
            }else{
                //when only one element the id is not needed to get the status
                //the id is not required to get the status but still works
                //this is still valid :
                //var t = otherTyper['single_input'].getStatus();
                var t = otherTyper.getStatus();
            }
          
            console.log(t);
        };
    }

    function onTyped(res, event){
        displayStatus(res);
    }

 };

function onKeyup(event){
    var boltsCount = document.querySelector('#boltsCount');
    var heartsCount = document.querySelector('#heartsCount');
    var target = event.target;
    var text = target.value;
    var bolts = document.createElement('p');
    var hearts = document.createElement('p');
    bolts.innerHTML = '&#xf0e7;';
    hearts.innerHTML = '&#xf004;';

    if (event.keyCode == 56 || event.keyCode == 106){// * sign
        target.value = text.replace(/\*$/, bolts.innerHTML+' ');
    }

    if (event.keyCode == 107 || event.keyCode == 187){// + sign
        target.value = text.replace(/\+$/, hearts.innerHTML+' ');
    }

    boltsCount.innerHTML = getCharCount('%EF%83%A7', encodeURIComponent(target.value));
    heartsCount.innerHTML = getCharCount('%EF%80%84', encodeURIComponent(target.value));
}

function getCountChar(char, inStr){
    return (inStr.split(char).length - 1);
}








