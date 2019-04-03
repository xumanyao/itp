const mongoose = require('mongoose')

const DB_URL = 'mongodb://127.0.0.1:27017/itp_db'

mongoose.connect(DB_URL)

const models = {
  list: {
    name: {type: String, require: true},
    ip: {type: String, require: true}
  },
  type: {
    name: {type: String, require: true},
    function: {type: Array, require: true}
  },
  installed: {
    name: {type: String, require: true},
    ip: {type: String, require: true},
    function: {type: Array, require: true}
  },
  data: {
    name: {type: String, require: true},
    ip: {type: String, require: true},
    data: {type: Object, require: true}
  }
}
for (let m in models) {
  mongoose.model(m, new mongoose.Schema(models[m]))
}
module.exports = {
  getModel: function (name) {
    return mongoose.model(name)
  }
}
