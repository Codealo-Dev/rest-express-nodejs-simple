const express = require('express');
const fs = require('fs');
const puerto = 3000;

const dbName = './db.txt';

const app = express();

let db = [];
function cargarDb() {
    try {
        const file = fs.readFileSync(dbName, 'utf8');
        if (file) db = JSON.parse(file.toString());
    } catch (err) {
        console.log(err);
    }
}

function guardarDb() {
    fs.writeFileSync(dbName, JSON.stringify(db));
}

app.get('/', (request, response) => {
    const { nombre } = request.query;
    let resultados = [];
    if (nombre) {
        resultados = db.filter(estudiante => {
            return estudiante
                .nombre.toLowerCase()
                .includes(nombre.toLowerCase())
        });
    } else {
        resultados = db;
    }
    return response.json(resultados);
})

app.get('/:id', (request, response) => {
    let resultado = db.find(estudiante => {
        return estudiante.id == request.params.id
    });

    if (!resultado) {
        return response.status(404).json(
            { mensaje: 'No se encontro el usuario' }
        )
    }
    
    return response.json(resultado);
});

app.listen(puerto, async () => {
    cargarDb()
    return console.log(`Estamos en el puerto ${puerto}`);
})