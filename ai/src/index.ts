import express from "express";
import env from "./env/env";
import cors from "cors";
import { ExtractUserDataInRequest } from "./auth0/tools";
import { DBGetUserById } from "./db";

const app = express();
app.use(cors({
  origin: [env.CLIENT_ADDRESS],
}));
app.use(express.json());

app.post("/useResumeGenerateUserObj", async (req, res) => {
  const text = req.body.data; // resume text
  if (!text) {
    return res.status(400).json({ error: "text is required" });
  }

  let userID: string | undefined = req.body.userID;
  if (!userID) {
    return res.status(400).json({ error: "userID is required" });
  }

  const data = await ExtractUserDataInRequest(req, res);

  if (!data) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userData = await DBGetUserById(userID);
  if (!userData) {
    return res.status(404).json({ error: "User not found" });
  }

  if (userData.OAuthSubID !== data.payload.sub) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  res.json({ message: "Success", userData });
});

const PORT = env.SERVER_PORT;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});