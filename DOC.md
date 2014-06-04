#DOCUMENTATION

Follow this documentation to implement symbolTyper with different options.

##Dependency free implementation

If you don't use jQuery, symbolTyper is implemented like this:
```javascript 
var typer = new symbolTyper(input, symbols, onTyped);
```

###Parameters

#### `input` : Required

* Represents the HTML editable elements where the symbols are typed in.
* Type : array of HTMLElements | HTMLElement : input, textarea, contenteditable HTMLElement | NodeList of HTMLElements
* Examples :
```js 
var input = document.getElementById('typer');
var input = document.getElementsByTagName('textarea');
var input = [document.getElementById('input'), document.getElementById('div')];
```

#### `symbols` : Required

* Represents the symbol set to map the characters you want to replace with their corresponding symbols.
* Type : object
* Format : 

````
  var symbols = {
    key_for_symbol : {
      unicode : [required],
      replaced : [required],
      before : [optional],
      after : [optional],
      limit : [optional]
    }
  };
````

* Properties :
	* `unicode` : Required 
		* Represents the symbol unicode that the icon font defined in its symbol set. This value is provided by the icon font, for example like this : http://fortawesome.github.io/Font-Awesome/cheatsheet/
		* Type : `string`
		* Format : single decimal or hexadecimal character entity reference referred to as unicode. Characters other than the unicode are not allowed.
		
		* Examples : `unicode : '&#xf170;'` (hexadecimal) or `unicode : '&#179;'` (decimal)
		
	* `replaced` : Required
		* Represents the characters that you want to replace with symbols.
		* Type : array of strings | string
		* Format : string that you want to replace with a symbol
		
		* Examples : `replaced : '<3'` will only replace `<3` or `replaced : [':-)', ':)']` will replace both ':-)' and ':)' with the same symbol.
		
	* `before` : Optional
		* Represents the string you want to prepend to the symbol once it is inserted.
		* Type : `string`
		* Format : string that is not contained in the `replaced` property.
		* Examples : `before : ' '`
		
	* `after` : Optional
		* Represents the string you want to append to the symbol once it is inserted.
		* Type : `string`
		* Format : string that is not contained in the `replaced` property.
		* Examples : `after : ' '`
		
	* `limit` : Optional
		* Represents the maximum number of times a symbol can appear. 
		* Type : `number`
		* Format : integer
		* Examples : `limit : 5`
* Examples : 

```js
//minimum configuration
//replaces * with a star
var symbols = {
	stars : {
		unicode : '&#xf005;',
		replaced : '*'
	}
};

var symbols = {
	//replaces * by a star up to 5 times
	stars : {
		unicode : '&#xf005;',
		replaced : '*',
		limit : 5
	},
	//replaces :), =) and :-) by a smiley with one space before and after
	smileys : {
		unicode : '&#xf118;',
		replaced : [':)', '=)', ':-)'],
		before : ' ',
		after : ' '
	}
};

```

* Behaviour :

	* symbols have precedence : 
```js

var symbol = {
	//replaces * by a star up to 5 times
	stars : {
		unicode : '&#xf005;',
		replaced : '*',
		limit : 5
	},
	//also wants to replace * but by a smiley
	smileys : {
		unicode : '&#xf118;',
		replaced : '*',
		before : ' ',
		after : ' '
	}
};
```
The first defined symbol wins. In this configuration, * will be replaced by a star and never by a smiley.

	* Character escape : if you want to not replace a character that should be replace, precede it with `\`.
		* Example : `'\*'` will not be replaced.
		
#### `onTyped` : Optional

* Represents a callback function that is executed everytime a symbol from the `symbols` parameter is typed in the `input` parameter.
* Type : `function`
* Format : 

````
function onTyped(status, event){

}
````

* Parameters
	* `status`  

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
