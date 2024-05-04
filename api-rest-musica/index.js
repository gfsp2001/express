const connection = require('./Database/connection');
const express = require('express');
const cors = require('cors');
const port = 3910;
// conexion a ddbb
connection();
// crear servidor node
const app = express();
// configurar cors
app.use(cors());
// convertir los datos del body a objetos js
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// cargar conf rutas
const user_route = require('./Routes/user_route');
const album_route = require('./Routes/album_route');
const artist_route = require('./Routes/artist_route');
const song_route = require('./Routes/song_route');

app.use('/api/user', user_route);
app.use('/api/album', album_route);
app.use('/api/artist', artist_route);
app.use('/api/song', song_route);
// poner servidor a escuchar peticiones http
app.listen(port, () => {
    console.log("server listening on port " + port);
});