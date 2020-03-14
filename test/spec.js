const chai = require('chai');
const { expect } = chai;
const app = require('supertest')(require('../app'));

const db = require('../db');
const { updateUser, readUser, readUsers } = db;
describe('my application', ()=> {
  beforeEach(()=> db.sync());
  describe('routes', ()=> {

    describe('GET /api/users', ()=> {
      it('it returns 4 user', async()=> {
        const response = await app.get('/api/users');
        expect(response.status).to.equal(200);
        expect(response.body.length).to.equal(4);
      });
    });
    describe('POST /api/users', ()=> {
      describe('with valid data', ()=> {
        it('it returns the user', async()=> {
          const response = await app.post('/api/users')
          .send(
            {
              firstName: 'Nathan',
              lastName: 'Teal',
              username: 'n_teal'
            }
          );
          expect(response.status).to.equal(201);
          expect(response.body.username).to.equal('n_teal');
        });
      });
      describe('with invalid data', ()=> {
        describe('not unique username', ()=> {
          it('it returns an error', async()=> {
            const response = await app.post('/api/users')
            .send(
              {
                firstName: 'Nathan',
                lastName: 'Teal',
                username: 'l_blue'
              }
            );
            expect(response.status).to.equal(500);
            expect(response.body.message).to.contain('violates unique constraint');
          });
        });
        describe('no username', ()=> {
          it('it returns an error', async()=> {
            const response = await app.post('/api/users')
            .send(
              {
                firstName: 'Nathan',
                lastName: 'Teal',
                username: ''
              }
            );
            expect(response.status).to.equal(500);
            expect(response.body.message).to.contain('violates check constraint');
          });
        });
      });
    });

  });

  describe('data layer', ()=> {
    it('there are 4 seeded users', async()=> {
      const users = await db.readUsers();
      expect(users.length).to.equal(4);
    });
    it('a user can be updated', async()=> {
      let lucy = await readUser('l_blue');
      lucy = await updateUser({ id: lucy.id, username: 'lucy_username'});
      expect(lucy.username).to.equal('lucy_username');
    });
  });
});
