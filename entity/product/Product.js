var API = require("../../api");
var TABLE = require("../../Sql_table");
var engine = require("../../config/MySql"); 
var batchEngine = require("../batch/Batch");
var async = require('async');
var utils = require('../utils/Utils');
var constant = require("../../constant");


module.exports.init = function (app) {
    app.route(API.PRODUCT_URL)
        .get(getProduct);
    app.route(API.PRODUCT_NAME_URL)
        .get(fetchProductName);
    app.route(API.ALL_PRODUCT_URL)
        .get(fetchProduct);
    app.route(API.ADD_PRODUCT_URL)
        .post(addProduct);
    app.route(API.DELETE_PRODUCT_URL)
        .post(deleteProduct);
    app.route(API.UPDATE_PRODUCT_URL)
        .post(updateProduct);
    app.route(API.RESTOCK_PRODUCT_URL)
        .post(updateRestockProgress);
};


/** Add new product into the store **/
/** JSON Body: {
 * barcode : int, 
 * batch_serial_number : String, 
 * product_cost: array, 
 * product_current_quantity : array, 
 * product_price: array, 
 * product_quantity: array, 
 * product_type: int,
 * product_unit: array,
 * product_use: String
 * expiry: String,
 * product_location : int,
 * product_provider : int} */
function addProduct(req, res) {
    let pool = engine.getPool();

    let body = req.body;
    let barcode = body.barcode;
    let product_type = body.product_type;
    let product_use = body.product_use;
    let product_provider = body.product_provider;
    let product_location = body.product_location;
    let product_name = body.product_name;
    let user_entered_id = body.user_entered_id;

    // Retrieve connection from the pool
    // Jobs: insert into the table PRODUCT a new record
    // Step 1 : Check if the product barcode exits
    // Step 2 : Check if the batch_id exists
    // If exists update the record (add the given quantity to the current quantity in STOCK table)
    // Else insert a new record (insert a new batch with given info and insert new record in STOCK table)
    pool.getConnection(function (err, con) {
        var jsonResult = {};
        // Handle error
        if (err) {
            jsonResult.error = err;
            res.json(jsonResult);

        } else {
            var sql;
            async.waterfall([
                // Check if the product does exist
                function (callback) {
                    con.query(`SELECT id, COUNT(barcode) FROM ${TABLE.PRODUCT} WHERE barcode = ${barcode}`, (err, product, fields) => {
                        if (!err) {
                            if (product[0]["COUNT(barcode)"] == 1)
                                // This item already exists
                                callback(null, product[0]["id"]);
                            else
                                // This is a new product
                                callback(null, null);
                        } else {
                            throw err;
                        }
                    });
                },
                // Add time stamp to the body
                function (product_id, callback) {
                    con.query("SELECT NOW() AS time", (err, result) => {
                        if (err)
                            callback(err);
                        else 
                            callback(null, product_id, result[0].time);
                    });
                },
                // Check if we need to insert into product table
                function (product_id, timestamp, callback) {
                    if (!product_id) {
                        let sql = ` INSERT INTO ${TABLE.PRODUCT} (barcode, user_entered_id, entered_time, product_name, product_provider, 
                                    product_type, product_use, product_location)
                                    VALUES (${barcode}, ${user_entered_id}, '${timestamp}', '${product_name}', 
                                    ${product_provider}, ${product_type}, '${product_use}', ${product_location})`;
                        con.query(sql, (err, result, fields) => {
                            if (!err) callback(null, result.insertId, timestamp)
                            else callback(err, timestamp);
                        });
                    } else callback(null, product_id, timestamp);
                },
                // Add the batch and stock
                function (product_id, timestamp, callback) {
                    // Adding time stamp before proceeding to the batch
                    body.timestamp = timestamp;
                    if (product_id)
                        batchEngine.addBatchStock(product_id, body, callback);
                    else
                        callback(null, false)
                },

            ], function (err, val) {
                if (err || val === false) {
                    jsonResult.error = err;
                    res.json(jsonResult);
                } else {
                    jsonResult.result = "OK";
                    res.json(jsonResult);
                }
                con.release();
            });
        }
    });

}


function deleteProduct(req, res){
    let pool = engine.getPool();
    let query = req.query;
    let body = req.body;
    let user_id = query.user_id;
    let product_barcodes = body.product_barcodes.toString();
    let deleteQuery = `DELETE FROM ${TABLE.PRODUCT} WHERE barcode IN(${product_barcodes})`
    console.log(deleteQuery);
    let jsonResult = {};
    // Need to check if this user is permitted to do so
    utils.isPermitted(user_id, constant.DELETE_STORE)
    .then(
        re => {
            if (re){
                // Allow to delete
                pool.query(deleteQuery, (err) => {
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

/** Get specific product info */
function getProduct(req, res) {
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
            let barcode = req.query.product_barcode;
            let batch = req.query.batch_serial_number;
            if (!barcode && !batch)                      // Query  asks all products
                sql = `SELECT * FROM ${TABLE.PRODUCT}`;
            else if (!batch)                            // Query only asks for product with given id
                sql = `SELECT * FROM ${TABLE.PRODUCT} WHERE barcode = ${barcode}`;
            else if (barcode && batch)                   // Query asks for product and batch
                sql = `SELECT * FROM ${TABLE.PRODUCT} WHERE barcode = ${barcode}`;

            // Execute query
            con.query(sql, function (err, result) {

                // Handle error
                if (err) {
                    jsonResult.error = err.code;
                    res.json(jsonResult);
                    // Release this connection
                    con.release();
                    return;
                }
                else jsonResult.result = result;
                
                // If the user is trying to get batch and stock info
                if (result.length > 0 && barcode && batch) {
                    let product_id = result[0].id;
                    sql = `select DATE_FORMAT(b.expiry, '%d-%m-%Y') as expiry, s.* 
                            from ${TABLE.BATCH} as b
                            right join ${TABLE.STOCK} as s
                                on b.id = s.batch_id
                            where b.product_id = ${product_id} and b.batch_serial_number = '${batch}'
                            order by s.unit_layer`;
                    con.query(sql, function (err2, result2) {
                        if (err) jsonResult.error = err2.code;
                        else jsonResult.result[0].stock = result2;
                        // Return json result
                        res.json(jsonResult);
                        // Release this connection
                        con.release();
                    });
                } else {
                    // Return json result
                    res.json(jsonResult);

                    // Release this connection
                    con.release();
                }
            });
        }
    });
}


/** Get specific product info */
function fetchProductName(req, res) {
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
            let name = req.query.name;
            // SELECT DISTINCT
            if (req.query.distinct)
                sql = `SELECT DISTINCT product_name FROM ${TABLE.PRODUCT} WHERE LOWER(product_name) LIKE LOWER('%${name}%') LIMIT 7`

            // Execute query
            con.query(sql, function (err, result2) {
                if (err)
                    jsonResult.error = err;
                else
                    jsonResult.result = result2;
                res.json(jsonResult);
                con.release();
            });
        }
    });
}

/**
 * Get all products satisify the filter, pagnigation
 */

function fetchProduct(req, res) {
    let pool = engine.getPool();

    let query = req.query;
    let filter = query.filter;  // The filter
    let limit = query.limit;    // Limit number of rows per page
    let page = query.page;      // The current page
    // Filter
    // filter = "last-update-rank"
    // filter = "earliest-expiry-rank"
    // filter = "price-asc-rank"
    // filter = "price-desc-rank"
    let dir = "";
    let order = "ORDER BY p.product_name collate utf8_vietnamese_ci";
    if (filter) {
        if (filter === "entered-time-asc-rank"){
            
        }
    }
    if (limit && page) {

        let getStock = function(batch_id) {
            return `SELECT s.unit_layer, s.product_unit, s.initial_quantity, 
            s.product_cost, s.product_price, s.current_quantity, u.name AS product_unit_name
            FROM ${TABLE.STOCK} s
            INNER JOIN
                ${TABLE.UNIT} u ON
                u.id = s.product_unit
            WHERE s.batch_id = '${batch_id}'`;
        }


        let getProduct = function(){
            // Re-calculate the limit for the query
            let start = page == 1 ? 0 : (page - 1) * limit - 1;
            return `SELECT p.*, o.name AS product_provider_name, 
                            s.shelf_name AS product_location_name, b.last_update, b.earliest_expiry
            FROM (SELECT *
                FROM ${TABLE.PRODUCT}
                LIMIT ${start}, ${limit}) p
            LEFT JOIN 
                (SELECT product_id, MAX(entered_time) AS last_update, MIN(expiry) as earliest_expiry FROM ${TABLE.BATCH}
                GROUP BY product_id) b ON
                b.product_id = p.id
            LEFT JOIN 
                ${TABLE.PROVIDER} o ON
                o.id = p.product_provider 
            LEFT JOIN
                ${TABLE.SHELF} s ON
                s.id = p.product_location`;
        }

        let getBatch = function(product_id){
            return `SELECT id, batch_serial_number, expiry, entered_time, 
            (SELECT username from ${TABLE.USER} WHERE user_entered_id = id) AS user_entered_username
            FROM ${TABLE.BATCH} 
            WHERE product_id = ${product_id}`;
        }

        let getRestockProgress = function(product_id){
            return `SELECT p.progress_id, p.action, p.entered_time, p.note, u.username AS user_entered_username
            FROM ${TABLE.RESTOCK_PROGRESS} AS p
            LEFT JOIN ${TABLE.USER} AS u ON u.id = p.user_entered_id
            WHERE product_id = ${product_id} ORDER BY entered_time ASC`;
        }

    
        let jsonResult = {}

        pool.getConnection(function (error, con) {
            // Handle error if there is any
            handleErr(error, res, con);
            // Start the process
            async.waterfall([
                
                // Getting all the products
                function (callback) {
                    con.query(getProduct(), (err, products) => {
                        if (err) callback(err);
                        else callback(null,  products)
                    });
                    
                },
                // Adding the restock's status to products
                function (products, callback){
                    async.eachSeries(products, function (product, inner_callback) {
                        con.query(getRestockProgress(product.id), (err, pros) => {
                            if (err) inner_callback(err);
                            else {
                                product.restock_progress = pros;
                                inner_callback(null);
                            }
                        });
                    }, function(err){
                        if (err) callback(err);
                        else callback(null, products);
                    });
                },
                // Adding the batch's info to products
                function ( products, callback) {
                    async.eachSeries(products, function (product, inner_callback) {
                        con.query(getBatch(product.id), function (err, batches) {
                            if (err) inner_callback(err);
                            else {
                                // Add each stock info to its corresponding batch
                                async.eachSeries(batches, function (batch, inner_callback2) {
                                    con.query(getStock(batch.id), function(err, stocks) {
                                        if (!err) {
                                            batch.stocks  = stocks;
                                            inner_callback2(null);
                                        }
                                        else inner_callback2(err);
                                    });
                                }, function(err){
                                    if (err) inner_callback(err);
                                    else  {
                                        product.batches = batches;
                                        inner_callback(null);
                                    }
                                });
                            }
                        });
                    }, function (err){
                        if (err) callback(err);
                        else {
                            callback(null, products);
                        }
                    });
                }
            ], function(err, products){
                if (err){
                    jsonResult.error = err;
                } else {
                    jsonResult.result = {};
                    jsonResult.result.products = products;
                }
                res.json(jsonResult);
                con.release();
            })
        });
    }
}
/** Update product **/

/** JSON Body: {
 * barcode : int, 
 * product_type: int,
 * product_use: String
 * product_location : int,
 * product_provider : int} */

function updateProduct(req, res) {
    let body = req.body;
    let pool = engine.getPool();
    let new_barcode = body.barcode;
    let new_product_type = body.product_type;
    let new_product_use = body.product_use;
    let new_product_location = body.product_location;
    let new_product_provider = body.product_provider;
    let new_product_name = body.product_name;

    let user_id = req.query.user_id;
    let old_barcode = req.query.barcode;

    let jsonResult = {};

    // Check permisison
    utils.isPermitted(user_id, constant.UPDATE_STORE)
        .then(permit => {
            if (permit) {

                const updateProcess = function (res) {
                    let update = `UPDATE ${TABLE.PRODUCT} SET barcode = ${new_barcode}, 
                    product_name='${new_product_name}', 
                    product_type=${new_product_type}, product_use='${new_product_use}', 
                    product_location=${new_product_location}, product_provider=${new_product_provider} WHERE barcode = ${old_barcode}`;
                    pool.query(update, (err) => {
                        if (err) jsonResult.error = err.code;
                        else jsonResult.result = "OK";
                        res.json(jsonResult);
                    })
                }

                if (new_barcode != old_barcode) {
                    // Check if barcode can be changed
                    let checkValidity = `SELECT COUNT(*) AS c FROM ${TABLE.PRODUCT} WHERE barcode = ${new_barcode}`;
                    pool.query(checkValidity, (err, result) => {
                        if (result && result[0].c === 0) {
                            updateProcess(res);
                        } else {
                            jsonResult.error = "BARCODE_DUPLICATED";
                            res.json(jsonResult);
                        }
                    })
                } else {
                    updateProcess(res);
                }
    
            } else {
                jsonResult.error = "NOT_PERMITTED";
                res.json(jsonResult);
            }
        },
            err => {
                res.json(err);
            }
        )
}
/** Update restock progress */
function updateRestockProgress(req, res) {
    let pool = engine.getPool();
    let query = req.query;
    let barcode = query.product_barcode;
    let action = query.action;
    let user_entered_id = query.user_id;
    let jsonResult = {};
    let updateProcess = `CALL ${TABLE.RESTOCK_PROCEDURE}((SELECT id FROM ${TABLE.PRODUCT} WHERE barcode=${barcode}), 
    '${action}', ${user_entered_id}, 'No note')`;
    
    pool.query(updateProcess, (err) => {
        if (err) jsonResult.error = err.code;
        else jsonResult.result = "OK";
        res.json(jsonResult);
    })
}

/** Get statistic of the store */

function getProductStatistic(req, res) {
    let pool = engine.getPool();
    let jsonResult = {};

    let getTotal = `SELECT COUNT(*) AS r FROM ${TABLE.PRODUCT}`;
    let getOutOfStock = `SELECT COUNT(*) AS r 
                    FROM ${TABLE.BATCH} AS b
                    INNER JOIN ${TABLE.STOCK} AS s ON b.id = s.batch_id`;

    pool.getConnection(function (error, con) {
        // Handle error if there is any
        handleErr(error, res, con);
        // Start the process
        async.waterfall([
            // Getting total products
            function (callback) {
                con.query(getTotal, (err, total) => {
                    if (err) callback(err);
                    else callback(null, total)
                });
            },
            // Get total out-of-stock product
            function (total, callback){
                con.query(getOutOfStock, (err, out) => {
                    if (err) callback(err);
                    else callback(null, total, out)
                });
            },
        ], function () {

        });
    });
}

function handleErr(err, res, con){
    if (err) {
        var jsonResult = {};
        jsonResult.error = err;
        res.json(jsonResult);
        con.release();
    }
}