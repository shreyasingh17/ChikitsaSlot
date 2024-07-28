const express = require('express');
const {
    loginController,
    registerController,
    authController,
    applyDoctorController,
    getAllNotificationController,
    deleteAllNotificationController,
    getAllDoctorsController,
    bookAppointmentController , checkDoctorEmailExistsController , checkAvailabilityController, userAppointmentsController
} = require('../controllers/userCtrl');
const authMiddleware = require('../middlewares/authMiddleware');

// router object
const router = express.Router();

// routes
router.post('/login', loginController); // LOGIN || POST
router.post('/register', registerController); // REGISTER || POST
router.post('/getUserData', authMiddleware, authController); // GET USER DATA || POST
router.post('/apply-doctor', authMiddleware, applyDoctorController); // Apply Doctor || POST
router.post('/get-all-notification', authMiddleware, getAllNotificationController); // Get All Notifications || POST
router.post('/delete-all-notification', authMiddleware, deleteAllNotificationController); // Delete All Notifications || POST
router.get('/getAllDoctors', authMiddleware, getAllDoctorsController); // GET ALL DOC
router.post('/book-appointment', authMiddleware, bookAppointmentController); // BOOK APPOINTMENT || POST

// New route for checking availability
router.get('/check-availability', checkAvailabilityController); 
router.get('/check-doctor-email', checkDoctorEmailExistsController);

router.post('/update', authMiddleware, async (req, res) => {
    const { name, phone } = req.body;
    const userId = req.user._id; // Assuming authMiddleware sets req.user
  
    try {
      const updatedUser = await User.findByIdAndUpdate(userId, { name, phone }, { new: true });
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: 'Error updating user profile' });
    }
  });

//Appointment List
router.get('/user-appointments' , authMiddleware , userAppointmentsController)
module.exports = router;
