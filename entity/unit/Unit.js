var API = require("../../api");
var TABLE = require("../../Sql_table");
var engine = require("../../config/MySql"); 

module.exports.init = function (app) { 
    app.route(API.UNIT_URL)
    .get(getUnit);
   
};

/** Get specific product info */
function getUnit(req, res) {
    let pool = engine.getPool();

    // Retrieve connection from the pool
    pool.getConnection(function (err, con) {
        var jsonResult = {};
        // Handle error
        if (err) {
            jsonResult.error = err;
            res.json(jsonResult);
        } else {
            // Query select
            var sql;
            if (!req.query.id) sql = `SELECT * FROM ${TABLE.UNIT} order by name collate utf8_vietnamese_ci`;
            else sql = `SELECT * FROM ${TABLE.UNIT} WHERE id = ${req.query.id} order by name collate utf8_vietnamese_ci`;

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


