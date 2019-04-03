const express = require('express')
const list = require('./list')
const bodyParser = require('body-parser')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const model = require('./model')
const Installed = model.getModel('installed')
const Data = model.getModel('data')

app.use(bodyParser.json()) // 注意这里是使用.json方法
app.use('/list', list)

io.on('connect', (socket) => {
  socket.on('disconnect', () => {
    console.log('a user go out with id: ' + socket.id)
  })
  socket.on('postType', (data) => {
    Installed.findOne({ip: data.type.ip}, (err, doc) => {
      if (err) {
        socket.emit('data', {code: 1, msg: '后台错误！'})
      } else {
        socket.emit('data', {code: 0, msg: 'success', data: doc})
      }
    })
  })
  socket.on('saveOperation', (data) => {
    console.log(data)
    let res = {name: data.name, ip: data.ip, data: {range: data.range}}
    Data.findAndModify(res)
  })
})
server.listen(8888, () => {
  console.log('the server is running!')
})
