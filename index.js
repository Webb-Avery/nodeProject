var express = require('express');
var app = express();

const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL || 'postgres://fzakqxbwdtrbnu:ebef537206b267f37df5a5809831aa91ea89d831e70ab9fe03d0109f8ef5edca@ec2-54-235-196-250.compute-1.amazonaws.com:5432/d9tvk4s60e5qbe';

const pool = new Pool({connectionString: connectionString});

app.set('port', (process.env.PORT || 5000))
  .use(express.static(__dirname + '/public'))
  .use(express.json())
  .use(express.urlencoded({extended:true}))
  .get('/getDessert', function(req, res) {
        getDessert(req, res);
    })
  .get('/login', function(req, res) {
      getUser(req, res);
    })
  .get('/addDessert', function(req, res) {
      //!!!!
      addDessert(req, res);
    })
  .get('/addComment', function(req, res) {
      addComment(req, res);
    })
   .get('/getComment', function(req, res) {
      getUser(req, res);
    })  
  .post('/addUser', addUser)
  .listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});

function addUser(req, res) {
  console.log("creating a new user");

  var firstname = req.body.firstname;
  var lastname = req.body.lastname;
  var username = req.body.username;
  var password = req.body.password;
  var passwordConfirm = req.body.passwordConfirm;


  res.json({success:true, first: firstname, lastname: lastname, user: username, password:password});

}

function getDessert(req, response) {
    var id = req.query.id;
    getDessertFromDb(id, function(error, result) {
        if (error || result == null || result.length != 1) {
           response.status(500).json({success: false, data:error}); 
        } else {
            var person = result[0];
            response.status(200).json(result[0]);
        }

    });

}

function getUser(req, response) {
  var username = req.query.username;

  getUserFromDb(username, function(error, result) {
      if (error || result == null || result.length != 1) {
         response.status(500).json({success: false, data:error}); 
      } else {
          var person = result[0];
          response.status(200).json(result[0]);
      }

  });

}

function getDessertFromDb(id, callback){
    console.log("Getting dessert from DB with id: " + id);

    var sql = "SELECT id, name, description FROM dessert";

//    var params = [id]; WHERE id = $1::int

    pool.query(sql, params, function(err, result){
        if (err){
            console.log("Error in query: ");
            console.log(err);
            callback(err, null);
        }

        console.log("Found result: " + JSON.stringify(result.rows));

        callback(null, result.rows);
    });
    
}

function getUserFromDb(username, callback){
  console.log("Getting user from DB with username: " + username);

  var sql = "SELECT id, username, password, firstname, lastname FROM users WHERE username = $1";

  var params = [username];

  pool.query(sql, params, function(err, result){
      if (err){
          console.log("Error in query: ");
          console.log(err);
          callback(err, null);
      }

      console.log("Found result: " + JSON.stringify(result.rows));

      callback(null, result.rows);
  });
  
}

