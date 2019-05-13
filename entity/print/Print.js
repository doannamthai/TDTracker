var API = require("../../api");
var path = require('path');

module.exports.init = function (app) { 
    app.route(API.LABEL_PRINT_URL).post(printLabel)
};

let scriptPath = path.resolve('resources/BrotherQL.vbs');
let layoutPath = path.resolve('resources/TDMBarcodeLayout.lbx');

/** Get specific product info */
function printLabel(req, res) {
    //console.log(req.query.copy);
    const provider = req.query.provider.toString();
    const barcode = req.query.barcode.toString();
    const price = req.query.price.toString();
    const pages = req.query.pages.toString();

    const
        spawn = require( 'child_process' ).spawnSync,
        vbs = spawn( 'cscript.exe', [ scriptPath, provider, barcode, price, pages, layoutPath ] );
    
    let jsonObject = {};
    jsonObject.result = {
         output: vbs.output,
         pid: vbs.pid,
         error: vbs.error,
         stderr:  `${vbs.stderr.toString()}`,
         stdout:  `${vbs.stdout.toString()}`,
         status: `${vbs.status}`,
    };
    res.json(jsonObject)
     
}


