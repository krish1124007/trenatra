import express from "express"
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cors from 'cors';
import { user_route } from "./routes/user.routes.js";
import {machine_router} from "./routes/machine.routes.js"
const app = express();


app.use(morgan('dev')); // Logging middleware (should be first to log all requests)  

app.use(cors({  
    origin: '*',  
    credentials: true  
})); // CORS should come before parsing to handle preflight requests  

app.use(express.json({ limit: '200mb' }));  
app.use(bodyParser.urlencoded({ extended: true, limit: '200mb' }));  
app.use(bodyParser.json({ limit: '200mb' }));  

app.get('/',(req,res)=>{
    console.log("working")
    res.send("working")
})
app.post('/alert',(req,res)=>{
    console.log("api hit here");
})

app.use("/user" , user_route);
app.use("/machine", machine_router);

export {app}