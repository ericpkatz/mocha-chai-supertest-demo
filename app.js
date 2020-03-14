const express = require('express');
const app = express();
const db = require('./db');

app.get('/api/users', (req, res, next)=> {
  db.readUsers()
    .then( users => res.send(users))
    .catch(next);

});

module.exports = app;
