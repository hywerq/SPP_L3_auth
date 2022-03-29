const Todo = require('../models/Todo')

exports.getAllTodos = () => {
    return Todo.find({}).lean();
};

exports.createTodo = (todoData) => {
    const todo = new Todo(todoData);

    return todo.save();
};