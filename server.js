const mongoose = require('mongoose');
const app = require('./app');

// Creating the connection to mongoose

let CONNECTION_STRING;

if (process.env.NODE_ENV === 'PRODUCTION') {
    CONNECTION_STRING = process.env.DATABASE_CONNECTION_STRING.replace(
        '<password>',
        process.env.DATABASE_PASSWORD
    );
} else {
    CONNECTION_STRING = process.env.MONGODB_URL;
}

mongoose
    .connect(CONNECTION_STRING, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
    .then(() => {
        console.log('App has connected to the database');
    })
    .catch(err => {
        console.log(err);
    });

// Starting the server
const port = process.env.PORT || 8000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
