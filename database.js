
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'ilovee0089',
  database : 'music_sns'
});

connection.connect();

var sql='SELECT * FROM user';
connection.query(sql, function(err, rows, fields){
	if(err){
		console.log(err);
	}else{
		console.log('rows', rows);
		console.log('fields', fields);
		/*
		for(var i=0; i<rows.length; i++){
			console.log(rows[i].author);
		}*/
	}
});

