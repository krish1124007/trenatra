import { app } from "./app.js";
import { connectDatabase } from "./db/index.js";
import dotenv from "dotenv";

dotenv.config({})

connectDatabase().then(()=>{
    app.listen(8000,()=>{
        console.log(`app is runing on the 8000 port`)
    }) 
}).catch(()=>{
    console.log('something while wrong')
})
