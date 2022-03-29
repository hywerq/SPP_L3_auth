const controller = require('../controllers/jsonController');
const Router = require('express');
const multer = require('multer');
const roleMiddleware = require("../middleware/roleMiddleware");
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

router.get('/get', controller.getAllTodos);

router.post('/add', roleMiddleware('ADMIN'), upload.single('file'), controller.addNewTodo);

router.put('/update', controller.changeTodoStatus);

module.exports = router