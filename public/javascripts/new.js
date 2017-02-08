var youtubeSearch=function(){
	//var keyword=	;
};

$(document).ready(function(){
	
	$("#searchForm").on('click',function(event){
		$("#search").show();
		
	});
	$("#searchForm").on('input',function() {
			var keyword = $("#searchForm").val();
			console.log(keyword.length);
			if(keyword.length!==0){
				console.log('공백아님');
				console.log(keyword);
				var encodedKeyword = encodeURIComponent(keyword);
				var api = 'AIzaSyBxxhLczSurT2vwBKxChr59cnAX333xoRI';
				var url = 'https://www.googleapis.com/youtube/v3/search?part=id&q='+ encodedKeyword+'&key='+api;
				$.get(url, function(data, status){
					console.log(data);
					$('#search').empty();
					for(var i=0; i<5; i++)
						$('#search').append(
							'<div class= "searchResult" id="searchResult_'+i+'"><img src="http://img.youtube.com/vi/' + data.items[i].id.videoId + '/0.jpg" height="140" width="200"></div>');
				});
			}
			else{
				console.log('공백');
				$('#search').empty();
				keyword='';

			}
		
	});
	$('.searchResult').on('hover',function(){
		console.log('호버');
	});
	

});
