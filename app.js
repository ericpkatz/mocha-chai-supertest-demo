const express = require('express');
const app = express();
const db = require('./db');

app.use(express.json());

app.get('/api/users', (req, res, next)=> {
  db.readUsers()
    .then( users => res.send(users))
    .catch(next);

});

app.post('/api/users', (req, res, next)=> {
  db.createUser(req.body)
    .then( user => res.status(201).send(user))
    .catch(next);
});

app.delete('/api/users/:id', async(req, res, next)=> {
  db.destroyUser(req.params.id)
    .then(()=> res.sendStatus(204))
    .catch(next);
});

app.use((err, req, res, next)=> {
  res.status(500).send({ message: err.message });
});

module.exports = app;
