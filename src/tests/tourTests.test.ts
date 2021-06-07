import './../connectDB';
import request from 'supertest';
import app from '../app';
import DoneCallback = jest.DoneCallback;
import * as mongoose from "mongoose";

test('get all tours', (done: DoneCallback) => {
  request(app)
    .get('/api/v1/tours')
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, response) => {
      const serverResponse = JSON.parse(response.text);
      expect(serverResponse).toHaveLength(9);
      done();
    });
});

test('get one tour', (done: DoneCallback) => {
  const id = '5c88fa8cf4afda39709c2955';
  request(app)
    .get(`/api/v1/tours/${id}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, response) => {
      if (err) console.log(err);
      const serverResponse = JSON.parse(response.text);
      const data = serverResponse.data.data;
      expect(data.name).toMatch('The Sea Explorer');
      expect(data.locations).toHaveLength(4);
      expect(data.guides).toHaveLength(2);
      expect(data.guides[0].id).toBe('5c8a22c62f8fb814b56fa18b');
      expect(data.guides[1].id).toBe('5c8a1f4e2f8fb814b56fa185');
      expect(data.reviews).toHaveLength(6);
      done();
    });
});

test('get tour with invalid id', () => {
  if (process.env.NODE_ENV === 'PRODUCTION') {
  }
  request(app)
    .get(`/api/v1/tours/41224d776a326fb40f000001`)
    .expect(404)
    .expect('Content-Type', /json/)
    .end((err, response) => {
      if (err) console.log(err);
      const serverResponse = JSON.parse(response.text);
      expect(serverResponse.message).toMatch(
        'No such document found with this ID'
      );
    });
});

test('create tour with the given data', () => {});

afterAll(() => {
  mongoose.connection.close().then();
});
