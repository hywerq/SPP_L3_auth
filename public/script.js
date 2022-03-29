function customHttp() {
    return {
        async postAuth(url, cb) {
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({
                    username: form.elements['username'].value,
                    password: form.elements['password'].value
                })
            });

            const result = await response.json();

            if (response.ok === true) {
                cb(null, result)
            }
            else {
                cb(result.message)
            }
        },
        async get(cb) {
            const response = await fetch('/todo/get', {
                method: 'GET',
                headers: {'Accept': 'application/json'}
            });

            if (response.ok === true) {
                const todos = await response.json();
                cb(null, todos.todo);
            }
        },
        async post(cb) {
            const data = new FormData();
            data.append('title', todoTitleInput.value);
            data.append('date', makeDate(todoDateInput.value));
            data.append('file', todoFileInput.files[0]);

            const response = await fetch('/todo/add', {
                method: 'POST',
                body: data
            });

            if (response.ok === true) {
                const todos = await response.json();
                cb(null, todos.todo);
            }
        },
        async put(id, cb) {
            const response = await fetch('/todo/update', {
                method: 'PUT',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: id
                })
            });
            if (response.ok === true) {
                const todos = await response.json();
                cb(null, todos.todo);
            }
        }
    };
}

const http = customHttp();

let form = document.forms['entrance_form'];
let todoTitleInput = form.elements['title'];
let todoFileInput = form.elements['file'];
let todoDateInput = form.elements['date'];

const entranceService = (function() {
    return {
        async login(cb) {
            await http.postAuth('/auth/authorization', cb);
        },
        async register(cb) {
            await http.postAuth('/auth/registration', cb);
        }
    };
})();
const todoService = (function() {
    return {
        async allTodos(cb) {
            await http.get(cb);
        },
        async insertTodo(cb) {
            await http.post(cb);
        },
        async editTodo(id, cb) {
            await http.put(id, cb);
        }
    };
})();

function onGetResponse(err, res) {
    removePreloader();

    if (err) {
        showAlert(err, 'error-msg');
        return;
    }

    if(res.message)
    {
        showAlert(res.message);
    }

    if(res.token) {
        renderNavigation();
        loadTodos();
        return;
    }

    if (Array.isArray(res)) {
        if(!res.length) {
            showAlert('There are no todos yet!');
        }
        else {
            renderTodos(res);
        }
    }
}

function loadTodos() {
    showPreloader();

    todoService.allTodos(onGetResponse).catch(error => showAlert(error));
}

function addTodo() {
    showPreloader();

    todoService.insertTodo(onGetResponse).catch(error => showAlert(error));
}

function changeTodoStatus(id) {
    showPreloader();

    todoService.editTodo(id, onGetResponse).catch(error => showAlert(error));
}

function makeDate(date) {
    return new Date(date).toLocaleString('en-US', {
        weekday: 'short',
        day: 'numeric',
        year: 'numeric',
        month: 'long',
        hour: 'numeric',
        minute: 'numeric'
    }).toString()
}

function renderNavigation() {
    const entrance = document.querySelector("main");

    if (entrance) {
        entrance.remove();
    }

    const body = document.body;

    let fragment =
        `<nav class="teal">
            <div class="nav-wrapper">
                <a class="brand-logo">TODOS</a>
                <ul id="nav-mobile" class="right hide-on-med-and-down">
                    <li class="active"><a id="output">All</a></li>
                    <li><a id="input">New</a></li> 
                    <li><a href="/" id="log_out">Log out</a></li>                  
                </ul>
            </div>
        </nav>`;

    body.insertAdjacentHTML('afterbegin', fragment);
}

function renderInputForm() {
    const inputForm = document.querySelector(".newTodo");
    if (inputForm) {
        return;
    }

    const todosContainer = document.querySelector(".container ul");
    if (todosContainer.children.length) {
        clearContainer(todosContainer);
    }

    document.querySelector(".teal").insertAdjacentHTML(
        "afterend",
        `
                <form class="newTodo" enctype="multipart/form-data" name="newTodo">
        <div class="input-field">
            <input type="text" name="title" placeholder="Todo title" required>
        </div>
        <div class="input-field">
            <input type="datetime-local" name="date" placeholder="Todo date" required>
        </div>

        <label>
            <div class="example-1">
                <div class="form-group">
                    <label class="label">
                        <i class="material-icons">attach_file</i>
                        <span class="title" id="file">Load file</span>
                        <input name="file" type="file">
                    </label>
                </div>
            </div>

            <button class="btn">Add</button>
        </label>
    </form>`
    );

    initForm();
}

function renderTodos(todos) {
    const todosContainer = document.querySelector('.container ul');

    if (todosContainer.children.length) {
        clearContainer(todosContainer);
    }

    let fragment = ``;
    todos.forEach(todo => {
        const el = todosTemplate(todo);
        fragment += el;
    });

    todosContainer.insertAdjacentHTML('afterbegin', fragment);
}

function todosTemplate({ id, title, completed, date, hasFile, file }) {
    let html = '';

    if (completed === 'true') {
        html += `
            <li class="todo">
                <form method="post">
                    <label>
                        <div class="status">
                            <input type="checkbox" checked name="completed">
                            <span class="completed">${date}</span>
                        </div>
                        <div class="taskTitle">
                            <span class="completed">${title}</span>
                        </div>`;
    }
    else {
        html += `
            <li class="todo">
                <form name="todoForm">
                    <label>
                        <div class="status">
                            <input type="checkbox" name="completed">
                            <span>${date}</span>
                        </div>
                        <div class="taskTitle">
                            <span>${title}</span>
                        </div>`;
    }

    if(hasFile === 'true') {
        html += `
                            <div class="taskFile">
                                <form method="get" action="${file}">
                                    <a href="${file}" download="${file}">Download</a>
                                </form>
                            </div>

                        <input type="hidden" value="${id}" name="id">
                        <div class="save">
                            <button class="btn btn-small" id="id_save_state_btn" type="submit">Save</button>
                        </div>
                    </label>
                </form>
            </li>`;
    }
    else {
        html += `
                        <div class="taskFile"></div>
                        
                        <input type="hidden" value="${id}" name="id">
                        <div class="save">
                            <button class="btn btn-small" id="id_save_state_btn" type="submit">Save</button>
                        </div>
                    </label>
                </form>
            </li>`;
    }

    return html;
}

function clearContainer(container) {
    let child = container.lastElementChild;
    while (child) {
        container.removeChild(child);
        child = container.lastElementChild;
    }
}

function showAlert(msg, type = 'success') {
    M.toast({ html: msg, classes: type });
}

function showPreloader() {
    document.querySelector('.teal').insertAdjacentHTML(
        'afterend',
        `
        <div class="progress">
            <div class="indeterminate"></div>
        </div>`
    );
}

function removePreloader() {
    const preloader = document.querySelector('.progress');

    if (preloader) {
        preloader.remove();
    }
}

function initForm() {
    form = document.forms['newTodo'];
    todoTitleInput = form.elements['title'];
    todoFileInput = form.elements['file'];
    todoDateInput = form.elements['date'];

    form.addEventListener('submit', async e => {
        e.preventDefault();
        addTodo();
    });

    todoFileInput.addEventListener("change", function () {
        document.getElementById('file').innerHTML = todoFileInput.files[0].name;
    });
}

document.body.addEventListener( 'click', e => {
    switch (e.target.id) {
        case 'id_save_state_btn':
            e.preventDefault();
            const id = e.path[3].id.defaultValue;
            changeTodoStatus(id);

            break;
        case 'id_login':
            e.preventDefault();
            entranceService.login(onGetResponse).catch(error => showAlert(error));

            break;
        case 'id_register':
            e.preventDefault();
            entranceService.register(onGetResponse).catch(error => showAlert(error));

            break;
        case 'input':
            e.preventDefault();
            renderInputForm();

            break;
        case 'output':
            e.preventDefault();

            const inputForm = document.querySelector(".newTodo");
            if (inputForm) {
                inputForm.remove();
            }
            loadTodos();

            break;
        case 'log_out':
            if (!confirm("Do you want to log out?")) {
                e.preventDefault();
            }
            break;
    }
});