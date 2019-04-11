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
let timer
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
    let res = {name: data.name, ip: data.ip}
    Data.findOneAndUpdate(res, data, {upsert: true}, (err, doc) => {
      if (err) {
        console.log(err)
        socket.emit('saveOperation', {code: 1, msg: '配置保存失败！'})
      } else {
        socket.emit('saveOperation', {code: 0, msg: 'success'})
      }
    })
  })
  socket.on('getOperation', (data) => {
    let filter = {name: data.name, ip: data.ip}
    Data.findOne(filter, (err, doc) => {
      if (err) {
        socket.emit('getOperation', {code: 1, msg: '查询配置失败'})
      } else {
        if (!doc) {
          socket.emit('getOperation', {code: 0, msg: '未配置', data: null})
        } else {
          socket.emit('getOperation', {code: 0, msg: 'success', data: doc.data})
        }
      }
    })
  })
  socket.on('startDataPush', (data) => {
    console.log(data)
    let res = parseFloat((Math.random() * data.range).toFixed(2))
    socket.emit('startDataPush', {code: 0, msg: 'success', data: res})
  })
  socket.on('getOnOff', () => {
    let res = !!((Math.random().toFixed(1)) * 10 % 2)
    console.log(res)
    socket.emit('getOnOff', {code: 0, msg: 'success', data: res})
  })
  socket.on('startPushSignalData', (data) => {
    let x = 0
    let l = data.frequency.toString().length
    let y = 0
    let first = [{x: 0, y: 0}]
    for (let i = 0; i < 19; i++) {
      x = parseFloat((x + Math.pow(0.1, l)).toFixed(l))
      y = parseFloat((data.max / 2 * Math.sin(data.frequency * 2 * Math.PI * x)).toFixed(2))
      if (data.signal === '方波') {
        y = y > 0 ? data.max / 2 : -data.max / 2
      }
      first.push({x, y})
    }
    socket.emit('startSignal', {data: first})
    timer = setInterval(() => {
      x = parseFloat((x + Math.pow(0.1, l)).toFixed(l))
      y = parseFloat((data.max / 2 * Math.sin(data.frequency * 2 * Math.PI * x)).toFixed(2))
      if (data.signal === '方波') {
        y = y > 0 ? data.max / 2 : -data.max / 2
      }
      socket.emit('signalData', {x, y})
    }, 300)
  })
  socket.on('stopPushSignalData', () => {
    console.log('stop!')
    clearInterval(timer)
    timer = null
  })
})
server.listen(8888, () => {
  console.log('the server is running!')
})
