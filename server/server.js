const express = require('express');
const list = require('./list');

const app = express();
app.use('/list', list);
app.listen(8888, () => {
  console.log('the server is running!');
});
