var API = require("../../api");
var TABLE = require("../../Sql_table");
var engine = require("../../config/MySql"); 

var pool = require("../../config/MySql").getPool;

module.exports.init = function (app) { 
    app.route(API.PROVIDER_URL)
    .get(getAllProviders);
   
};

/** Get all providers **/
function getAllProviders(req, res){
    let pool = engine.getPool();

    // Retrieve connection from the pool
    pool.getConnection(function(err, con) {
        var jsonResult = {};
        // Handle error
        if (err) {
            jsonResult.error = err;
            res.json(jsonResult);
        } else {
            // Query select
            var sql = `SELECT id, name FROM ${TABLE.PROVIDER}`;

            // Execute query
            con.query(sql, function (err, result) {

                // Handle error
                if (err) jsonResult.error = err.code;
                else jsonResult.result = result;

                // Return json result
                res.json(jsonResult);

                // Release this connection
                con.release();
            });
        }
    });
    
}


