const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');



const app = express();
const port = 3000;
const { Materia, Horario, Alumno } = require('./models');
// Middleware
app.use(cors()); // Agregar CORS antes
app.use(bodyParser.json());



// Conexión a MongoDB
mongoose.connect('mongodb+srv://ensendeprende:angelFJG8)@clusterapp.g68urxk.mongodb.net/AGOTA', { useNewUrlParser: true, useUnifiedTopology: true });

// Verificar conexión
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});


// Ruta para buscar materias
app.get('/materias', async (req, res) => {
    try {
        const materias = await Materia.find(req.query);
        res.json(materias);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.get('/horario', async (req, res) => {
  try {
      console.log(req.query);
      const horario = await Horario.find(req.query);
      res.json(horario);
  } catch (error) {
      res.status(500).send(error);
  }
});


// Endpoint para obtener las carreras
app.get('/carreras', async (req, res) => {
  try {
    const carreras = await Materia.distinct('CARRERA');
    res.json(carreras);
  } catch (err) {
    console.error('Error al obtener carreras', err);
    res.status(500).send('Error al obtener carreras');
  }
});

// Endpoint para obtener los planes de estudios según la carrera
app.get('/planes-estudios/:carrera', async (req, res) => {
  const { carrera } = req.params;
  try {
    const planes = await Materia.distinct('PLAN_ESTUD', { CARRERA: carrera });
    res.json(planes);
  } catch (err) {
    console.error('Error al obtener planes de estudios', err);
    res.status(500).send('Error al obtener planes de estudios');
  }
});

// Endpoint para registrar un alumno
app.post('/registrar-alumno', async (req, res) => {
  const { correo, carrera, plan_estud } = req.body;

  try {
    const nuevoAlumno = new Alumno({
      correo,
      carrera,
      plan_estud
    });

    await nuevoAlumno.save();
    res.status(201).send('Alumno registrado con éxito');
  } catch (err) {
    console.error('Error al registrar al alumno', err);
    res.status(500).send('Error al registrar al alumno');
  }
});

// Endpoint para obtener las materias de un alumno por su email
app.get('/alumno-materias', async (req, res) => {
  const { email } = req.query;

  try {
    // Buscar al alumno por su correo electrónico
    const alumno = await Alumno.findOne({ correo: email }).populate('materias_inscritas');

    if (!alumno) {
      return res.status(404).send('Alumno no encontrado');
    }

    // Obtener las materias inscritas del alumno
    const materias = alumno.materias_inscritas;

    res.status(200).json(materias);
  } catch (err) {
    console.error('Error al obtener las materias del alumno', err);
    res.status(500).send('Error al obtener las materias del alumno');
  }
});

app.get('/buscar-materias', async (req, res) => {
  const { q, email } = req.query;

  try {
    const alumno = await Alumno.findOne({ correo: email }).populate('materias_inscritas');
    const idsMateriasInscritas = alumno ? alumno.materias_inscritas.map(m => m._id) : [];

    const materias = await Materia.find({
      $and: [
        { $or: [
          { SECUENCIA: { $regex: q, $options: 'i' } },
          { NOMBRE_MATERIA: { $regex: q, $options: 'i' } },
          { NOMBRE_PROFESOR: { $regex: q, $options: 'i' } }
        ]},
        { _id: { $nin: idsMateriasInscritas } }
      ]
    });

    res.json(materias);
  } catch (error) {
    console.error('Error al buscar materias:', error);
    res.status(500).send('Error al buscar materias');
  }
});

app.post('/agregar-materia-alumno', async (req, res) => {
  const { email, idMateria } = req.body;

  if (!email || !idMateria) {
    return res.status(400).send('Email y ID de la materia son requeridos');
  }

  try {
    const alumno = await Alumno.findOne({ correo: email });

    if (!alumno) {
      return res.status(404).send('Alumno no encontrado');
    }

    if (!alumno.materias_inscritas.includes(idMateria)) {
      alumno.materias_inscritas.push(idMateria);
      await alumno.save();
      return res.status(200).json(alumno.materias_inscritas);
    } else {
      return res.status(400).send('La materia ya está inscrita');
    }
  } catch (error) {
    console.error('Error al agregar materia al alumno:', error);
    return res.status(500).send('Error al agregar materia al alumno');
  }
});


app.delete('/eliminar-materia-alumno', async (req, res) => {
  const { email, idMateria } = req.body;

  try {
    // Buscar al alumno por su correo electrónico
    const alumno = await Alumno.findOne({ correo: email });

    if (!alumno) {
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }

    // Filtrar el arreglo de materias del alumno para eliminar la materia por ID
    alumno.materias_inscritas = alumno.materias_inscritas.filter(materia => materia.toString() !== idMateria);

    // Guardar el alumno actualizado en la base de datos
    await alumno.save();

    res.status(200).json({ message: 'Materia eliminada correctamente del horario del alumno' });
  } catch (error) {
    console.error('Error al eliminar materia del alumno', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/eliminar-materia-alumno', async (req, res) => {
  const { email, idMateria } = req.body;

  try {
    const alumno = await Alumno.findOne({ email });

    if (!alumno) {
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }

    // Filtrar las materias para eliminar la que coincida con idMateria
    alumno.materias = alumno.materias.filter(materiaId => materiaId !== idMateria);

    // Guardar el alumno actualizado en la base de datos
    await alumno.save();

    res.status(200).json({ message: 'Materia eliminada exitosamente del horario del alumno' });
  } catch (error) {
    console.error('Error al eliminar materia del alumno', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/alumno-info', async (req, res) => {
  const { email } = req.query;

  try {
    const alumno = await Alumno.findOne({ correo: email });

    if (!alumno) {
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }

    // Verificar si tiene una carrera registrada
    const tieneCarrera = !!alumno.carrera;

    res.json({ tieneCarrera, carrera: alumno.carrera });
  } catch (error) {
    console.error('Error al buscar información del alumno:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

