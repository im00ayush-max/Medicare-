const Doctor = require("../models/Doctor");
const mongoose = require("mongoose");
  
const addDoctor = async (req, res) => {
    try {
        const {
            name,
            email,
            specialization,
            experience,
            qualification,
            consultationFee
        } = req.body;

        if (
            !name ||
            !email ||
            !specialization ||
            experience === undefined ||
            !qualification ||
            consultationFee === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required doctor details"
            });
        }

        const existingDoctor = await Doctor.findOne({
            email: email.trim().toLowerCase()
        });

        if (existingDoctor) {
            return res.status(409).json({
                success: false,
                message: "Doctor with this email already exists"
            });
        }

        const doctor = await Doctor.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            specialization,
            experience,
            qualification,
            consultationFee
        });

        return res.status(201).json({
            success: true,
            message: "Doctor added successfully",
            doctor
        });

    } catch (error) {
        console.error("Add doctor error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Doctor email already exists"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to add doctor"
        });
    }
};


const getDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find().sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: doctors.length,
            doctors
        });

    } catch (error) {
        console.error("Get doctors error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch doctors"
        });
    }
};
const getDoctorById = async (req,res) => {
    try{
        const doctor = await Doctor.findById(req.params.id);

        if(!doctor) {
            return res.status(404).json({
                success:false,
                message:"Doctor not found"
            });
        }

        return res.status(200).json ({
success:true,
doctor
        });


    } catch (error) {
        if(error.name === "castError") {
            return res.status(400).json({
                success: false,
                message :"invalid doctor ID"
            });
      
        }

        console.error("Get doctor error:", error.message);

        return res.status(500).json({
            success:false,
            message:"failed to add doctor",
            error:error.message
        });
    }
};

const updateDoctor= async (req,res) => {
    try{
        const {id} = req.params;

        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                success:false,
                message:"Invalid doctor ID"
            });
        }
        const  doctor = await Doctor.findByIdAndUpdate(
            id, req.body,
            {
                new:true,
                runValidators:true
            }
        );

        if(!doctor) {
            return res.status(404).json({
                success: false,
                message:"Doctor not found"
            });
        }

     return res.status(200).json({
            success:true,
            message:"Doctor updated successfully",
            doctor
        });
    } catch (error) {
        console.error("Update doctor error:", error.message);

       return  res.status(500).json({
            success:false,
            message:"Failed to update doctor"
        });
    } 
};

const getAllDoctors = async(req,res)=> {
    try{
        const filter = {};

        if(req.query.name) {
            filter.name ={
                $regex:req.query.name,
                $options:"i"
            };
        }

        if(req.query.specialization) {
            filter.specialization = {
                $regex: req.query.specialization,
                $options:"i"
            };
        }

        if(req.query.available !==undefined) {
            filter.available = req.query.available === "true";
        }


        if(req.query.minExperience) {
            const experience = Number(req.query.minExperience);
           if (!Number.isFinite(experience)|| experience< 0) {
            return res.status(400).json ({
                success:false,
                message:"Invalid minExperience"
            });
           }

           filter.experience = {$gte: experience};
        }

        const page = Math.max (1, parseInt(req.query.page, 10)|| 1);
        const limit = Math.min (50, Math.max(1, parseInt(req.query.limit,10)||10));
        const skip = (page - 1)* limit;


        let sortOption = {};

        if(req.query.sort === "experience") {
            sortOption.experience = -1;

        } else if (req.query.sort === "fee") {
            sortOption.consultationFee = 1;
        }

        const [doctors, totalDoctors] = await Promise.all([
            Doctor.find(filter) 
            .sort(sortOption) .skip(skip) .limit(limit), Doctor.countDocuments(filter)
        ]);


         
        res.status(200).json({
        success:true,
  count:doctors.length,
  doctors
        });

} catch (error) {

   console.error("Get all doctors error:", error);

return res.status(500).json({
    success: false,
    message: error.message || "Failed to fetch doctors"
});

}
};
module.exports = {
    addDoctor,
    getDoctors,
    getDoctorById,
    updateDoctor,
    getAllDoctors
};
  