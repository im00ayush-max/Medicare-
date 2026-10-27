const express= require("express");

const {updateDoctor} = require("../controllers/doctorController");

const {addDoctor,getDoctors,getDoctorById} = require("../controllers/doctorController");

const{protect,authorizeRoles} = require("../middleware/authMiddleware");

const router = express.Router();

const {getAllDoctors} = require("../controllers/doctorController");

const {getAvailableSlots} = require("../controllers/availabilityController");

router.get("/:id",getDoctorById);

router.get("/", getAllDoctors);

router.post("/",protect,authorizeRoles("admin"), addDoctor);

router.put("/:id",protect,authorizeRoles("admin"),updateDoctor);

router.get("/:doctorId/availability", getAvailableSlots);

module.exports = router;