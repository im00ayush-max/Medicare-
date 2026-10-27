const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
    {
        name: {
            type:String,
            required:true,
            trim:true
        },

        email: {
            type: String,
            required:true,
            unique:true,
            lowercase:true,
             trim:true
        },

        specialization: {
            type:String,
            required:true,
            trim: true
        },

        experience: {
            type:Number,
            required:true,
            min:0
        },

        qualification: {
            type: String,
            required:true
        },

        consultationFee: {
type: Number,
required: true,
min:0
        },

       availability: [
  {
    day: {
      type: String,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      required: true
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    slotDuration: {
      type: Number,
      default: 30
    }
  }
],
    },
    {
        timestamps:true
    });

 
module.exports = mongoose.model("Doctor", doctorSchema);