import mongoose from "mongoose";

const otp_schema = new mongoose.Schema({
    otp:{
        type:[String, Number],
        required:true
    },
    email:{
        type:String
    },
    for:{
        type:String,
        enum :["login"],
        required:true
    }
},{timestamps:true})

export const OTP = mongoose.model("OTP" , otp_schema)