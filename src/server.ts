import app from './app';
import './connectDB';

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
