 window.onload = function(){
    var input = document.getElementById('input');
    var input1 = document.getElementById('input1');
    var inputdiv = document.getElementById('inputDiv');
    var textarea = document.getElementById('textarea');
    
    var inputs = [input, input1, inputDiv, textarea];
   //input.addEventListener('keyup', onKeyup);

   var symbols = {
        bolts : {
            unicode : '&#xf0e7;',
            before : ' ',
            after : ' ',
            replaced : [':-)', ':)', '*', 'test'],
            limit : 5
        },
            
        hearts : {
            unicode : '&#xf004; ',
            replaced : '<3',
            limit : 5
        }
    };

   var typer = new symbolTyper(inputs, symbols, onTyped);
console.log(typer);
   /*form.onsubmit = function(){
       var res = typer['inputDiv'].getStatus();


//symbol_typer_0
//symbol_typer_1
//symbol_typer_2
//inputDiv
//symbol_typer_0
//data-symbolTyper = 

   };*/

   function onTyped(res, event){
         var boltsCount = document.getElementById('boltsCount');
         var heartsCount = document.getElementById('heartsCount');
         var rawText = document.getElementById('rawText');

         boltsCount.innerHTML = res.count.bolts;
         heartsCount.innerHTML = res.count.hearts;
         rawText.innerHTML = res.rawText;
    };

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








