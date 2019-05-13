var API = require("../../api");
var TABLE = require("../../Sql_table");
var engine = require("../../config/MySql"); 

module.exports.init = function (app) { 
    app.route(API.AUTH_URL)
    .post(getRole);
   
};

/** Get all providers **/
function getRole(req, res){
    let user_id = req.query.user_id;
    let role_id = req.query.role_id;
    let pool = engine.getPool();
    
    if (!user_id || !role_id)
        return;

    // Retrieve connection from the pool
    pool.getConnection(function(err, con) {
        var jsonResult = {};
        // Handle error
        if (err) {
            jsonResult.error = err;
            res.json(jsonResult);
        } else {
            // Query select
            var sql = `SELECT COUNT(*) as count FROM ${TABLE.USER_ROLE} WHERE user_id=${user_id} AND role_id=${role_id}`;

            // Execute query
            con.query(sql, function (err, result) {


                // Handle error
                if (err) jsonResult.error = err.code;
                else {
                    if (result[0]["count"] === 1)   
                            jsonResult.result = true;
                    else    jsonResult.result = false;
                }

                // Return json result
                res.json(jsonResult);

                // Release this connection
                con.release();
            });
        }
    });
    
}


