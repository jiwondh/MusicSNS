$(document).ready(function(){
	//음악 추가 버튼을 클릭
	$('#plusIcon, #plusText').on('click', function(){
		$('#plusIcon, #plusText').hide();
		//$('#newPost').height(500);
		$('#closeIcon').show();
		$('#searchVideo').show();
		$('#preview').show();
		
	});
	//음악 추가 창에서 닫기를 클릭
	$('#closeIcon').on('click', function(){
		$('#closeIcon').hide();
		$('#searchVideo').hide();
		$('#preview').hide();
		$('#contents').hide();
		$('#buttonGroup').hide();
		$('#plusIcon, #plusText').show();
		$('#newPost').height(170);
		$('#musicKeword').val("");
		$('#preview').empty();
	});

	//음악 검색
	$('#musicKeword').on('input',function() {
		$('#newPost').height(500);
		var keyword = $('#musicKeword').val() + ' music';
		console.log(keyword);
		var encodedKeyword = encodeURIComponent(keyword);
		var api = 'AIzaSyBxxhLczSurT2vwBKxChr59cnAX333xoRI';
		var url = 'https://www.googleapis.com/youtube/v3/search?part=snippet&q='+ encodedKeyword+'&type=video&videoEmbeddable=true&key='+api;
		$.get(url, function(data, status){
			console.log(data);
			$('#preview').empty();
			for(var i=0; i<5; i++){
				$('#preview').append('<div class= "searchResult hvr-fade" id="searchResult_'+i+'"></div>');
				$('#searchResult_'+i).append('<div class="thumbnail"></div>');
				$('#searchResult_'+i+' .thumbnail').append('<img src="http://img.youtube.com/vi/' + data.items[i].id.videoId + '/0.jpg" height="70" width="100">');
				$('#searchResult_'+i).append('<div class="videoTitle">'+data.items[i].snippet.title+'</div>');
				$('#searchResult_'+i).attr('data-id', data.items[i].id.videoId);
				$('#searchResult_'+i).attr('data-title', data.items[i].snippet.title);
			}
		}).done(function(){
			$('.searchResult').on('click', function(){
				var selectedVideoId = $(this).data('id');
				var selectedVideoTitle = $(this).data('title');
				$('#searchVideo').hide();
				$('#preview').hide();
				$('#contents').show();
				$('#contents').attr('data-id', selectedVideoId);
				$('#contents').attr('data-title', selectedVideoTitle);
				$('#contents #video').empty().append('<iframe height="300" src="https://www.youtube.com/embed/'+selectedVideoId+'?rel=0" frameborder="0" allowfullscreen=""></iframe>');
				$('#buttonGroup').show();
				$('#buttonGroup').css('display', 'inline-flex');
			});
		});
	});

	$('#backButton').on('click', function(){
		$('#searchVideo').show();
		$('#preview').show();
		$('#contents #video').empty();
		$('#contents').hide();
		$('#buttonGroup').hide();
	});

	$('#uploadButton').on('click', function(){
		var userId = $('#newPost').data('user_id');
		var postUrl = "/"+userId+"/posts/new";
		console.log(postUrl);
		var data = 
		{
			"userId" : userId,
			"videoId" : $('#contents').data('id'),
			"videoTitle" : $('#contents').data('title'), 
			"description" : $('#videoDescription').val()	
		};
		$.ajax({
			type: "POST",
			url: postUrl,
			contentType: "application/x-www-form-urlencoded; charset=UTF-8",
			cache: false,
			data: data
		}).done(function() {
			console.log(data);
			$(window).attr('location','/');
		});
	});

	//프로필 크기 사진 맞추기
	$('.post-header .profileImage').height($('.post-header .profileImage').width());
	
	$(window).on('resize', function(){
		$('.post-header .profileImage').height($('.post-header .profileImage').width());	
	});
});
