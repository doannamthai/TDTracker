const PORT = 3000;
const HOST = "http://localhost:"+PORT;

const PRODUCT_URL =  "/product";
const ADD_PRODUCT_URL = "/product/add";
const PRODUCT_NAME_URL = "/product/allnames";
const ALL_PRODUCT_URL = "/product/all";
const DELETE_PRODUCT_URL = "/product/delete";
const UPDATE_PRODUCT_URL = "/product/update";
const RESTOCK_PRODUCT_URL = "/product/restock";


const PROVIDER_URL = "/provider";
const SHELF_URL = "/shelf";
const UNIT_URL = "/unit";

const BATCH_URL = "/batch";
const LATEST_BATCH_URL = "/batch/latest";
const DELETE_BATCH_URL = "/batch/delete";

const LABEL_PRINT_URL = "/print/label";
const RECEIPT_PRINT_URL = "/print/receipt";

const AUTH_URL = "/auth";
const REGISTER_URL = "/register";
const LOGIN_URL = "/login";

module.exports = {
    HOST,
    PRODUCT_URL,
    ADD_PRODUCT_URL,
    PROVIDER_URL,
    SHELF_URL,
    UNIT_URL,
    BATCH_URL,
    LATEST_BATCH_URL,
    RECEIPT_PRINT_URL,
    LABEL_PRINT_URL,
    PRODUCT_NAME_URL,
    ALL_PRODUCT_URL,
    AUTH_URL,
    REGISTER_URL,
    LOGIN_URL,
    DELETE_BATCH_URL,
    DELETE_PRODUCT_URL,
    UPDATE_PRODUCT_URL,
    RESTOCK_PRODUCT_URL,
}