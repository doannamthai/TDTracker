var API = require("../../api");
var TABLE = require("../../Sql_table");
var engine = require("../../config/MySql"); 

module.exports.init = function (app) { 
    app.route(API.LOGIN_URL)
    .post(login);
   
};

/** User login **/
function login(req, res){
    let data = req.query;
    let username = data.username;
    let password = data.password;
    let pool = engine.getPool();
    if (!username || !password)
        return;
    // Retrieve connection from the pool
    pool.getConnection(function(err, con) {
        var jsonResult = {};
        // Handle error
        if (err) {
            jsonResult.error = err;
            res.json(jsonResult);
        } else {
            // Query insert
            var sql = `SELECT active, COUNT(*) AS c FROM ${TABLE.USER} WHERE username='${username}' AND password='${password}'`;
            // Execute query
            con.query(sql, function (err, result) {

                // Handle error
                if (err) jsonResult.error = err.code;
                else    {
                    if (result[0]["c"] === 1){
                        if (!result[0]["active"]){
                            jsonResult.error = "NOT_ACTIVE";
                        } else {
                            // Save the current session
                            jsonResult.result = "OK";
                            engine.connect(username, password);
                        }
                    } else {
                        jsonResult.error = "WRONG_ACCOUNT";
                    }
                }
                  
                // Return json result
                res.json(jsonResult);

                // Release this connection
                con.release();
            });
        }
    });
    
}


