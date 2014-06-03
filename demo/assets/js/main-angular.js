var symbolApp = angular.module('symbolApp', []);

symbolApp.controller('linesCtrl', function($scope){
	var input = document.getElementById('input');
	var symbols = {
		stars : {
			unicode : '&#xf005;',
			replaced : '*', 
			limit : 5
		}
	};
	var typer = new symbolTyper(input, symbols);
    var lines = [];
     	
	$scope.lines = lines;

	$scope.submitInput = function(){
		var votes = [];
		var status = typer.getStatus();
		var count = status.count.stars;

		for(var i = 0; i < 5; i++){
			votes.push({
				empty : i >= count
			});
		}

		var line = {
			title : status.rawText,
			votes : votes,
			total : count
		};
	
		$scope.lines.unshift(line);

		this.input = '';

		return false;
	};


});