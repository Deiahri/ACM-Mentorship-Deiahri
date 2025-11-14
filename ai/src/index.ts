import express from "express";
import env from "./env/env";
import cors from "cors";
import { ExtractUserDataInRequest } from "./auth0/tools";
import { GenerateUserObjError, generateUserObjHandler } from "./ai/handlers";

const app = express();
app.use(
  cors({
    origin: [env.CLIENT_ADDRESS],
  })
);
app.use(express.json());

app.post("/generateResumeProfile", async (req, res) => {
  try {
    const { combine, text, userID } = req.body;
    const data = await ExtractUserDataInRequest(req, res);
    
    const generatedUserObj = await generateUserObjHandler({
      combine, text, userID, OAuthSubID: data?.payload.sub
    });
  
    res.json({
      success: !!generatedUserObj,
      data: generatedUserObj,
    });
    console.log('Generated AI resume profile for user:', generatedUserObj);
  } catch (error) {
    if (error instanceof GenerateUserObjError) {
      res.status(400).json({
        error: error.message,
        timeoutEnd: error.timeoutEnd
      });
    } else {
      res.status(500).json({
        error: "Internal server error"
      });
    }
  }
});

const PORT = env.SERVER_PORT;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
