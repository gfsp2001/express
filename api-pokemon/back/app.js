var express = require('express');
var bodyParser = require('body-parser');
const cors = require('cors');
var port = process.env.port || 3910;

var app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb', extended: true }));

const pokemon_route = require('./Routes/pokemon_route');

app.use("/api", pokemon_route);

app.listen(port, () => {
    console.log("server listening on port " + port);
});
