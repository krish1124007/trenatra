import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { generateOTP } from "../utils/generateOtp.js";
import { sendMail } from "../utils/sendMail.js"
import {OTP} from "../models/otp.models.js"

const registerUser = asyncHandler(async (req, res) => {
    console.log("data comehere")
    const { username, password, email } = req.body;
    console.log(username , password , email)
    if (!username || !password || !email ) {
        return res.status(400)
            .json(
                new ApiResponse(400, { success: false, data: "Please Fill All the feilds" }, "Please Fill All The feilds")
            )
    }

    const isUserExist = await User.findOne({ username });
    if (isUserExist) {
        return res.status(400)
            .json(
                new ApiResponse(400, { success: false, data: "user is already exist" }, "user is already exist")
            )
    }

    const user = await User.create({ username, email, password });
    if (!user) {
        return res.status(500)
            .json(
                new ApiResponse(500, { success: false, data: "something wrong while saving details" }, "something wrong while saving details")
            )
    }

    return res.status(200)
        .json(
            new ApiResponse(200, { success: true, data: "Your Account Create successfully" }, "Your Account Create suuccessfully")
        )
})

const loginUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400)
            .json(
                new ApiResponse(400, { success: false, data: "Please fillup the all feilds" }, "please fillup the all the feilds")
            )
    }

    const isUserExist = await User.findOne({ username });
    if (!isUserExist) {
        return res.status(400)
            .json(
                new ApiResponse(400, { success: false, data: "user is not exist" }, "user is not exist")
            )
    }
    
    const otp = generateOTP();
    console.log(isUserExist.email)
    const mailsender  = await sendMail(isUserExist.email , 'verification otp' , `your verification otp is ${otp}`);
    
    console.log("mail sender is" ,  mailsender)

    const save_otp = await OTP.create({otp,email:isUserExist.email,for:'login'})
    
    if(!save_otp)
    {
        return res.status(500)
        .json(
            new ApiResponse(500,{success:false , data:"something went wrong while saving otp"},"something went wrong while saving otp")
        )
    }


    return res.status(200)
    .json(
        new ApiResponse(200,{success:true , data:"otp is send your register email"},"otp is send on your register email")
    )


})

const verifyOtp = asyncHandler(async(req,res)=>{
    const {otp , email} = req.body;
    if(!otp || !email)
    {
        return res.status(400)
        .json(
            new ApiResponse(400 , {success:false , data:"please enter the all feilds"} , "please enter the all feilds")
        )
    }
    
    const is_otp_correct = await OTP.findOne({otp:otp ,email:email})
    if(!is_otp_correct)
    {
        return res.status(400)
        .json(
            new ApiResponse(400 , {success:false ,data:"OTP is invalid"},"OTP is invalid")
        )
    }
    if(is_otp_correct.for == "login")
    {
        const user = await User.findOne({email:email});
        if(!user)
        {
            return res.status(400)
            .json(
                new ApiResponse(400,{success:false , data:"User is not found"},"User is not found")
            )
        }
        const AccessToken = await user.generateAccessToken();
        
        if(!AccessToken)
        {
            return res.status(500)
            .json(
                new ApiResponse(500,{success:false , data:"can't generate the AccessToken"},"can't generate the AccessToken")
            )
        }

        await is_otp_correct.deleteOne();

        return res.status(200)
        .json(
            new ApiResponse(200,{success:true , data:{AccessToken}},"You Are SuccessFully Login")
        )
    }

    await is_otp_correct.deleteOne();
    
    return res.status(200)
    .json(
        new ApiResponse(200,{success:true , data:"OTP is correct"} , "OTP is correct")
    )
})

const getProfile = asyncHandler(async(req,res)=>{
    try {
        return res.status(200)
    .json(
        new ApiResponse(200,{success:true , data:req.user},"user fetch successfully")
    )
    } catch (error) {
        return res.status(400)
        .json(
            new ApiResponse(400,{success:false , data:error},"something error is comming in this code")
        )
    }
})

const updateProfile = asyncHandler(async(req,res)=>{
    const data = req.body
})

export 
{
    loginUser,
    registerUser,
    verifyOtp,
    getProfile
}