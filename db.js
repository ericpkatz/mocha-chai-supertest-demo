const { Client } = require('pg');

const client = new Client(process.env.DATABASE_URL || 'postgres://localhost/acme_db');
client.connect();

const sync = async()=> {
  const SQL = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    DROP TABLE IF EXISTS users;
    CREATE TABLE users(
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      "firstName" VARCHAR(100),
      "lastName" VARCHAR(100),
      username VARCHAR(100),
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP
    );
  `;
  await client.query(SQL);
  let [moe, lucy, ethyl, cody] = await Promise.all([
    createUser({ username: 'mgreen', firstName:'moe', lastName: 'green' }),
    createUser({ username: 'l_blue', firstName:'lucy', lastName: 'blue' }),
    createUser({ username: 'ered'}),
    createUser({ username: 'c_orange', firstName:'cody', lastName: 'orange' }),
  ]);
};

const createUser = async({ firstName, lastName, username })=> {
  const SQL = 'insert into users("firstName", "lastName", username) values($1, $2, $3) returning *';
  return (await client.query(SQL,[ firstName, lastName, username ])).rows[0];
};

const updateUser = async(user)=> {
  const map = ['firstName', 'lastName','username'].reduce((acc, key, idx)=> {
    if(user[key] !== undefined){
      acc[key] = user[key];
    }
    return acc;
  }, {});

  let SQL = Object.keys(map).reduce((acc, key, idx)=> {
    acc = `${acc}${ idx ? ',':'' }"${key}"=$${idx + 1}`;
    return acc;
  }, '');
  SQL = `UPDATE users SET ${SQL} WHERE id= $${Object.keys(map).length + 1} returning *;`;
  return (await client.query(SQL,[ ...Object.values(map), user.id ])).rows[0];
};

const readUsers = async()=> {
  return (await client.query('SELECT * FROM users')).rows;
};

const readUser = async(username)=> {
  return (await client.query('SELECT * FROM users WHERE username=$1', [username])).rows[0];
};

module.exports = {
  readUsers,
  readUser,
  updateUser,
  sync
};
