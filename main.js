const { ipcMain, BrowserWindow, app, Tray, Menu } = require('electron')

let win

function createWindow() {
    win = new BrowserWindow({
        title: 'ToDo',
        backgroundColor: '#313131',
        height:400,
        webPreferences: {
            nodeIntegration: true
        }
    })
    //keep the icon visible in the task bar
    let tray = null

    const appMenu = [
        {
            label: 'file',
            submenu: [{
                label: 'add task',
                click: () => {
                    let addWin = new BrowserWindow({
                        webPreferences: {
                            nodeIntegration: true
                        },
                        parent: win,
                        modal: true,
                        width: 300,
                        height: 150, 
                        resizable:false,
                        frame:false
                    })
                    addWin.loadURL(`${__dirname}/add.html`)
                    addWin.on('close', () => addWin = null)
                }
            }]
        }
    ]

    if (process.env.NODE_ENV !== 'production') {
        appMenu.push({
            label: 'dev Tools',
            role: 'toggleDevTools'
        }, {
            label: 'reload',
            role: 'reload'
        })
    }
    const menu = Menu.buildFromTemplate(appMenu)
    Menu.setApplicationMenu(menu)

    win.loadFile('index.html')

}
//context menu
const iconMenu = Menu.buildFromTemplate([
    { label: 'Close', type: 'normal', click: () => app.quit() }
])

app.whenReady().then(() => {
    createWindow()

    tray = new Tray(`${__dirname}/todo.png`)
    tray.setToolTip('This is the app icon')
    tray.setContextMenu(iconMenu)

    tray.on('click', () => {
        win.isVisible() ? win.hide() : win.show() 

        if (win.getChildWindows().length > 0) {
            win.getChildWindows()[0].isVisible() ? win.getChildWindows()[0].close() : null
        }

    })
    //close add to do window
    ipcMain.on('close-pop', ()=>{
        win.getChildWindows()[0].hide() //remove closing efffect.
        win.getChildWindows()[0].close()
    })

    ipcMain.on('sendTodo', (e, data) => {
        if (data.trim() !== '') {

            console.log(data);
            win.webContents.send('add', data)
        }
    })

})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})