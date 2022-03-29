const TodoController = require('../controllers/jsonController');
const Router = require('express');
const path = require('path');
const multer = require('multer');
const router = Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, '-') + '_' + file.originalname)
    }
})
const upload = multer({storage: storage});

router.get('/get', (req, res) => {
    const todos = TodoController.getAllTodos();
    res.send(todos);
});

router.post('/add', upload.single('file'), async (req,res) => {
    if(!req.body) {
        return res.sendStatus(400);
    }

    let fileFlag = false;
    let file = '';

    if (req.file !== undefined) {
        fileFlag = true;
        file = path.join('./uploads/' + req.file.filename);
    }

    const todoTitle = req.body.title;
    const todoDate = req.body.date;

    const todos = TodoController.getAllTodos();
    const id = Math.max.apply(Math, todos.todo.map(function(o){ return o.id; }))

    let todo = {
        id: (id + 1).toString(),
        title: todoTitle,
        date: todoDate,
        hasFile: fileFlag.toString(),
        file: file,
        completed: 'false'
    };

    todos.todo.push(todo);

    const data = JSON.stringify(todos);
    TodoController.addTodo(data);

    res.send(todo);
});

router.put('/update', (req, res) => {
    if(!req.body) {
        return res.sendStatus(400);
    }

    const id = req.body.id;
    const todos = TodoController.getAllTodos();

    todos.todo.forEach(todo => {
        if(todo.id === id) {
            todo.completed = todo.completed === 'false' ? 'true' : 'false';
        }
    });

    const data = JSON.stringify(todos);
    TodoController.addTodo(data);

    res.send(todos);
});

module.exports = router