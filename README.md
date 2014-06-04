#SYMBOL TYPER

symbolTyper is a javascript library that lets you type symbols by replacing patterns you define.<br> 
It exists as a standalone dependency free library or a jQuery plugin.

#PITCH

Sometimes when you write, you type textual symbols like :) or <3. Wouldn't it be nice to see those symbols rendered nicely as what they represent? By using the power of icon fonts symbolTyper will replace those patterns you defined with their symbols. Until now this was done only when rendering the text after it is sent or saved, it was done when the text is no longer editable. 

With symbolTyper symbols appear as you type while you are editing the text. And even better, symbolTyper counts the symbols that were typed so you can use that information when you render the text later. The symbols are no longer just decorative, you can really use them to convey information. 

#DEMO

All the demos : http://eloone.github.io/symbol-typer/demo/ 

Demo for the dependency free library : http://eloone.github.io/symbol-typer/demo/main-demo.html<br>
Demo for the jQuery plugin : http://eloone.github.io/symbol-typer/demo/jquery-demo.html

#USE

Example use of the library with AngularJs : <br>
http://eloone.github.io/symbol-typer/demo/angular-demo.html

Use the plugin with one or more HTML elements :

HTML markup :

````
<input type="text" id="typer1"/>
````

Css : 

````
input{
	font-family: 'Arial', 'FontAwesome', cursive;
}
````
Javascript :

````
var input = document.getElementById('typer1');
var symbols = {
  smileys : {
            unicode : '&#xf118;',
            before : ' ',
            after : ' ',
            replaced : [':-)', ':)']
        },
  hearts : {
            unicode : '&#xf004;',
            replaced : ['<3'],
            limit : 5
        }
};

var typer = new symbolTyper(input, symbols, onTyped);

function onTyped(status, event){
  //callback executed every time a symbol is typed
  //status provides the symbols count and typed text in the current editable element
  //event is the keyup event
  console.log(status);
}

````

#PROTOTYPE

This library is based on several hacks. If you are interested in understanding how it works under the hood you can study the prototype it is based on : <br>
http://eloone.github.io/symbol-typer/demo/prototype.html 
