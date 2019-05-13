

var express = require("express");
var app = express();
var port = process.env.port || 3000;
var cors = require('cors');

app.use(express.json())

/** Enable CORS ***/
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

/** Printer API */
var printer = require("./entity/print/Print");
printer.init(app);

/** Shelf position API **/
var shelf = require("./entity/shelf/Shelf");
shelf.init(app);
  
/*** Unit API */
var unit = require("./entity/unit/Unit");
unit.init(app);

/*** Provider API ***/
var provider = require("./entity/provider/Provider");
provider.init(app);

/*** Batch API ***/
var batch = require("./entity/batch/Batch");
batch.init(app);

/*** Product API */
var product = require("./entity/product/Product");
product.init(app);

/*** Auth API */
var auth = require("./entity/auth/Auth");
auth.init(app);
var register = require("./entity/auth/Register");
register.init(app);
var login = require("./entity/auth/Login");
login.init(app);

app.listen(port, () => {
 console.log("Server running on port 3000");
});

