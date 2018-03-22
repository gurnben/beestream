const express = require('express');
const app = express();

app.use('/', (req, res) => {
  res.status(200).send('Hello World');
});
app.listen(3000);
console.log('Server running at http://localhost:3000/');

module.exports = app;
