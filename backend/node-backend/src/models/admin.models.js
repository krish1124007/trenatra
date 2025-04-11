import mongoose from "mongoose";

const admin_schema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
},{timestamps:true})

admin_schema.pre("save" ,async function(next){
   if(!this.isModified("password")){next()}
     this.password = await bcrypt.hash(this.password , 10);
     next();
})

admin_schema.methods.generateAccessToken = function(){
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

admin_schema.methods.comparePassword = async function(password){
    return await bcrypt.compare(this.password , password);
}


export const Admin = mongoose.model("Admin", admin_schema)