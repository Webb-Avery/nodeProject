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
  .post('/login', function(req, res) {
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



function getDessertFromDb(id, callback){
    console.log("Getting dessert from DB with id: " + id);

    var sql = "SELECT id, name, description FROM dessert WHERE id = $1::int";

    var params = [id];

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

function getUser(req, response) {
  
    var password = req.body.password;

    getUserFromDb(req, function(error, result) {
        if (error || result == null || result.length != 1) {
           response.status(500).json({success: false, data:error}); 
        } else {
            var person = result[0];

            if(result.password == password)
                response.status(200).json(result[0]);
            else    
                response.status(200).json("message: Username/password incorrect." + result.passward + password);    
        }
  
    });
  
}

function getUserFromDb(req, callback){
  console.log("Getting user from DB with username: " + username);

  var username = req.body.username;
  var password = req.body.password;

  var sql = "SELECT id, username, password, firstname, lastname FROM users WHERE username = $1";

  var params = [username];

  pool.query(sql, params, function(err, result){
      if (err){
          console.log("Error in query: ");
          console.log(err);
          callback(err, null);
      }
      console.log(result.password); 
      console.log("Found result: " + JSON.stringify(result.rows));

      callback(null, result.rows);
  });
  
}

function addUser(req, res) {
    console.log("creating a new user");
  
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var username = req.body.username;
    var password = req.body.password;
    var passwordConfirm = req.body.passwordConfirm;
  
    addUserToDb(req, function(error) {
      if (error) {
         res.status(500).json({success: false}); 
      } else {
          res.status(200).json({success:true, first: firstname, lastname: lastname, user: username, password:password});
  
      }
  
      });
    
}

function addUserToDb(req, callback){
    console.log("Getting user from DB with username: " + username);

    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var username = req.body.username;
    var password = req.body.password;
    var passwordConfirm = req.body.passwordConfirm;

    
    var sql = "INSERT INTO users(username, password, firstname, lastname) VALUES($1, $2, $3, $4)";
  
    var params = [username, password, firstname, lastname];
  
    pool.query(sql, params, function(err, result){
        if (err){
            console.log("Error in query: ");
            console.log(err);
            callback(err, null);
        }
  
        console.log("User Added.");
  
        callback(null);
    });
    
}  
