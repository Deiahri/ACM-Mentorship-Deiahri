import express from 'express';
import { Express } from 'express';
import dotenv from 'dotenv';
import { auth } from 'express-oauth2-jwt-bearer';
import cors from "cors";
dotenv.config();



let ExpressServer: Express;
export function isExpressServerOnline() {
    return ExpressServer ? true : false;
}

/**
 * Creates express server with promise.
 * If successful, returns true. Otherwise, returns error.
 * 
 * Promise-based so tests can wait for server to go online before proceeding.
 * @returns 
 */
export function StartExpressServer() {
    return new Promise((res, rej) => {
        try {
            if (ExpressServer) {
                return;
            }
            const app = express();
            const PORT = process.env.EXPRESS_SERVER_PORT;
        
            app.use(cors({
                origin: ["*"],
                methods: ["GET", "POST"],
                allowedHeaders: ["Authorization", "Content-Type"]
            }));

            app.use(express.json());
        
            const jwtCheck = auth({
                audience: 'uhdacm',
                issuerBaseURL: 'https://dev-10v2hjt70uhuwqnr.us.auth0.com/',
                tokenSigningAlg: 'RS256'
            });
        
        
            app.get('/', (_, res) => {
                res.send({ 'all': 'good' });
            });
        
            app.use(jwtCheck);
        
            app.post('/verifyJWT', (req, res) => {
                // console.log('verifyingJWT');
                res.send( req.auth );
            });
            app.listen(PORT, () => {
                console.log(`server is online http://localhost:${PORT}`);
                res(true);
            });
            ExpressServer = app;
        } catch (err) {
            rej(err);
        }
    });
}
