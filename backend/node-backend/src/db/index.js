import mongoose from "mongoose";



async function connectDatabase()
{
    try {
        const connectdb = await mongoose.connect('mongodb://localhost:27017/');
        console.log('Database is connect successfully');
    } catch (error) {
        console.log(error)
        
    }
}

export {connectDatabase}