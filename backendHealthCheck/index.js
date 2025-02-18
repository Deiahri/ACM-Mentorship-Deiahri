import dotenv from 'dotenv';
import express from "express";

dotenv.config();
const app = express();
app.get("/", (_, res) => {
  res.send({ all: "good" });
});
app.listen(4000 ,() => {
  console.log('Health check online on port 4000');
})

if (!process.env.BACKEND_URL) {
  throw new Error('No backend URL provided');
}


async function RunHealthCheck() {
  if (!process.env.BACKEND_URL) {
    return;
  }
  try {
    console.log('Checking', process.env.BACKEND_URL);
    const response = await fetch(process.env.BACKEND_URL); // Use await
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json(); // Use await again
    console.log('Data from server:', data);
    return data; // Return the data if needed

  } catch (error) {
    console.error('Error fetching data:', error);
    // Handle the error (e.g., display an error message)
    // Important: Re-throw the error if you want the calling function to handle it as well
    // throw error; // Optional: Re-throwing the error
    return null; // or throw error; // Return null or throw error as necessary
  }
}

RunHealthCheck();
setTimeout(RunHealthCheck, 10*60*1000);


