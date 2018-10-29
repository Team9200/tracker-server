const express = require('express');
const app = express();
const uuid = require('uuid/v1');
const config = require('config/config.json');


app.listen(config.port, function () {

});