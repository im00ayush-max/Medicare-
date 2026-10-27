const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

const getDashboardStats = async(req,res) => {
    try{
        const totalPatients = await User.countDocuments({
            role :"patient"
        });

        const totalDoctors = await Doctor.countDocuments();

        const totalAppointments = await Appointment.countDocuments();

        const pendingAppointments = await Appointment.countDocuments({
            status:"pending"
        });

        const completedAppointments = await Appointment.countDocuments({
            status :"completed"
        });

        return res.status(200).json({
            success:true,
            stats: {
                totalPatients,totalDoctors,totalAppointments,pendingAppointments,completedAppointments
            }
        });

    } catch (error) {
        return res.status(500).json ({
            success:false,
            message :" failed to fetch dasboard statics"
        });
    }
};

module.exports = {getDashboardStats};