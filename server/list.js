const express = require('express')
const model = require('./model')
const List = model.getModel('list')
const Router = express.Router()

Router.get('/getList', (req, res) => {
  // const userModel = new List({name: '电流表', ip: '192.169.1.139:121'})
  // userModel.save((err, doc) => {
  //   if (err) {
  //     console.log(err)
  //   }
  // })
  List.find({}, (err, doc) => {
    if (err) {
      return res.send('查询设别列表失败！')
    }
    return res.json(doc)
  })
})

module.exports = Router
