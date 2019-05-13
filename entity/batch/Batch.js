var API = require("../../api");
var TABLE = require("../../Sql_table");
var engine = require("../../config/MySql"); 
var async = require('async');
var constant = require("../../constant");
var util = require("../utils/Utils");

module.exports.init = function (app) { 
    app.route(API.BATCH_URL)
    .get(getBatch);

    app.route(API.LATEST_BATCH_URL)
    .get(getLatestBatch);
    
    app.route(API.DELETE_BATCH_URL)
    .post(deleteBatch);
};


/** Check if the given batch_id is already in the table */
module.exports.batchExist = batchExist; 
function batchExist(batch_serial_number, product_id){
    let pool = engine.getPool();
    pool.query(`SELECT COUNT(*) FROM ${TABLE.BATCH} WHERE batch_serial_number = '${batch_serial_number}' AND product_id = ${product_id}`, (err, results, fields) => {
        if (!err){
           if (results[0]["COUNT(*)"] == 1)
               // This item already exists
                return true;
            else 
               // This is a new product
               return false;
           
        } else throw err;
    });
}

/** Delete the batch **/
function deleteBatch(req, res){
    let pool = engine.getPool();

    let query = req.query;
    let user_id = query.user_id;
    let product_barcode = query.product_barcode;
    let batch_serial_number = query.batch_serial_number;
    let deleteBatchQuery = `DELETE FROM ${TABLE.BATCH} WHERE batch_serial_number='${batch_serial_number}'
    AND product_id = (SELECT product_id FROM ${TABLE.PRODUCT} WHERE barcode = ${product_barcode})`

    let jsonResult = {};
    // Need to check if this user is permitted to do so
    util.isPermitted(user_id, constant.DELETE_STORE)
    .then(
        re => {
            if (re){
                // Allow to delete
                pool.query(deleteBatchQuery, (err) => {
                    if (err)
                        jsonResult.error = err.code;
                    else 
                        jsonResult.result = "OK";
                    res.json(jsonResult);
                })
            }
        },
        err => {
            res.json(err);
        }
    )
}

/** Add the stock **/
module.exports.addBatchStock = addBatchStock;
function addBatchStock(product_id, body, return_callback){
    let pool = engine.getPool();

    let product_cost = body.product_cost;
    let product_current_quantity = body.product_current_quantity;
    let product_price = body.product_price;
    let product_quantity = body.product_quantity;
    let product_unit = body.product_unit;
    let expiry = body.expiry;
    let user_entered_id = body.user_entered_id;
    let timestamp = body.timestamp
    let batch_serial_number = body.batch_serial_number;
    // Check if the batch_serial_number exists
    // If exists update the record (add the given quantity to the current quantity in STOCK table)
    // Else insert a new record (insert a new batch with given info and insert new record in STOCK table)
    // If the batch_id does not exist
    let sql;

    var insertBatch = `INSERT INTO ${TABLE.BATCH} (product_id, batch_serial_number, expiry, entered_time, user_entered_id)
                VALUES (${product_id}, '${batch_serial_number}', '${expiry}', '${timestamp}', ${user_entered_id})`;
    
    var insertStock = function(batch_id, i){
        return `INSERT INTO ${TABLE.STOCK} (batch_id, unit_layer, product_unit, initial_quantity, product_cost, product_price, current_quantity) 
            VALUES (${batch_id}, ${i}, ${product_unit[i]}, ${product_quantity[i]}, ${product_cost[i]}, ${product_price[i]}, ${product_current_quantity[i]})`;
    }

    var updateStock = function(batch_id, i){
        return `UPDATE ${TABLE.STOCK} SET current_quantity = current_quantity + ${product_current_quantity[i]} 
        WHERE batch_id = ${batch_id} AND unit_layer = ${i}`;
    }

    var process = function(batch_id, processQuery, next){
        async.forEachOf(product_unit, function(value, index, callback){
            let query = processQuery(batch_id, index);
            pool.query(query, function(err, result, fields){
                if (!err)   callback(null, true);
                else        callback(err);
            });
        }, function(err){
            if(err) next(err)
            else next(null, true);
        });
    }

    async.waterfall([
        // Check if we need to insert into the BATCH Table
        function(next){
            pool.query(`SELECT id, COUNT(*) as c FROM ${TABLE.BATCH} WHERE batch_serial_number = '${batch_serial_number}' 
            AND product_id = ${product_id}`, (err, results, fields) => {
                if (!err){
                   if (results[0]["c"] === 1)
                       // This item already exists
                        next(null, results[0]["id"])
                    else 
                       // This is a new product
                       next(null, null);
                } else next(err);
            });
        },
        // If the previous one yields true, that is, this batch already exists
        // We don't need to add anything
        // Otherwise, insert a new one
        function(batch_id, next){
            if (!batch_id){
                // Insert new record to stock
                pool.query(insertBatch, (err, results, fields) => {
                    if (!err){
                        let batch_id = results.insertId;       // The id yields from the previous insertion
                        process(batch_id, insertStock, next);
                    }
                    else next(err)
                });
            } else {
                // Exist --> Update the stock (current_quantity)
                process(batch_id, updateStock, next);
            }
        }, 
    ], function(err, res) {
        if (err) return_callback(err);
        else return_callback(null, true);
    });

}


function getLatestBatch(req, res){
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
            var product_barcode = req.query.product_barcode;
            if (!product_barcode) sql = `SELECT * FROM ${TABLE.BATCH} ORDER BY entered_time DESC`;

            else 
                sql = `SELECT B.*, S.*
                        FROM (SELECT entered_time, DATE_FORMAT(expiry, '%Y-%m-%d') as expiry, product_id, batch_serial_number, id
                                FROM ${TABLE.BATCH}
                                WHERE product_id = (SELECT id FROM ${TABLE.PRODUCT} 
                                    WHERE barcode = ${product_barcode}) AND entered_time = (SELECT MAX(entered_time) FROM ${TABLE.BATCH})) AS B
                        INNER JOIN ${TABLE.STOCK} AS S
                        ON S.batch_id = B.batch_id
                        ORDER BY S.unit_layer ASC;`;

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

/** Get specific batch info */
function getBatch(req, res) {
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
            if (!req.query.product_barcode) sql = `SELECT * FROM ${TABLE.BATCH}`;
            else 
                sql = `SELECT * FROM ${TABLE.BATCH} WHERE product_id = (SELECT id FROM ${TABLE.PRODUCT} WHERE barcode = ${req.query.product_barcode})
                ORDER BY entered_time DESC`;

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


