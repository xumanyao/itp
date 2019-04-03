const express = require('express')
const model = require('./model')
const List = model.getModel('list')
const Type = model.getModel('type')
const Installed = model.getModel('installed')
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
      return res.json({code: 1, msg: '查询设备列表失败，请重试！'})
    }
    return res.json({code: 0, data: doc, msg: 'success'})
  })
})

Router.get('/getType', (req, res) => {
  // const userModel = new Type(
  //   {name: '波形发生器', function: ['输出通道选择', '波形选择', '参数设置', '']});
  // userModel.save((err, doc) => {
  //   if (err) {
  //     console.log(err);
  //   }
  // });
  Type.find({}, (err, doc) => {
    if (err) {
      return res.json({code: 1, msg: '查询仪器类型列表失败,请重试！'})
    }
    return res.json({code: 0, data: doc, msg: 'success'})
  })
})
// 安装成功返回状态为0，已经安装过，返回状态为1，安装失败，返回状态为2
Router.post('/installed', (req, res) => {
  let data = {name: req.body.data.name, ip: req.body.data.ip}
  Installed.findOne({ip: data.ip}, (err, doc) => {
    if (err) {
      return res.json({code: 2, msg: '设备安装失败，请重试！'})
    }
    if (doc) {
      return res.json({code: 1, msg: '对应设备已安装！'})
    } else {
      const model = new Installed(data)
      model.save((err, doc) => {
        if (err) {
          return res.json({code: 1, msg: '设备安装失败，请稍后再试！'})
        }
        return res.json({code: 0, msg: 'success', ip: doc.ip})
      })
    }
  })
})

Router.post('/delete', (req, res) => {
  let data = {name: req.body.data.name, ip: req.body.data.ip}
  Installed.findOneAndDelete({ip: data.ip}, (err, doc) => {
    if (err) {
      return res.json({code: 1, msg: '卸载失败，请重试！'})
    }
    return res.json({code: 0, msg: 'success', ip: doc.ip})
  })
})

Router.get('/getInstalled', (req, res) => {
  Installed.find({}, (err, doc) => {
    if (err) {
      res.json({code: 1, msg: '获取列表失败，请重试！'})
    }
    let data = []
    doc.map(item => {
      data.push(item.ip)
    })
    return res.json({code: 0, data, msg: 'success'})
  })
})

Router.post('/operating', (req, res) => {
  let data = {name: req.body.data.name, ip: req.body.data.ip}
  let resData = {}
  Type.findOne({name: data.name}, (err, doc) => {
    if (err) {
      return res.json({code: 1, msg: '获取编辑信息失败，请重试！'})
    } else {
      resData.allFunctions = doc.function
      Installed.findOne(data, (err, doc) => {
        if (err) {
          return res.json({code: 1, msg: '获取编辑信息失败，请重试！'})
        } else {
          resData.usableFunctions = doc.function || []
          return res.json({code: 0, data: resData, msg: 'success'})
        }
      })
    }
  })
})

Router.post('/saveOperating', (req, res) => {
  let data = {name: req.body.data.name, ip: req.body.data.ip}
  Installed.update(data, req.body.data, (err, doc) => {
    if (err) {
      res.json({code: 1, msg: '保存数据失败，请重试！'})
    }
    res.json({code: 0, msg: 'success', data: doc})
  })
})

Router.post('/useMachine', (req, res) => {
  let data = {name: req.body.data.name, ip: req.body.data.ip}
  Installed.findOne(data, (err, doc) => {
    if (err) {
      return res.json({code: 1, msg: '获取设备信息失败，请稍后再试！'})
    } else {
      if (doc) {
        return res.json({code: 0, msg: 'success', data: doc})
      } else {
        return res.json({code: 1, msg: '设备未安装！'})
      }
    }
  })
})
module.exports = Router
