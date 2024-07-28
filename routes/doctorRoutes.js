const express = require('express');
const { 
    getDoctorInfoController, 
    updateProfileController, 
    getDoctorByIdController, 
    doctorAppointmentsController , updateStatusController
} = require('../controllers/doctorCtrl');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// POST SINGLE DOC INFO
router.post('/getDoctorInfo', authMiddleware, getDoctorInfoController);

// POST UPDATE PROFILE
router.post('/updateProfile', authMiddleware, updateProfileController);

// GET DOCTOR BY ID
router.get('/getDoctorById', authMiddleware, getDoctorByIdController);

// GET APPOINTMENTS
router.get('/doctor-appointments', authMiddleware, doctorAppointmentsController);

//POST UPDATE

router.post('/update-status' , authMiddleware , updateStatusController )
module.exports = router;
