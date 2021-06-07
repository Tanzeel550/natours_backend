import mongoose, { ConnectionOptions } from 'mongoose';

let CONNECTION_STRING;

if (process.env.NODE_ENV === 'production') {
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
  .connect(CONNECTION_STRING!!, params)
  .then(() => {
    console.log('App has connected to the database');
  })
  .catch((err: Error) => {
    console.error(err);
  });
