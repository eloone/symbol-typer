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

#EXAMPLE

Example use of the library with AngularJs : <br>
http://eloone.github.io/symbol-typer/demo/angular-demo.html

#USE

HTML markup :

```html
<input type="text" id="typer1"/>
```

Css : 

```css
input{
	font-family: 'Arial', 'FontAwesome', cursive;
}
```
Javascript :

```js
//editable element
var input = document.getElementById('typer1');
//define your symbol map
//this map will replace ':-)' and ':)' by a smiley and '<3' by a heart
var symbols = {
  smileys : {
            unicode : '&#xf118;',
            before : ' ',
            after : ' ',
            replaced : [':-)', ':)']
        },
  hearts : {
            unicode : '&#xf004;',
            replaced : '<3',
            limit : 5
        }
};
//apply symbolTyper to the editable element
//it will return a Typer object
var typer = new symbolTyper(input, symbols, onTyped);

function onTyped(status, event){
  //callback executed every time a symbol is typed
  //status provides the symbols count and typed text in the current editable element
  //event is the keyup event
  console.log(status);
}

```
#FEATURES

* Supports characters escape : `\<3` to not replace <3 by a heart
* Counts the symbols : `typer.getStatus()` to get the count per symbol and text inside the editable element
* Replaces several patterns : `replaced : [':-)', ':)']` for several patterns to replace or `'<3'` for a single pattern to replace
* Limited symbols : `limit : 5` to limit the number of symbols that will appear to 5

#PROTOTYPE

This library is based on several hacks. If you are interested in understanding how it works under the hood you can study the prototype it is based on : <br>
http://eloone.github.io/symbol-typer/demo/prototype.html 
