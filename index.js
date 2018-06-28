var express = require('express');
var app = express();

const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL || 'postgres://fzakqxbwdtrbnu:ebef537206b267f37df5a5809831aa91ea89d831e70ab9fe03d0109f8ef5edca@ec2-54-235-196-250.compute-1.amazonaws.com:5432/d9tvk4s60e5qbe';

const pool = new Pool({connectionString: connectionString});

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));


app.get('/getDessert', function(req, res) {
    getDessert(req, res);
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});


function getDessert(req, response) {
    getPersonFromDb(function(error, result) {
        if (error || result == null || result.length != 1) {
           response.status(500).json({success: false, data:error}); 
        } else {
            var person = result[0];
            response.status(200).json(result[0]);
        }

    });

}

function getPersonFromDb(callback){
    console.log("Getting desserts from database");

    var sql = "SELECT * FROM dessert";


    pool.query(sql, function(err, result){
        if (err){
            console.log("Error in query: ");
            console.log(err);
            callback(err, null);
        }

        console.log("Found result: " + JSON.stringify(result.rows));

        callback(null, result.rows);
    });
    
}

