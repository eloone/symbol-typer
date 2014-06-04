#SYMBOL TYPER

symbolTyper is a javascript library that lets you type symbols by replacing patterns you define.<br> 
It exists as a standalone dependency free library or a jQuery plugin.

##Pitch

Sometimes when you write, you type textual symbols like :) or <3. Wouldn't it be nice to see those symbols rendered nicely as what they represent? By using the power of icon fonts symbolTyper will replace those patterns you defined with their symbols. Until now this was done only when rendering the text after it is sent or saved, it was done when the text is no longer editable. 

With symbolTyper symbols appear as you type while you are editing the text, symbols are real characters part of the text you are editing. And even better, symbolTyper counts the symbols that were typed so you can use that information when you render the text later. The symbols are no longer just decorative, you can really use them to convey information. 

##Demo

All the demos : http://eloone.github.io/symbol-typer/demo/ 

Demo for the dependency free library : http://eloone.github.io/symbol-typer/demo/main-demo.html<br>
Demo for the jQuery plugin : http://eloone.github.io/symbol-typer/demo/jquery-demo.html

##Example

Example use with AngularJs : <br>
http://eloone.github.io/symbol-typer/demo/angular-demo.html

##Use

Includes : 
```html
	<link href="http://netdna.bootstrapcdn.com/font-awesome/4.1.0/css/font-awesome.min.css" rel="stylesheet"/>
	<script type="text/javascript" src="symbolTyper.0.1.0.js"></script>
```

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
var symbols = {
  //replaces ':-)' and ':)' by a smiley with a space before and after
  smileys : {
            unicode : '&#xf118;',
            before : ' ',
            after : ' ',
            replaced : [':-)', ':)']
        },
  //replaces <3 by a heart up to 5 times
  hearts : {
            unicode : '&#xf004;',
            replaced : '<3',
            limit : 5
        }
};
//apply symbolTyper to the editable element
//it will return a Typer object
var typer = new symbolTyper(input, symbols, onTyped);

//get the symbol count in the 'count' property of this object
var status = typer.getStatus();

//from here you can start typing in the input element and you will see symbols appear

function onTyped(status, event){
  //callback executed every time a symbol is typed
  //status provides the symbols count and typed text in the current editable element
  //event is the keyup event
  console.log(status);
}

```

For different settings view the [FULL DOCUMENTATION](DOC.md).

##Features

* Supports characters escape : `\<3` to not replace <3 by a heart
* Counts the symbols : `typer.getStatus()` to get the count per symbol and text inside the editable element
* Replaces several patterns : `replaced : [':-)', ':)']` for several patterns to replace or `replaced : '<3'` for a single pattern to replace
* Limited symbols : `limit : 5` to limit the number of symbols that will appear to 5

##Requirements

* You need to work with an icon font to enable symbol rendering. The demo for example uses FontAwesome.

##Browser support

HTML5 browsers and IE >= 9.

##Prototype

This library is based on several hacks. If you are interested in understanding how it works under the hood you can study the prototype it is based on : <br>
http://eloone.github.io/symbol-typer/demo/prototype.html 

##Demo pages
The demo pages are under the gh-pages branch. They are generated with http://assemble.io/

https://github.com/eloone/symbol-typer/tree/gh-pages/demo
