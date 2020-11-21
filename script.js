const jsstore = require('jsstore')
const { ipcRenderer } = require('electron')

const connection = new jsstore.Connection(new Worker('node_modules\\jsstore\\dist\\jsstore.worker.min.js'))

const dbName = 'Todos'

function dbSchema() {
    let todoTable = {
        name: 'tasks',
        columns: {
            id: { autoIncrement: true },
            todo: { dataType: 'string' }
        }
    }
    let db = {
        name: dbName,
        tables: [todoTable]
    }
    return db
}

async function initJsStore() {
    let database = dbSchema()
    const isDbCreated = await connection.initDb(database)
    if (isDbCreated === true) {
        console.log('db created');
    }
    else {
        console.log('db opened');
        retrieveTodos()
    }
}

initJsStore()

function retrieveTodos() { 

    let allTodos = document.querySelector('#allTodos')

    connection.select({
        from: 'tasks'
    }).then((result) => {
        if (result.length > 0) {
            allTodos.textContent =''
            let ul = document.createElement('ul')

            result.map((task) => {

                let li = document.createElement('li')
                let span = document.createElement('span')
                let btn = document.createElement('button')

                span.textContent = task.todo
                btn.textContent = 'Done'
                li.setAttribute('id', task.id)

                li.appendChild(span)
                li.appendChild(btn)

                btn.addEventListener('click', () => {
                    let id = parseInt(li.getAttribute('id'))
                    removeTodoById(id, li)
                })
                ul.appendChild(li)
            })
            allTodos.appendChild(ul)
        }
        else {
            allTodos.innerHTML ='<p>No ToDos here</p>'
        }
    })
}

//remove todo by id
function removeTodoById(id, li) {
    connection.remove({
        from: 'tasks',
        where: {
            id: id
        }
    }).then(() => {
        li.remove()
        // alert('Todo removed')
    })
}

ipcRenderer.on('add', (e, data) => {
    addTodo(data)
})

function addTodo(data) {

    if (data.trim() !== '') {

        connection.insert({
            into: 'tasks',
            values: [{ todo: data.trim() }]
        }).then(() => {
            retrieveTodos()
        })
    }
}