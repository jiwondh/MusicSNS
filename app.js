var express = require('express');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var bodyParser = require('body-parser');
var mysql = require('mysql');
var https = require('https');
var conn = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'ilovee0089',
	database : 'music_sns',
	multipleStatements : true
});
conn.connect();
var app = express();
var options = {
	host     : 'localhost',
	port	 : 3306,
	user     : 'root',
	password : 'ilovee0089',
	database : 'music_sns'
};
app.use(session({
	secret: '12sdfwerwersdfserwerwef', //keboard cat (랜덤한 값)
	resave: false,
	saveUninitialized: true,
	store: new MySQLStore(options)
}));

app.locals.pretty = true;
app.set('view engine', 'jade');
app.set('views', './views');
app.use(express.static('public'));

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: false }));
app.get('/template', function(req, res){
	res.render('temp', {time:Date(), title:'Jade'});
});
app.get('/', function(req, res){
	if(req.session.authId){
		var sql = 'SELECT b.UserId, b.AuthId FROM follow a inner join users b ON b.UserId = a.FollowedId inner join users c ON c.UserId = a.FollowerId  where c.AuthId=?';
		conn.query(sql, req.session.authId, function(err, Followed){
			if(err){
				console.log(err);
			}else{
				var FollowedIds = [];
				var query="";
				for(var i=0; i<Followed.length; i++)
					FollowedIds.push(Followed[i].UserId);
				
				query+= "SELECT * FROM posts a inner join users b ON a.Writer = b.UserId  WHERE Writer ="+FollowedIds[0];
				for(i=1; i<FollowedIds.length; i++){
					query+=" OR Writer = " + FollowedIds[i];
				}
				conn.query(query, function(err, results){
					if(err){
					
					}else{
						//res.send(results);
						res.render('home', {topics:['Logout', 'Users', 'New'], FollowedPosts: results, sessionId: req.session.authId, Followed: Followed});
					}
				});
			}
		});	

	}else{
		res.render('login');
	}
});

app.post('/', function(req, res){
	var uname = req.body.login_name;
	var pwd = req.body.login_password;
	var sql = 'SELECT * FROM users WHERE AuthId=?';
	conn.query(sql, uname, function(err, results){
		console.log(results);
		if(err){
			return done('There is no user!');
		}
		var user = results[0];
		if(pwd === user.Password){
			req.session.authId = uname;
			req.session.UserId = user.UserId;
			req.session.save(function(){
				res.redirect('/');
			});
		}else{
			res.redirect('/');
		}
	});
});
app.post('/auth/register', function(req, res){
	var user = {
		Email : req.body.email ,
		Username : req.body.username ,
		AuthId : req.body.name, 
		Password : req.body.password
	};
	var sql = 'INSERT INTO users SET ?';
	conn.query(sql, user, function(err, results){
		if(err){
			console.log(err);
			res.status(500);
		}else{
			var sql = 'SELECT * FROM users WHERE AuthId = ?';
			conn.query(sql, req.body.name, function(err, results){
				if(err){
					console.log(err);
				}else{
					req.session.authId = req.body.name;
					req.session.UserId = results[0].UserId;
					req.session.save(function(){
						res.redirect('/');
					});

				}
			});//SELECT 
		}
	});
});

app.get('/Logout', function(req, res){
	delete req.session.authId;
	req.session.save(function(){
		res.redirect('/');
	});
});
app.get('/api/users', function(req, res){
	var sql = 'SELECT * FROM users';
	conn.query(sql, function(err, results){
		console.log(results);
		if(err){
			return done('There is no user!');
		}else{
			res.send(results);
		}
	});
});
app.get('/api/users/:userId/posts', function(req, res){
	var userId = req.params.userId;
	var sql = 'SELECT * FROM users a inner join posts b On a.UserId = b.Writer where a.AuthId=?';	
	conn.query(sql, userId, function(err, results){
		if(err){
			console.log(err);
		}else{
			res.send(results);
		}
	});
});
app.get(['/api/follower/:followedId', '/api/followed/:followerId'], function(req, res){
	var followedId = req.params.followedId;
	var followerId = req.params.followerId;
	if(followedId){
		var sql = 'SELECT b.UserId, b.AuthId FROM follow a inner join users b on a.FollowerId=b.UserId inner join users c on a.FollowedId=c.UserId WHERE c.AuthId=?';
		conn.query(sql, followedId, function(err, follower){
			if(err) console.log(err);
			else res.send(follower);
		});
	}else if(followerId){
		var sql2='SELECT b.UserId, b.AuthId FROM follow a inner join users b on a.FollowedId=b.UserId inner join users c on a.FollowerId=c.UserId WHERE c.AuthId=?';
		conn.query(sql2, followerId, function(err, follower){
			if(err) console.log(err);
			else res.send(follower);
		});
	}
});

app.get('/api/sessions', function(req, res){
	res.send(req.session);
});

app.get(['/follow'], function(req, res){
	var follower = req.session.authId;
	var followed = req.query.followedId;
	var followerId;
	var followedId;
	var sql = 'SELECT * FROM users WHERE AuthId=? OR AuthId=?';
	conn.query(sql, [follower, followed], function(err, results){
		if(err){
			return done('There is no user!');
		}else{
			if(results){
				for(var i=0; i<2; i++){
					if(results[i].AuthId==follower)
						followerId=results[i].UserId;
					else
						followedId=results[i].UserId;
				}//for
				if(followerId && followedId){
					var follow = {
						FollowerId : followerId,
						FollowedId : followedId
					};
					var sql = 'INSERT INTO follow SET ?';
						conn.query(sql, follow, function(err, results){
						if(err){
							console.log(err);
							res.status(500);
						}else{
							res.redirect('/'+followed);
						}
					});
				}
			}//if
		}
	});
});
app.get(['/unfollow'], function(req, res){
	var follower = req.session.authId;
	var followed = req.query.followedId;
	var followerId;
	var followedId;
	var sql = 'SELECT * FROM users WHERE AuthId=? OR AuthId=?';
	conn.query(sql, [follower, followed], function(err, results){
		if(err){
			return done('There is no user!');
		}else{
			if(results){
				for(var i=0; i<2; i++){
					if(results[i].AuthId==follower)
						followerId=results[i].UserId;
					else
						followedId=results[i].UserId;
				}//for
				if(followerId && followedId){
					var sql = 'DELETE FROM follow WHERE FollowerId=? AND FollowedId=?';
						conn.query(sql, [followerId, followedId], function(err, results){
						if(err){
							console.log(err);
							res.status(500);
						}else{
							res.redirect('/'+followed);
						}
					});
				}
			}//if
		}
	});
});
app.get('/api/FollowedPosts', function(req, res){
	var sessionId = req.session.authId;
	var sql = 'SELECT b.UserId FROM follow a inner join users b ON b.UserId = a.FollowedId inner join users c ON c.UserId = a.FollowerId  where c.AuthId=?';
	conn.query(sql, sessionId, function(err, results){
		if(err){
			console.log(err);
		}else{
			console.log(results);
			var FollowedIds = [];
			var query="";
			for(var i=0; i<results.length; i++)
				FollowedIds.push(results[i].UserId);
			
			for(i=0; i<FollowedIds.length; i++){
				query += "SELECT * FROM posts a inner join users b ON a.Writer = b.UserId  WHERE a.Writer ="+FollowedIds[i]+"; ";
			}
			conn.query(query, function(err, results){
				if(err){
				
				}else{
					var AllFollowedPosts=[];
					for(i=0; i<results.length; i++)
						for (var j=0; j<results[i].length; j++)
							AllFollowedPosts.push(results[i][j]);
					res.send(AllFollowedPosts);
				}
			});
		}
	});	
});
app.get(['/:userId'], function(req, res){
	var uname = req.params.userId;
	var sessionId = req.session.authId;
	var sql = 'SELECT * FROM users WHERE AuthId=?';
	conn.query(sql, uname, function(err, results){
		if(err){
			return done('There is no user!');
		}else{
			if(results[0]){
				var user = results[0];
				var sql = 'SELECT * FROM posts WHERE Writer=?';
				conn.query(sql, user.UserId, function(err, posts){
					if(err){
						return done('There is no posts!');
					}else{
						var postId = req.query.postId;
						//게시물이 열려있을 때
						if(postId){
							var sql = 'SELECT * FROM posts WHERE PostId=?';
							conn.query(sql, postId, function(err, results){
								if(err){
									return done('There is no post!');
								}else{
									var sql2 = 'SELECT * FROM users a inner join follow b on a.UserId = b.FollowerId WHERE a.AuthId=? AND b.FollowedId=?';
									conn.query(sql2, [sessionId, user.UserId], function(err, follower){
										if(err){
											console.log(err);
											res.status(500);
										}else{
											var post = results[0];
											//팔로워일때
											if(follower[0]){
												res.render('user', {authId: uname, sessionId: sessionId, user: user, posts: posts, sPost: post, follower: true });

											}else{
												res.render('user', {authId: uname, sessionId: sessionId, user: user, posts: posts, sPost: post });

											}
										}
									});//SELECT
								}
							});
						}
						//게시물이 닫혀있을 때
						else{
							var sql2 = 'SELECT * FROM users a inner join follow b on a.UserId = b.FollowerId WHERE a.AuthId=? AND b.FollowedId=?';
							conn.query(sql2, [sessionId, user.UserId], function(err, follower){
								if(err){
									console.log(err);
									res.status(500);
								}else{
									//팔로워일때
									if(follower[0]){
										res.render('user', {authId: uname, sessionId: sessionId, user: user, posts: posts, follower:true});

									}else{
									
										res.render('user', {authId: uname, sessionId: sessionId, user: user, posts: posts});
									}
								}
							});//SELECT
						}//else
					}//else
				});//SELECT
			}//if
		}//else
	});
});

app.post('/:userId/posts/new', function(req, res){
	var uname = req.body.userId;
	var sql = 'SELECT * FROM users WHERE authId=?';
	conn.query(sql, uname, function(err, results){
		console.log(results);
		if(err){
			return done('There is no user!');
		}
		var userId = results[0].UserId;
		var post = {
			Title : req.body.videoTitle,
			Description : req.body.description,
			VideoId : req.body.videoId,
			Writer : userId
		};
		console.log(post);
		sql = 'INSERT INTO posts SET ?';
		conn.query(sql, post, function(err, results){
			if(err){
				console.log(err);
				res.status(500);
			}else{
				res.redirect('/');
			}
		});

	});
});
/*
app.get(['/users', '/user/:id'], function(req, res){
	var sql = "SELECT * FROM user";
	conn.query(sql, function(err, users, fields){
		var id = req.params.id;
		if(id){
			var sql = 'SELECT * FROM post WHERE writer=?';
			conn.query(sql, [id], function(err, posts, fields){
				if(err){
					console.log(err);
					res.status(500).send('Internal Server Error!');
				}else{
					res.render('users', {users: users, posts: posts});
				}
			});
		}else{
			res.render('users', {users: users});
		}
	});
});
app.get(['/new'], function(req, res){
	res.render('new');
});
app.post('/new', function(req, resp){
	var title = req.body.title;
	var writerName=req.body.writer;
	var description = req.body.description;
	var keyword = req.body.keword;
	var encodedKeyword = encodeURIComponent(keyword);
	var api = 'AIzaSyBxxhLczSurT2vwBKxChr59cnAX333xoRI';
	var sql = 'SELECT * FROM user WHERE name=?';
	conn.query(sql, [writerName], function(err, user, fields){
		id=user[0].id;
		var url = 'https://www.googleapis.com/youtube/v3/search?part=id&q='+encodedKeyword+'&key='+api;

		https.get(url, function(res){
			var body = '';

			res.on('data', function(chunk){
				body += chunk;
			});

			res.on('end', function(){
				var fbResponse = JSON.parse(body);
				console.log("Got a response: ", fbResponse.items[0].id.videoId);
				
				var videoID= fbResponse.items[0].id.videoId;
				var sql = 'INSERT INTO post (title, description, writer, videoId) VALUES (?, ?, ?, ?)';
				conn.query(sql, [title, description, id, videoID], function(err, user, fields){	
					if(err){
						console.log(err);
						resp.status(500).send('Internal Server Error!');
					} else {
						resp.redirect('/user/'+id);
					}
				});
			});
		}).on('error', function(e){
			console.log("Got an error: ", e);

		});
	});

});*/
app.listen(3000,  function(){
	console.log('Conneted 3000 port!');
});

