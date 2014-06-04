#DOCUMENTATION

Follow this documentation to implement symbolTyper with different options.

##Dependency free implementation

If you don't use jQuery, symbolTyper is implemented like this:
```js 
var typer = new symbolTyper(input, symbols, onTyped);
```

###Parameters

`input` : required

* Represents the HTML editable elements where the symbols are typed in.
* type : array of HTMLElements | HTMLElement : input, textarea, contenteditable HTMLElement | NodeList of HTMLElements
* Examples of accepted values :
  * `var input = document.getElementById('typer');`
  * `var input = document.getElementsByTagName('textarea');`
  * `var input = [document.getElementById('input'), document.getElementById('div')];

`symbols` : required

* Represents the symbol map to map the characters you want to replace with their corresponding symbols
* type : object
* format : 

```js
  var symbols = {
    key_for_symbol : {
      unicode :
    }
  
  }
```


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

//from here you can start typing in the input element and you will see symbols appear

function onTyped(status, event){
  //callback executed every time a symbol is typed
  //status provides the symbols count and typed text in the current editable element
  //event is the keyup event
  console.log(status);
}

```
