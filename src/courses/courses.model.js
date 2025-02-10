import { Schema, model } from "mongoose";

const coursesSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    // Definir el atributo teacher como una referencia a usuario
    teacher: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    // Definir el atributo students como un array que hace referencia al rol de estudiante
    students: [{
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }],
    status:{
        type: Boolean,
        default: true
    },
}, {
    timestamps: true,
    versionKey: false
});

export default model('Courses', coursesSchema);