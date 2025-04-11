import mongoose from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const user_schema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        uniqe:true
    },
    email:{
        type:String,
        required:true,
        uniqe:true
    },
    password:{
        type:String,
        required:true
    },
    phone_no:{
        type:String,
        required:false
    }
},{timestamps:true})


user_schema.pre("save" ,async function(next){
   if(!this.isModified("password")){next()}
     this.password = await bcrypt.hash(this.password , 10);
     next();
})

user_schema.methods.generateAccessToken = function(){
       return jwt.sign(
            {
                _id:this._id,
            },
           process.env.JWT_SECRATE
            ,
            {
                expiresIn:'30d'
            }
            
        )
}

user_schema.methods.comparePassword = async function(password){
    return await bcrypt.compare(this.password , password);
}


export const User = mongoose.model("User",user_schema);
