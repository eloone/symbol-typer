var symbolApp = angular.module('symbolApp', []);

symbolApp.controller('linesCtrl', function($scope, $rootScope){
    var lines = [];
     	
	$scope.lines = lines;

	$scope.submitInput = function(){
		var votes = [];
		var count = this.getCount();
		var encoded = encodeURIComponent(this.input);

		for(var i = 0; i < 5; i++){
			votes.push({
				empty : i >= count
			});
		}

		var line = {
			title : getRawText(encoded),
			votes : votes,
			total : count
		};
	
		$scope.lines.unshift(line);

		this.input = '';

		return false;
	};

	$scope.alterInput = function(event){
		var stars = document.createElement('p');
		stars.innerHTML = '&#xf005;';		
		var count = this.getCount();

		if (event.keyCode == 56 || event.keyCode == 106){// * sign
			if(count < 5){
				this.input = this.input.replace(/\*$/, stars.innerHTML+' ');
			}       	
    	}

	};

	$scope.getCount = function getCount(){
		var encodedText = encodeURIComponent(this.input);
		var count = getCountChar('%EF%80%85', encodedText);

		return count;
	}

	function getCountChar(char, inStr){
    	return (inStr.split(char).length - 1);
	}

	function getRawText(encodedTxt){
	 	  //fasten your seatbelts some coconut stuff going on here
	      //removes stars from edited text
	      var rawEncodedHtml = encodedTxt.replace(/(%EF%80%85)+/g, ''),
	      //gets the resulting html
	      rawHtml = decodeURIComponent(rawEncodedHtml);

	      return rawHtml;
	};

});