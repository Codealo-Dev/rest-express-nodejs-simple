const express = require('express');
const fs = require('fs');
const puerto = 3000;

const dbName = './db.txt';

const app = express();

app.use(express.json());

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

app.post('/estudiante', (request, response) => {
    const { body } = request;
    if (!body.nombre) {
        return response.status(400).json({
            mensaje: 'Campo nombre no esta presente',
            ok: false
        });
    }

    if (body.nombre.length < 3) {
        return response.status(400).json({
            mensaje: 'Nombre debe tener 3 o más letras',
            ok: false
        });
    }
    const ultimoId = db[db.length - 1]?.id || 0;
    const nuevoEstudiante = {
        id: ultimoId + 1,
        ...request.body
    };
    db.push(nuevoEstudiante);
    guardarDb();
    return response.status(201).json({ id: nuevoEstudiante.id });
});

app.put('/estudiante/:id', (request, response) => {
    const { id } = request.params;
    let estudiante = db.find(estudiante => {
        return estudiante.id == id;
    });

    if (!estudiante) {
        return response.status(404).json({
            mensaje: 'Estudiante no existe'
        });
    }

    const { nombre } = request.body;
    if (!nombre) {
        return response.status(400).json({
            ok: false,
            mensaje: 'Debes incluir el nombre'
        });
    }

    estudiante.nombre = nombre;
    guardarDb();
    return response.json(estudiante);
});

app.delete('/estudiante/:id', (request, response) => {
    const { id } = request.params;
    let index = db.findIndex(estudiante => {
        return estudiante.id == id;
    })

    if (index < 0) {
        return response.status(404).json({
            mensaje: 'No se encontro ese estudiante',
            ok: false
        })
    }

    db.splice(index, 1);
    guardarDb();
    return response.status(200).json({ id });
})

app.listen(puerto, async () => {
    cargarDb()
    return console.log(`Estamos en el puerto ${puerto}`);
})