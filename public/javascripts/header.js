$(document).ready(function(){
	
	$('#userSearchForm').on('focus', function(){
		$('#userSearch').show();
		$('#userSearch').css('display', 'inline-block');
		$.getJSON("/api/users", function(response) {
			$('#userSearch').empty();
			$.each(response, function(i, user) {  
				$('#userSearch').append('<a href="/'+user.AuthId+'"> <div id="userResult'+i+'" class="userResult"> </div> </a>');
				$('#userResult'+i).append('<div class="profileImage"></div>');
				$('#userResult'+i).append('<div id="profileDetails'+i+'" class="profileDetails "></div>');
				$('#profileDetails'+i).append('<div class="profileId">'+user.AuthId+'</div>');
				$('#profileDetails'+i).append('<div class="profileName">'+user.Username+'</div>');
			}, 0);
		}).done(function(){
			//검색 프로필 이미지 원으로 맞추기
			$('.userResult .profileImage').height($('.userResult .profileImage').width());
		});
	});

	var userSearch = document.getElementById('userSearch');
	/* window 눌렀을 때 검색 창 사라지는 것은 user.js 에 코드 있음*/


});
