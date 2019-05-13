var API = require("../../api");
var engine = require("../../config/MySql"); 
var TABLE = require("../../Sql_table");


module.exports.isPermitted = function(user_id, role_id){
    let pool = engine.getPool();
    return new Promise((resolve, reject) => { 
        pool.query(`SELECT COUNT(*) AS c FROM ${TABLE.USER_ROLE} WHERE user_id=${user_id} AND role_id=${role_id}`, (err, result) => {
            if (err)
                reject(err);
            else
                resolve(result[0].c === 1 ? true : false);
        })
    })
}

