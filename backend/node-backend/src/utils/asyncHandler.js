function asyncHandler (fn){
   return (res,req,next)=>{
    Promise.resolve(fn(res,req,next)).catch(next)
   }
}

export {asyncHandler}