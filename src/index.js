/*
 * @Author: your name
 * @Date: 2021-07-09 01:54:25
 * @LastEditTime: 2021-12-12 01:29:08
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \lol-client\src\index.js
 */
/* eslint-disable */
require('./win32.js')
const path = require('path');
const electron = require("electron");
const app = electron.app;
const globalShortcut = electron.globalShortcut;
const BrowserWindow = electron.BrowserWindow;
const IpcMain = electron.ipcMain;
const LolApis = require('./libs/util.lol')
const lolApis = new LolApis()
var express = require('express')
const bodyParser = require("body-parser");
var Server = express()
const axios = require("axios").default;
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

Server.use(bodyParser.urlencoded({ extended: false }))
Server.use(bodyParser.json())

const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });
console.log(globalShortcut)

var window = null,
    rulesView;


Server.get('/api/init', async function(req, res) {
    let data = await lolApis.init()
    res.json(data)
})

// 获取游戏根目录
Server.get('/get/exe', async function(req, res) {
    try {
        let exePath = await lolApis.getExePath()
        res.json({ code: 0, data: exePath })
    } catch (err) {
        res.json({ code: 500, msg: err.message })
    }
})

// 获取 lockfile 文件内容
Server.get('/get/loca', function(req, res) {
    try {
        let _path = req.query.path
        console.log(_path)
        let data = lolApis.readLockfile(_path)
        res.json({ code: 0, data: data })
    } catch (err) {
        res.json({ code: 500, msg: err.message })
    }
})

// 获取自己的游戏信息
Server.get('/get/self', async function(req, res) {
    try {
        let userInfo = await lolApis.getUserInfo()
        res.json({ code: 0, data: userInfo })
    } catch (err) {
        res.json({ code: 500, msg: err.message })
    }
})

// 获取好友分组列表
Server.get('/get/users', async function(req, res) {
        try {
            let userlist = await lolApis.getFriends()
            let groupList = await lolApis.getUserGroups()
            res.json({
                code: 0,
                data: {
                    userlist,
                    groupList
                }
            })
        } catch (err) {
            res.json({ code: 500, msg: err.message })
        }
    })
    // 获取好友分组列表
Server.get('/get/room', async function(req, res) {
    try {
        let roomInfo = await lolApis.getRoomInfo()
        res.json({ code: 0, data: roomInfo })
    } catch (err) {
        res.json({ code: 500, msg: err.message })
    }
})

// 获取好友分组列表
Server.post('/room/del', async function(req, res) {
    try {
        let data = req.body
        let result = await lolApis.delRoomUser(data.id)
        res.json({ code: 0, data: result })
    } catch (err) {
        res.json({ code: 500, msg: err.message })
    }
})

Server.get('/start/game', async function(req, res) {
    try {
        let result = await lolApis.startGame()
        res.json({ code: 0, data: result })
    } catch (err) {
        res.json({ code: 500, msg: err.message })
    }
})

Server.get('/del/game', async function(req, res) {
    try {
        let result = await lolApis.deleteRoom()
        res.json({ code: 0, data: result })
    } catch (err) {
        res.json({ code: 500, msg: err.message })
    }
})

Server.get('/get/user/name', async function(req, res) {
    try {
        let name = req.query.name
        let info = await lolApis.summonerByName(name)
        res.json({ code: 0, data: info })
    } catch (err) {
        res.json({ code: 500, msg: err.message })
    }
})

Server.post('/api/create', async function(req, res) {
    try {
        let data = req.body
        data.type = parseInt(data.type)
        let room = await lolApis.createRoom(data.name, parseInt(data.type))
        res.json(room)
    } catch (err) {
        res.send(err.message)
    }
})

Server.get('/api/test/:id', async function(req, res) {
    try {
        let data = await lolApis.getMapInfo(req.params.id)
        res.json(data)
    } catch (err) {
        res.send(err.message)
    }
})

Server.post('/api/ids', async function(req, res) {
    let data = req.body
    try {
        await lolApis.inviteSummoners(data)
        res.send('OK')
    } catch (err) {
        res.send('ERROR')
    }
})

Server.get('/api/name', async function(req, res) {
    let name = req.query.name
    let info = await lolApis.nameTosummoners([name])
    info = info[0]
    if (info) {
        try {
            await lolApis.inviteSummoners([info.summonerId])
            res.send('OK')
        } catch (err) {
            res.send('ERROR')
        }
    }
})

// 获取分组列表
Server.get('/api/user/groups', async function(req, res) {
    let groups = await lolApis.getUserGroups()
    res.json(groups)
})

// 获取游戏状态
Server.get('/game/stats', async function(req, res) {
    let data = await lolApis.gameStats()
    res.json(data)
})


// 获取分组列表
Server.post('/api/send', async function(req, res) {
    try {
        let data = req.body
            // let demo = {type: 'post', url: '/lol-summoner/v2/summoners/names', data: {}}
        let result = await lolApis.api(data)
        res.json(result)
    } catch (err) {
        res.send(err.message)
    }
})

// 获取分组列表
Server.get('/read/doc', async function(req, res) {
    let result = await axios.get('https://gitee.com/mini-xiangmu/lolbody/raw/master/index.js')
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/javascript');
    res.end(result.data);
})

Server.get('/read/gitfile/:one', async function(req, res) {
    let _path = req.params.one
    await readGitFile(req, res, _path)
})
Server.get('/read/gitfile/:one/:two', async function(req, res) {
    let { one, two } = req.params
    let _path = one + '/' + two
    await readGitFile(req, res, _path)
})
Server.get('/read/gitfile/:one/:two/:three', async function(req, res) {
    let { one, two, three } = req.params
    let _path = one + '/' + two + '/' + three
    await readGitFile(req, res, _path)
})
Server.get('/read/gitfile/:one/:two/:three/:four', async function(req, res) {
    let { one, two, three, four } = req.params
    let _path = one + '/' + two + '/' + three + '/' + four
    await readGitFile(req, res, _path)
})
Server.get('/read/gitfile/:one/:two/:three/:four/:five', async function(req, res) {
    let { one, two, three, four, five } = req.params
    let _path = one + '/' + two + '/' + three + '/' + four + '/' + 'five'
    await readGitFile(req, res, _path)
})

async function readGitFile(req, res, _path) {
    let url = 'https://gitee.com/mini-xiangmu/lobby_view/raw/master/view/' + _path
    let extname = path.extname(_path)
    if (extname == '.html') res.setHeader('Content-Type', 'text/html');
    else if (extname == '.js') res.setHeader('Content-Type', 'application/javascript');
    else if (extname == '.css') res.setHeader('Content-Type', 'text/css');
    else return res.redirect(url)
    res.statusCode = 200;
    console.log(url)
    let result = await axios.get(url).catch(err => {
        console.log(err)
        res.end('ERROR');
    })
    if (extname == '.html') {
        result.data = result.data.replace('<span class="baseURLS"></span>', '<base href="http://127.0.0.1:49223/read/gitfile/>')
    }
    res.end(result.data);
}


console.log('4922349223492234922349223492234922349223 4922349223')
Server.listen(49223)

app.on("ready", function() {
    window = new BrowserWindow({
        width: 1280,
        height: 720,
        center: true,
        backgroundColor: "#000",
        frame: false,
        maximizable: false,
        fullscreen: false,
        webPreferences: {
            enableRemoteModule: true, // 启用渲染进程 Remote
            webSecurity: false, // 关闭安全模式
            nodeIntegration: true, // 启用 node
            nodeIntegrationInWorker: true, // 启用多进程 node
            webviewTag: true, // 启用 webview
        },
    });
    // window.loadFile();
    let aspectRatio = 1280 / 720
    window.on("will-resize", function(event, newBounds) {
        const win = event.sender;
        event.preventDefault(); // 拦截，使窗口先不变
        const currentSize = win.getSize();
        const widthChanged = currentSize[0] !== newBounds.width; // 判断是宽变了还是高变了，两者都变优先按宽适配
        if (widthChanged) {
            win.setContentSize(
                newBounds.width - 1,
                parseInt(newBounds.width / aspectRatio + 0.5) - 1
            );
        } else {
            win.setContentSize(
                parseInt(aspectRatio * newBounds.height + 0.5) - 1,
                newBounds.height - 1
            );
        }
    });



    window.hookWindowMessage(0x116, function() {
        window.setEnabled(false);
        setTimeout(() => {
            window.setEnabled(true);
        }, 100);
        return true;
    });

    if (electron.app.isPackaged) {
        window.loadURL("http://127.0.0.1:49223/read/gitfile/index.html");
    } else {
        window.loadURL("http://192.168.3.85:8080");
        window.webContents.openDevTools({ mode: "detach" });
    }

});

IpcMain.on('minchuangkou', function(event, arg) {
    window && window.minimize()
});

IpcMain.on('closeapp', function(event, arg) {
    app.exit()
});