var fs = require('fs');
var path = require('path');

const listar_pokemon = async (req, res) => {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon')
        const results = await response.json();
        res.status(200).send({ data: results });
    } catch (error) {
        console.log(error);
        res.status(404).send({ data: undefined });
    }

}

const obtener_datos_pokemon = async (req, res) => {
    try {
        let id = req.params.id;
        const response = await fetch('https://pokeapi.co/api/v2/pokemon/' + id)
        const results = await response.json();
        res.status(200).send({ data: results });
    } catch (error) {
        console.log(error);
        res.status(404).send({ data: undefined });
    }
}
const obtener_datos_siguiente_pokemon = async (req, res) => {
    try {
        let siguiente = req.params.siguiente;
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?offset=' + siguiente + '&limit=20')
        const results = await response.json();
        res.status(200).send({ data: results });
    } catch (error) {
        console.log(error);
        res.status(404).send({ data: undefined });
    }
}

const obtener_datos_atras_pokemon = async (req, res) => {
    try {
        let atras = req.params.atras;
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?offset=' + atras + '&limit=20')
        const results = await response.json();
        res.status(200).send({ data: results });
    } catch (error) {
        console.log(error);
        res.status(404).send({ data: undefined });
    }
}

const obtener_locacion_pokemon = async (req, res) => {
    try {
        let id = req.params.id;
        const response = await fetch('https://pokeapi.co/api/v2/pokemon/' + id + '/encounters')
        const results = await response.json();
        res.status(200).send({ data: results });
    } catch (error) {
        console.log(error);
        res.status(404).send({ data: undefined });
    }
}

module.exports = {
    listar_pokemon,
    obtener_datos_pokemon,
    obtener_datos_siguiente_pokemon,
    obtener_datos_atras_pokemon,
    obtener_locacion_pokemon
}