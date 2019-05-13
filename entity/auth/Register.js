var API = require("../../api");
var TABLE = require("../../Sql_table");
var engine = require("../../config/MySql"); 

module.exports.init = function (app) { 
    app.route(API.REGISTER_URL)
    .post(register);
   
};

/** Register the user **/
function register(req, res){
    let pool = engine.getPool();

    let data = req.query;
    let username = data.username;
    let password = data.password;
    let email = data.email;
    let phone_number = data.phone_number;
    let first_name = data.first_name;
    let last_name = data.last_name;


    // Retrieve connection from the pool
    pool.getConnection(function(err, con) {
        var jsonResult = {};
        // Handle error
        if (err) {
            jsonResult.error = err;
            res.json(jsonResult);
        } else {
            // Query insert
            var sql = `INSERT INTO ${TABLE.USER}(username, password, email, phone_number, first_name, last_name) 
            VALUE ('${username}', '${password}', '${email}', '${phone_number}', '${first_name}', '${last_name}')`;

            // Execute query
            con.query(sql, function (err, result) {

                // Handle error
                if (err) jsonResult.error = err.code;
                else    jsonResult.result = "OK";
                  
            
                // Return json result
                res.json(jsonResult);

                // Release this connection
                con.release();
            });
        }
    });
    
}


