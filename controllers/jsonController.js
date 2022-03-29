const fs = require('fs');
const filePath = 'models/todo.json';

exports.getAllTodos = () => {
    const content = fs.readFileSync(filePath,{encoding: 'utf-8', flag: 'r'});
    const todos = JSON.parse(content);

    return todos;
};

exports.addTodo = (data) => {
    fs.writeFileSync(filePath, data);
};