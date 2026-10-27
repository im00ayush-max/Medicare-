const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
            trim: true
        },

        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true
        },

        password:{
            type:String,
            required:true,
            select:false

        },

        role:{
           type: String,
           enum :["patient", "doctor","admin","receptionist"],
           default:"patient"
        },

    isEmailVerified: {
  type: Boolean,
  default: false
},

emailOTP: {
  type: String,
  default: undefined
},

emailOTPExpires: {
  type: Date,
  default: undefined

}, 
    

    resetPasswordOTP: {
  type: String,
  default: undefined
},
resetPasswordOTPExpires: {
  type: Date,
  default: undefined
}
    },
    {
        timestamps:true
    }
);
 


module.exports= mongoose.model("User", userSchema);