import mongoose from "mongoose";


const machine_schema = new mongoose.Schema({
    machine_name:{
        type:String,
        required:true
    },
    machine_model:{
        type:String,
        required:true
    },
    serial_number:{
        type:String,
        required:true
    },
    last_service_date:{
        type:String,
        required:true
    },
    machine_comfort_parameters:[
        {
            temp:{
                type:String,
                required:false
            },
            vibration:{
                type:String,
                required:false
            },
            power_usage:{
                type:String,
                required:false
            },
            avarage_runtime:{
                type:String,
                required:true
            }
        }
    ],
    machine_traine:{
        type:Boolean,
        default:false
    },
    machine_train_data:{
        type:String
    }
},{timestamps:true})


export const machine = mongoose.model("machine",machine_schema)