import dotenv from 'dotenv';

// setups .env variable access
dotenv.config();

if (process.env.TESTING != "true") {
    throw new Error('Expected testing mode to be true, but process.env.TESTING='+process.env.TESTING);
}
