const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModels');
const DoctorModel = require('../models/doctorModel');
const AppointmentModel = require('../models/appointmentModel');

// Login Controller
const loginController = async (req, res) => {
    try {
        const user = await UserModel.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).send({ message: 'User not found', success: false });
        }

        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            return res.status(400).send({ message: 'Invalid Email or Password', success: false });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).send({ message: 'Login successful', success: true, token });
    } catch (error) {
        console.error('Error in Login CTRL:', error.message);
        res.status(500).send({ message: `Error in Login CTRL ${error.message} `});
    }
};

// Register Controller
const registerController = async (req, res) => {
    try {
        const existingUser = await UserModel.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists', success: false });
        }

        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new UserModel({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully', success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', success: false });
    }
};

// Auth Controller
const authController = async (req, res) => {
    try {
        const user = await UserModel.findById(req.body.userId);
        if (!user) {
            return res.status(404).send({ message: 'User not found', success: false });
        }
        user.password = undefined; // Exclude password from response
        res.status(200).send({ success: true, data: user });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Authentication error', success: false, error });
    }
};

// Apply Doctor Controller
const applyDoctorController = async (req, res) => {
    try {
        const newDoctor = new DoctorModel({ ...req.body, status: 'pending' });
        await newDoctor.save();
        const adminUser = await UserModel.findOne({ isAdmin: true });
        if (adminUser) {
            const notification = adminUser.notification;
            notification.push({
                type: 'apply-doctor-request',
                message: `${newDoctor.firstName} ${newDoctor.lastName} Has Applied For A Doctor Account`,
                data: {
                    doctorId: newDoctor._id,
                    name: `${newDoctor.firstName} ${newDoctor.lastName}`,
                    onClickPath: '/admin/doctors'
                }
            });
            await UserModel.findByIdAndUpdate(adminUser._id, { notification });
        }
        res.status(201).send({ success: true, message: 'Doctor Account Applied Successfully', data: req.body });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Error while Applying for Doctor', success: false, error });
    }
};

// Get All Notifications Controller
const getAllNotificationController = async (req, res) => {
    try {
        const user = await UserModel.findById(req.body.userId);
        if (!user) {
            return res.status(404).send({ message: 'User not found', success: false });
        }
        user.seennotification.push(...user.notification);
        user.notification = []; // Clear unread notifications
        const updatedUser = await user.save();
        res.status(200).send({
            success: true, message: "All notifications marked as read", data: updatedUser
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Error in marking notifications as read",
            success: false, error
        });
    }
};

// Delete All Notifications Controller
const deleteAllNotificationController = async (req, res) => {
    try {
        const user = await UserModel.findById(req.body.userId);
        if (!user) {
            return res.status(404).send({ message: 'User not found', success: false });
        }
        user.notification = []; // Clear unread notifications
        user.seennotification = []; // Clear seen notifications
        const updatedUser = await user.save();
        res.status(200).send({
            success: true, message: "Notifications deleted successfully", data: updatedUser
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Error in deleting notifications",
            success: false, error
        });
    }
};

// Get All Doctors Controller
const getAllDoctorsController = async (req, res) => {
    try {
        const doctors = await DoctorModel.find({ status: 'approved' });
        res.status(200).send({
            success: true, message: 'Doctors List Fetched Successfully', data: doctors
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, error, message: 'Error while Fetching Doctors' });
    }
};

// Book Appointment Controller
const bookAppointmentController = async (req, res) => {
    try {
        req.body.status = 'pending';
        const newAppointment = new AppointmentModel(req.body);
        await newAppointment.save();

        // Notify the user
        const user = await UserModel.findById(req.body.userId);
        if (!user) {
            return res.status(404).send({ message: 'User not found', success: false });
        }

        user.notification.push({
            type: 'New-appointment-request',
            message: `You have successfully booked an appointment with Dr. ${req.body.doctorInfo.firstName} ${req.body.doctorInfo.lastName}`,
            onClickPath: '/user/appointments'
        });
        await user.save();

        // Notify the doctor
        const doctorUser = await UserModel.findById(req.body.doctorInfo.userId);
        if (!doctorUser) {
            return res.status(404).send({ message: 'Doctor user not found', success: false });
        }

        // Ensure userInfo has a name property
        const userName = user.name; // Get the user's name from the UserModel
        doctorUser.notification.push({
            type: 'New-appointment-request',
            message: `You have a new appointment request from ${userName}`,
            onClickPath: '/doctor/appointments'
        });
        await doctorUser.save();

        res.status(200).send({
            success: true,
            message: "Appointment booked successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: 'Error while booking appointment'
        });
    }
};

// Check if Doctor Email Exists Controller
const checkDoctorEmailExistsController = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).send({
                success: false,
                message: 'Email is required',
            });
        }

        const doctor = await DoctorModel.findOne({ email });
        const exists = !!doctor; // true if doctor exists, false otherwise

        res.status(200).send({
            success: true,
            exists,
        });
    } catch (error) {
        console.error('Error checking doctor email existence:', error);
        res.status(500).send({
            success: false,
            message: 'Error checking doctor email existence',
            error: error.message,
        });
    }
};

// Check Availability Controller
const checkAvailabilityController = async (req, res) => {
    try {
        const { doctorId, date, time } = req.query; // Use req.query for GET requests

        if (!doctorId || !date || !time) {
            return res.status(400).send({
                success: false,
                message: 'Doctor ID, date, and time are required',
            });
        }

        const existingAppointment = await AppointmentModel.findOne({
            doctorId,
            date,
            time,
        });

        const isAvailable = !existingAppointment; // True if no appointment exists

        res.status(200).send({
            success: true,
            isAvailable,
        });
    } catch (error) {
        console.error('Error checking doctor availability:', error);
        res.status(500).send({
            success: false,
            message: 'Error checking doctor availability',
            error: error.message,
        });
    }
};

// Get User Appointments Controller
const userAppointmentsController = async (req, res) => {
    try {
        const appointments = await AppointmentModel.find({ userId: req.body.userId });
        res.status(200).send({
            success: true,
            message: 'Users Appointment Fetched Successfully',
            data: appointments
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: 'Error In User Appointments'
        });
    }
};

module.exports = {
    loginController,
    registerController,
    authController,
    applyDoctorController,
    getAllNotificationController,
    deleteAllNotificationController,
    getAllDoctorsController,
    bookAppointmentController,
    checkDoctorEmailExistsController,
    checkAvailabilityController,
    userAppointmentsController
};