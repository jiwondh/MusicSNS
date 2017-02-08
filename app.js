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
	database : 'music_sns'
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
		res.render('home', {topics:['Logout', 'Users', 'New'], authId: req.session.authId});
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
			req.session.authId = req.body.name;
			req.session.save(function(){
				res.redirect('/');
			});
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
app.get('/api/sessions', function(req, res){
	res.send(req.session);
});
app.get(['/:userId'], function(req, res){
	var uname = req.params.userId;
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
						if(postId){
							var sql = 'SELECT * FROM posts WHERE PostId=?';
							conn.query(sql, postId, function(err, results){
								if(err){
									return done('There is no post!');
								}else{
									var post = results[0];
									res.render('user', {authId: uname, user: user, posts: posts, sPost: post });
								}
							});
						}else{
							res.render('user', {authId: uname, user: user, posts: posts});
						}
					}
				});
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

