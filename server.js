/* eslint-disable no-console */
import mongoose from 'mongoose';

import 'dotenv/config';
import app from './app.js';

const port = process.env.PORT;
const url = process.env.DB_URL.replace('<user>', process.env.DB_USER).replace(
    '<password>',
    process.env.DB_PASS
);

mongoose
    .connect(url)
    .then(() => console.log('Connected to DB'))

    .catch((error) => console.log(error));

app.listen(port, () => {
    console.log(`Server is running on port:${port}`);
});
