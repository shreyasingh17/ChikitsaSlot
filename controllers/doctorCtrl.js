const appointmentModel = require("../models/appointmentModel");
const doctorModel = require("../models/doctorModel");
const userModel = require("../models/userModels");

// Get Doctor Info
const getDoctorInfoController = async (req, res) => {
    try {
        const doctor = await doctorModel.findOne({ userId: req.body.userId });
        res.status(200).send({
            success: true,
            message: 'Doctor data fetch success',
            data: doctor,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: 'Error in fetching Doctor Details',
        });
    }
};

// Update Doctor Profile
const updateProfileController = async (req, res) => {
    try {
        const doctor = await doctorModel.findOneAndUpdate({ userId: req.body.userId }, req.body, { new: true });
        res.status(201).send({
            success: true,
            message: 'Doctor Profile Updated',
            data: doctor,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Doctor Profile Update issue',
            error,
        });
    }
};

// Get Single Doctor by ID
const getDoctorByIdController = async (req, res) => {
    try {
        const doctor = await doctorModel.findOne({ _id: req.query.id });
        res.status(200).send({
            success: true,
            message: 'Single Doctor data fetched:',
            data: doctor,
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Error in Single Doctor Info',
            error: error.message,
        });
    }
};

// Doctor Appointments Controller
const doctorAppointmentsController = async (req, res) => {
    try {
        const doctor = await doctorModel.findOne({ userId: req.body.userId });
        const appointments = await appointmentModel.find({ doctorId: doctor._id });
        res.status(200).send({
            success: true,
            message: 'Doctor Appointments fetch successfully',
            onClickPath: '/user/appointments',
            data: appointments,
        });

        // No need to save the doctor again as no changes are made
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: "Error In Fetching Doctor's Appointments",
        });
    }
};

const updateStatusController = async (req, res) => {
    try {
        const { appointmentId, status } = req.body;

        if (!appointmentId || !status) {
            return res.status(400).send({
                success: false,
                message: 'Appointment ID and status are required',
            });
        }

        const appointment = await appointmentModel.findByIdAndUpdate(appointmentId, { status }, { new: true });
        
        if (!appointment) {
            return res.status(404).send({
                success: false,
                message: 'Appointment not found',
            });
        }

        const user = await userModel.findById(appointment.userId); 
        if (user) { 
            if (!user.notification) {
                user.notifications = [];
            }

            user.notification.push({
                type: 'status-updated',
                message: `Your appointment has been ${status}`,
                onClickPath: '/doctor-appointments',
            });

            await user.save();
            res.status(200).send({ success: true, message: 'Appointment status Updated' });
        } else {
            return res.status(404).send({
                success: false,
                message: 'User not found',
            });
        }

    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).send({
            success: false,
            message: 'Error in updating status',
            error: error.message,
        });
    }
};

module.exports = {
    getDoctorInfoController,
    updateProfileController,
    getDoctorByIdController,
    doctorAppointmentsController,
    updateStatusController
};