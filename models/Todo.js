const {Schema, model} = require('mongoose');

const Todo = new Schema({
    title: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    date: {
        type: String,
        required: false
    },
    hasFile: {
        type: Boolean,
        default: false
    },
    file: {
        type: String,
        default: false
    }
})

module.exports = model('Todo', Todo);