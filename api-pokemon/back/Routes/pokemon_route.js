const express = require('express');
const PokemonController = require('../Controllers/PokemonController');
const app = express.Router();

app.get('/listar_pokemon', PokemonController.listar_pokemon);
app.get('/obtener_datos_pokemon/:id', PokemonController.obtener_datos_pokemon);
app.get('/obtener_datos_siguiente_pokemon/:siguiente', PokemonController.obtener_datos_siguiente_pokemon);
app.get('/obtener_datos_atras_pokemon/:atras', PokemonController.obtener_datos_atras_pokemon);
app.get('/obtener_locacion_pokemon/:id', PokemonController.obtener_locacion_pokemon);

module.exports = app;