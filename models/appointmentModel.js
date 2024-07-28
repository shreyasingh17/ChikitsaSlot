const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    doctorId: {
        type: String,
        required: true,
    },
    doctorInfo: {
        type: Object, // Assuming doctorInfo is an object with detailed info
        required: true,
    },
    userInfo: {
        type: Object, // Assuming userInfo is an object with detailed info
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: 'Pending', // Set a default status if not provided
    },
}, { timestamps: true });

const appointmentModel = mongoose.model('appointments', appointmentSchema);
module.exports = appointmentModel;
