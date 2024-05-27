import mongoose from 'mongoose';

function get_connection_str() {
  const { MDB_CONNECT_STRING, MDB_USERNAME, MDB_PW, MDB_NAME } = process.env;

  return MDB_CONNECT_STRING.replace('{MDB_USERNAME}', MDB_USERNAME)
    .replace('{MDB_PW}', MDB_PW)
    .replace('{MDB_NAME}', MDB_NAME);
}

export async function connect_db() {
  // TODO: temporary conditional! the kubernetes environment isn't ready for the api to attempt DB connections yet
  if (process.env.IS_LOCAL_ENV) {
    queueMicrotask(() => console.log('Attempting MongoDB connection...'));

    return await mongoose
      .connect(get_connection_str(), {
        serverSelectionTimeoutMS: 7500,
        heartbeatFrequencyMS: 10000,
      })
      .then(() => queueMicrotask(() => console.log('MongoDB connected!')));
  }
}

export function get_db_client() {
  return mongoose.connection.getClient();
}

export function get_db_connection_status() {
  return mongoose.connection.states[mongoose.connection.readyState];
}
