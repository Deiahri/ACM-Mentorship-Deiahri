import express from "express";
import { auth } from "express-oauth2-jwt-bearer";
import env from "./env/env";
import cors from "cors";

const app = express();
app.use(cors({
  origin: [env.CLIENT_ADDRESS],
}));

const jwtCheck = auth({  
  audience: env.AUTH0_AUDIENCE,
  issuerBaseURL: env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: env.AUTH0_TOKEN_SIGNING_ALG,
});


app.use(jwtCheck);

app.post("/verifyJWT", async (req, res) => {
  await jwtCheck(req, res, async (err) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const url = `${env.AUTH0_ISSUER_BASE_URL}/userinfo`;
    const token = req.auth?.token || '';
    console.log(url, token);
    const moreDetails = await (await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })).json();

    // At this point, req.auth is set
    res.json({ ...req.auth, ...moreDetails });
  });
});

const PORT = env.SERVER_PORT;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});