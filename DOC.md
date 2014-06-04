#DOCUMENTATION

Follow this documentation to implement symbolTyper with different options.

##Dependency free implementation

If you don't use jQuery, symbolTyper is implemented like this:
```js 
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
* Type : `object`
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
		* Type : `array` of strings | `string`
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
	* Character escape : if you want to not replace a character that should be replaced, precede it with `\`.
		* Example : `'\*'` will not be replaced.
		
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

#### `onTyped` : Optional

* Represents a callback function that is executed every time a symbol from the `symbols` parameter is typed in the `input` parameter.
* Type : `function`
* Format : 

````
function onTyped(status, event){

}
````

* Parameters
	* `status` : see the status object below, it is the return of the `getStatus` method. 
	* `event` : keyup event triggered by the `input` element.

### Return

#### `Typer` object

Doing this : 

```js
var typer = new symbolTyper(input, symbols, onTyped);
```

will return a `Typer` object.

* Format : 

````
//Typer object
{
	getStatus : [function],
	symbols : [object],
	onTyped : [function]
}
````

* Properties : 
	* `symbols` : clone object of the symbols object from the symbolTyper parameters.
	* `onTyped` : same function as the onTyped function from the symbolTyper parameters.
	* `getStatus` : function that gets information on the text in the active editable element.
		* Return : a status object 
			* Format :
                
                ```js
			{
				count: {
					stars : 2,
					smileys : 1
				},
				fullText: "Hello world "
				rawText: "Hello world"
				targetId: "input"
			}
                ```

			* Properties : 
				* `count` : object that counts the symbols in the input element at the time you called `getStatus`. The properties used are the same identifiers you used in the `symbols` object from the parameters. 
				* `fullText` : the text including the symbols you typed in the input element at that time.
				* `rawText` : the text excluding the symbols you typed in the input element at that time.
				* `targetId` : the HTML id attribute of the `input` element.
* Usage

	* Several elements :
If the symbolTyper was applied to several elements, you can access the Typer properties for each element with their HTML id attribute like so :

        ```html
		<input type="text" id="target1"/>
		<div contenteditable="true" id= "target2"></div>
        ```

        ```js
		var typer = new symbolTyper([document.getElementById("target1"), document.getElementById("target2")], symbols);
		
		var statusTarget1 = typer['target1'].getStatus();
		var statusTarget2 = typer['target2'].getStatus();
        ```
        
	* One element : 
If the symbolTyper was applied to one element, you can access the Typer properties directly like so : 

        ```js
		var typer = new symbolTyper(input, symbols);
		var status = typer.getStatus();
		
		//or this is also still valid assuming the id attribute is 'target': 
		
		var status = typer['target'].getStatus();
		
		//typer.symbols also accessible
		//typer.onTyped also accessible
        ```
	* No id attribute

If the input element doesn't have an id attribute. It will be given an id `"symbol_typer_{index}"`. `index` being the position of the element in the `input` arguments. The Typer object will be accessible thourgh that id.

### Examples

For full examples view : 

* http://eloone.github.io/symbol-typer/demo/main-demo.html
* http://eloone.github.io/symbol-typer/demo/angular-demo.html

## jQuery implementation

If you use jQuery, symbolTyper is implemented like this:

```js 
var typer = $('.editable').symbolTyper(symbols, onTyped);
```

`typer` is a Typer object.
Everything else works like the dependence free plugin.

### Examples

For full jQuery examples view : 

* http://eloone.github.io/symbol-typer/demo/jquery-demo.html
