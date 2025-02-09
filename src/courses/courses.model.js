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
    teacher: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
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