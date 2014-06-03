/*
This simplified code shows you how the typing symbol hack works. 
The symbolTyper library was built from this prototype and works with the same hacks.
*/

window.onload = function(){
    var target = document.getElementById('target');

    target.onkeyup = onKeyup;
}

function onKeyup(event){
    var boltsCount = document.getElementById('boltsCount');
    var heartsCount = document.getElementById('heartsCount');
    var target = event.target || event.src;
    var text = target.value;
    var bolts = document.createElement('p');
    var hearts = document.createElement('p');
    //hack n.1 : convert unicode to html to insert in input (not needed for contenteditable or textarea)
    bolts.innerHTML = '&#xf0e7;';
    hearts.innerHTML = '&#xf004;';

    //keyCodes can't be trusted in general to detect a typed character but are used just for demo
    if (event.keyCode == 56 || event.keyCode == 106){// * sign
        target.value = text.replace(/\*$/, bolts.innerHTML+' ');
    }

    if (event.keyCode == 107 || event.keyCode == 187){// + sign
        target.value = text.replace(/\+$/, hearts.innerHTML+' ');
    }

    //hack n.2 : url encode to count symbols
    boltsCount.innerHTML = getCharCount('%EF%83%A7', encodeURIComponent(target.value));
    heartsCount.innerHTML = getCharCount('%EF%80%84', encodeURIComponent(target.value));
}

function getCharCount(char, inStr){
    return (inStr.split(char).length - 1);
}