var express = require('express');
var app = express();
var session = require('express-session');

const { Pool } = require("pg");


const connectionString = process.env.DATABASE_URL || 'postgres://fzakqxbwdtrbnu:ebef537206b267f37df5a5809831aa91ea89d831e70ab9fe03d0109f8ef5edca@ec2-54-235-196-250.compute-1.amazonaws.com:5432/d9tvk4s60e5qbe';

const pool = new Pool({connectionString: connectionString});

app.set('port', (process.env.PORT || 5000))
  .use(express.static(__dirname + '/public'))
  .use(session({
      name: "cookie-thing",
      secret: "super",
      saveUninitialized: true,
      resave: true
  }))
  .use(express.json())
  .use(logRequest)
  .use(express.urlencoded({extended:true}))
  .post("/login", function(req,res) {
        var username = req.body.username;
        var password = req.body.password;
        console.log("Username: " + username + "  Password: " + password);
        if(username == "admin" && password == "password"){
            res.status(200).json(({success: true}));
            console.log("success");
            req.session.user = username;
        }
        else{
            res.status(500).json({success: false});
            console.log("fail");

        } 

  })
  .post("/logout", function(req,res) {
    if(req.session.user != "")
    {
        req.session.destroy();
        res.status(200).json(({success: true}));
    }
    else{
        res.status(200).json(({success: false}));
    }

})
  .get('/getServerTime', verifyLogin, function(req, res) {
      var Stime = new Date();
      console.log(Stime);
      res.status(200).json({success: true, time: Stime })
  } )
  .get('/getDessert', function(req, res) {
        getDessert(req, res);
    })
  .post('/login', function(req, res) {
      getUser(req, res);
 })
  .post('/addDessert', addDessert)
  .post('/addComment', function(req, res) {
      addComment(req,res);
      return res.redirect('/main.html');
  })
  .get('/getComment', function(req, res) {
      getComment(req, res);

    })  
  .post('/addUser', addUser)
  .listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});


function logRequest(req, res, next) {
    console.log("Received a request for: " + req.url );
    next();
}


function verifyLogin(req, res, next) {
    if(req.session.user != ""){
        next();
    }
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



function getDessertFromDb(id, callback){
    console.log("Getting dessert from DB with id: " + id);

    var sql = "SELECT id, name, description, picture FROM dessert WHERE id = $1::int";

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


function getComment(req, response) {
    var id = req.query.id;
    getCommentFromDb(id, function(error, result) {
        if (error || result == null || result.length < 1) {
           response.status(500).json({success: false, data:error}); 
        } else {
            response.status(200).json(result);
        }

    });

}



function getCommentFromDb(id, callback){
    console.log("Getting comment from DB with id: " + id);

    var sql = "SELECT name, rating, comment, dessertid, id, username FROM comment WHERE dessertid = $1::int";

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
  
    getUserFromDb(req, function(error, result) {
        if (error || result == null || result.length != 1) {
           response.status(500).json({success: false, message:'Username/Password incorrect'}); 
        } else {
            var person = result[0];
            response.status(200).json(result[0]);    
        }
  
    });
  
}

function getUserFromDb(req, callback){
  console.log("Getting user from DB with username: " + username);

  var username = req.body.username;
  var password = req.body.password;

  var sql = "SELECT id, username, password, firstname, lastname FROM users WHERE username = $1 and password = $2";

  var params = [username, password];

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

function addDessert(req, res) {
    console.log("creating a new user");
  
    var name = req.body.name;
    var description = req.body.description;
    var picture = req.body.picture;

    addDessertToDb(req, function(error) {
      if (error) {
         res.status(500).json({success: false}); 
      } else {
          res.status(200).json({success:true, Name: name, Description: description});
  
      }
  
      });
    
}

function addDessertToDb(req, callback){
    console.log("Getting dessert from DB");

    var name = req.body.name;
    var description = req.body.description;
    var picture = req.body.picture;

    var sql = "INSERT INTO dessert(name, description, picture) VALUES($1, $2, $3)";
  
    var params = [name, description, picture];
  
    pool.query(sql, params, function(err, result){
        if (err){
            console.log("Error in query: ");
            console.log(err);
            callback(err, null);
        }
  
        console.log("Dessert Added.");
  
        callback(null);
    });
    
}  


function addComment(req, res) {
    console.log("creating a new user");

   
  
    var name = req.body.name;
    var rating = req.body.rating;
    var comment = req.body.comment;
    var dessertId = req.body.dessertId;

    addCommentToDb(req, function(error) {
      if (error) {
         res.status(500).json({success: false}); 
      } else {
          res.status(200).json({success:true, Name: name, Rating:rating, Comment:comment, Username: username});
  
      }
  
      });
}

function addCommentToDb(req, callback){
    console.log("Getting dessert from DB");

    var name = req.body.name;
    var rating = req.body.rating;
    var comment = req.body.comment;
    var dessertId = req.body.dessertId;
    var username = "Anonymous";
    if(req.session.user != "") {
        username = req.session.user;
    }
    else{
        username = "Anonymous";
    }
    var sql = "INSERT INTO comment(name, rating, comment, dessertid, username) VALUES($1, $2, $3, $4, $5)";
  
    var params = [name, rating, comment, dessertId, username];
  
    pool.query(sql, params, function(err, result){
        if (err){
            console.log("Error in query: ");
            console.log(err);
            callback(err, null);
        }
  
        console.log("Comment Added.");
  
        callback(null);
    });
    
}  
