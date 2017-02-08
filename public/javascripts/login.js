$(document).ready(function(){
	
	$('#join span').on('click', function(){
		$('#login_group').hide();	
		$('#join_group').show();
		$('#question #join').hide();
		$('#question #login').show();
		$('#login_form').height(440);
	});

	$('#login span').on('click', function(){
		$('#question #login').hide();
		$('#question #join').show();
		$('#login_group').show();
		$('#join_group').hide();
		$('#login_form').height(350);
	});

});
