$(document).ready(function(){
	//프로필 이미지 크기 원으로 맞추기
	var imgHeight = $('#userImg').height();
	$('#userImg').width(imgHeight);
	$('#description #profileImage').height($('#description #profileImage').width());
	
	//썸네일 이미지 정사각형으로 맞추기
	var postImageWidth = $('#userPost .post').width();
	$('#userPost .post').height(postImageWidth);


	$(window).on('resize', function(){
		var imgHeight = $('#userImg').height();
		console.log(imgHeight);
		$('#userImg').width(imgHeight);
		console.log($('#userImg').width());
		//썸네일 이미지 정사각형으로 맞추기
		var postImageWidth = $('#userPost .post').width();
		$('#userPost .post').height(postImageWidth);

	});

	console.log($.cookie("scroll"));
	if ( $.cookie("scroll") !== null ) {
		$(document).scrollTop( $.cookie("scroll") );
	}

	var modal = document.getElementById('postModal');
	$('.post').on('click', function(){
		//modal.style.display = "block";
		$.cookie("scroll", $(document).scrollTop() );

	});
	
	$('#more img').on('click', function(){
		$('#logoutModal').show();
		var logout = document.getElementById('logoutModal');
		window.onclick = function(event) {
			if( event.target == logout){
				$('#logoutModal').hide();		
			}
		};

	});
	
	$('#logoutModal #cancleButton').on('click', function(){
		$('#logoutModal').hide();
	});

	var searchInput = document.getElementById('userSearchForm');
	window.onclick = function(event) {
		$.cookie("scroll", $(document).scrollTop() );
		if (event.target == modal) {				
			window.location.replace("/"+$('.modal-content #video').data('id'));
		}else if(event.target != searchInput){
			$('#userSearch').hide();
		}
	};

	var UserId = $('#userPage').data("id");
	$.getJSON("/api/follower/"+UserId, function(response) {
		$('#FollowerNumber').append('팔로워 <b>'+response.length+'</b>명');
		$.each(response, function(i, user) {  
		
		}, 0);
	}).done(function(){
	});
	$.getJSON("/api/followed/"+UserId, function(response) {
		$('#FollowNumber').append('팔로우 <b>'+response.length+'</b>명');
		$.each(response, function(i, user) {  
		
		}, 0);
	}).done(function(){
	});

});
