const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MateriaSchema = new Schema({
    PERIODO_ESCOLAR: String,
    CARRERA: String,
    PLAN_ESTUD: String,
    ESPECIALIDAD: String,
    SECUENCIA: String,
    MATERIA: String,
    NOMBRE_MATERIA: String,
    ACADEMIA: String,
    NOMBRE_PROFESOR: String,
    LUNES: String,
    LUNES_SALON: String,
    MARTES: String,
    MARTES_SALON: String,
    MIERCOLES: String,
    MIÉRCOLES_SALON: String,
    JUEVES: String,
    JUEVES_SALON: String,
    VIERNES: String,
    VIERNES_SALON: String,
    CORREO_PROFESOR: String
});


const AlumnoSchema = new Schema({
  correo: { type: String, required: true, unique: true },
  carrera: String,
  plan_estud: String,
  materias_inscritas: [{ type: Schema.Types.ObjectId, ref: 'Materia' }],
  Mapa: []
});

const Alumno = mongoose.model('Alumno', AlumnoSchema);
const Materia = mongoose.model('Materia', MateriaSchema, 'AGOTA-20241');


module.exports = { Materia, Alumno };