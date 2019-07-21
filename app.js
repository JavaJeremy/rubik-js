var express = require('express');
var app = express();
const port = 3000;
app.use('/rubik', express.static(__dirname)); // ← adjust
app.listen(port, function () {
    console.log('listening on port ' + port + ", " + __dirname);
});