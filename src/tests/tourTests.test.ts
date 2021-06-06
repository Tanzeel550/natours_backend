import axios, { AxiosResponse } from 'axios';
import request from 'supertest';
import app from '../app';
import base_url from './base_url';
import farigh_tours from './farigh_tours';

test('get all tours', (done: any) => {
  const url = `${base_url}/api/v1/tours`;
  axios.get(url).then(res => {
    expect(res.status).toBe(200);
    expect(res.data.data.data).toMatchObject(farigh_tours);
    done();
  });
});

test('get one tour', (done: any) => {
  const url = `${base_url}/api/v1/tours/${farigh_tours[0].id}`;
  axios.get(url).then(res => {
    expect(res.status).toBe(200);
    expect(res.data.data.data).toMatchObject(farigh_tours[0]);
    done();
  });
});

test('get tour with invalid id', (done: any) => {
  if (process.env.NODE_ENV === 'PRODUCTION') {
  }
  const url = `${base_url}/api/v1/tours/23456789}`;
  axios.get(url).then((res: AxiosResponse) => {
    expect(res.status).toBe(404);
  });
});
