import { Admin } from "../models/admin.models";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { User } from "../models/user.models";

const register = asyncHandler(async(req,res)=>{
    const {username , password} = req.body
    if(!username || !password)
    {
        return res.status(400)
        .json(
            new ApiResponse(400,{success:false , data:"Please Enter All the feilds"},"Please Enter All the feilds")
        )
    }
    
    const isAdminExist = await Admin.findOne({username:username});
    if(isAdminExist)
    {
        return res.status(400)
        .json(
            new ApiResponse(400,{success:false , data:"this username is already exist"} , "this username is already exist")
        )
    }

    const save_admin = await Admin.create({username , password})
    if(!save_admin)
    {
        return res.status(500)
        .json(
            new ApiResponse(500,{success:false , data:"something problem to  create admin"} , "something problem to create admin")
        )
    }

    return res.status(200)
    .json(
        new ApiResponse(200,{success:true , data:"successfully admin is create"} , "succefully admin create")
    )

})

const login = asyncHandler(async(req,res)=>{
    const {username , password} = req.body;

    if(!username || !password)
    {
        return res.status(400)
        .json(
            new ApiResponse(400 , {success:false , data:"please fill the all data"} , "please fill the all data")
        )
    }

    const isUserExist = await Admin.findOne({username});
    if(!isUserExist)
    {
        return res.status(400)
        .json(
            new ApiResponse(400,{success:false , data:"admin is not exist"},"admin is not exist")
        )
    }

    const isPasswordCorrect = await isUserExist.comparePassword(password);
    
    if(!isPasswordCorrect)
    {
        return res.status(400)
        .json(
            new ApiResponse(400,{success:false , data:"please enter correct password"}, "please enter correct password")
        )
    }

    const AccessToken = isUserExist.generateAccessToken();
    if(!AccessToken)
    {
        return res.status(500)
        .json(
            new ApiResponse(500,{success:false , data:"something problem to save accesstoken"} , "something problem to save accesstoken")
        )
    }

    return res.status(200)
    .json(
        new ApiResponse(200,{success:true , data:AccessToken } , "login successfully")
    )

})

const getprofile = asyncHandler(async(req,res)=>{
    return res.status(200)
    .json(
        new ApiResponse(200,{success:true , data:req.user},"fetch successfully")
    )
})

const getUser = asyncHandler(async(req,res)=>{
    const get_all_user = await User.find({});
    if(get_all_user.length <1)
    {
        return res.status(200)
        .json(
            new ApiResponse(200,{success:true , data:"no user found"} , "no user found")
        )
    }

    return res.status(200)
    .json(
        new ApiResponse(200 , {success:true , data:get_all_user},"user fetch suffessfully")
    )
})

export {
    register,
    login,
    getprofile,
    getUser
}




// did
//block chain po
// 