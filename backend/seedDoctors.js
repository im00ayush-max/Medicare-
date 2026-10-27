
require("dotenv").config();

const mongoose = require("mongoose");
const Doctor = require("./models/Doctor");

const doctors = [
  {
    name: "Dr. Priya Sharma",
    email:"priya.sharma@gmail.com",
    specialization: "Cardiology",
    experience: 8,
    qualification: "MBBS, MD Cardiology",
    consultationFee: 800,
    available: true
  },
  {
    name: "Dr. Amit Verma",
    email:"Amit.verma@gmail.com",
    specialization: "Neurology",
    experience: 10,
    qualification: "MBBS, MD Neurology",
    consultationFee: 1000,
    available: true
  },
  {
    name: "Dr. Neha Gupta",
    email:"Neha.gupta@gmail.com",
    specialization: "Pediatrics",
    experience: 6,
    qualification: "MBBS, MD Pediatrics",
    consultationFee: 600,
    available: true
  },
  {
    name: "Dr. Rahul Mehta",
    email:"Rahul.mehta@gmail.com",
    specialization: "Orthopedics",
    experience: 12,
    qualification: "MBBS, MS Orthopedics",
    consultationFee: 1200,
    available: true
  },
  {
    name: "Dr. Anjali Kapoor",
    email:"Anjali.kapoor@gmail.com",
    specialization: "Dermatology",
    experience: 5,
    qualification: "MBBS, MD Dermatology",
    consultationFee: 700,
    available: true
  },
  {
    name: "Dr. Karan Singh",
    email:"Karan.singh@gmail.com",
    specialization: "General Medicine",
    experience: 7,
    qualification: "MBBS, MD Medicine",
    consultationFee: 500,
    available: true
  },
  {
    name: "Dr. Pooja Malhotra",
    email:"Pooja.malhotra@gmail.com",
    specialization: "Gynecology",
    experience: 9,
    qualification: "MBBS, MS Gynecology",
    consultationFee: 900,
    available: true
  },
  {
    name: "Dr. Vikram Thakur",
    email:"Vikram.Thakur@gmail.com",
    specialization: "Ophthalmology",
    experience: 11,
    qualification: "MBBS, MS Ophthalmology",
    consultationFee: 800,
    available: true
  },
  {
    name: "Dr. Meera Joshi",
    email:"Meera.joshi@gmail.com",
    specialization: "Psychiatry",
    experience: 4,
    qualification: "MBBS, MD Psychiatry",
    consultationFee: 650,
    available: true
  },
  {
    name: "Dr. Sandeep Kumar",
    email:"Sandeep.kumar@gmail.com",
    specialization: "ENT",
    experience: 6,
    qualification: "MBBS, MS ENT",
    consultationFee: 600,
    available: true
  }
];

const seedDoctors = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const result = await Doctor.insertMany(doctors);

    console.log(`${result.length} doctors added successfully`);
  } catch (error) {
    console.error("Error adding doctors:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

seedDoctors();