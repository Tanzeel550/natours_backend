import { ConnectionOptions } from 'mongoose';

const mongoose = require('mongoose');
const app = require('./app');

// Creating the connection to mongoose

let CONNECTION_STRING;

if (process.env.NODE_ENV === 'PRODUCTION') {
  CONNECTION_STRING = process.env.DATABASE_CONNECTION_STRING!!.replace(
    '<password>',
    process.env.DATABASE_PASSWORD!!
  );
} else {
  CONNECTION_STRING = process.env.MONGODB_URL;
}

const params: ConnectionOptions = {
  // @ts-ignore
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
};

mongoose
  .connect(CONNECTION_STRING, params)
  .then(() => {
    console.log('App has connected to the database');
  })
  .catch((err: Error) => {
    console.error(err);
  });

// Starting the server
const port = process.env.PORT || 8000;

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

process.on('unhandledRejection', (err: {} | null | undefined) => {
  console.log('UNHANDLED REJECTION 👺 SHUTTING DOWN GRACEFULLY');
  // @ts-ignore
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('😓 SIGTERM received. We are closing now');
  server.close(() => {
    console.log('👺 The server has closed');
  });
});
