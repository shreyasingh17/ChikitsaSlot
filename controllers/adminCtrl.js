const doctorModel = require('../models/doctorModel');
const userModel = require('../models/userModels');

const getAllUsersController = async (req, res) => {
    try {
        const users = await userModel.find({});
        res.status(200).send({
            success: true,
            message: "Users Data List",
            data: users,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error while fetching users",
            error,
        });
    }
};

const getAllDoctorsController = async (req, res) => {
    try {
        const doctors = await doctorModel.find({});
        res.status(200).send({
            success: true,
            message: "Doctors Data List",
            data: doctors,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error while fetching doctors",
            error,
        });
    }
};

// Doctor account status
const changeAccountStatusController = async (req, res) => {
    try {
        const { doctorId, status } = req.body;
        const doctor = await doctorModel.findByIdAndUpdate(doctorId, { status });

        if (!doctor) {
            return res.status(404).send({
                success: false,
                message: "Doctor not found",
            });
        }

        const user = await userModel.findById(doctor.userId);
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found",
            });
        }

        user.notification.push({
            type: 'doctor-account-request-updated',
            message: `Your Doctor Account Request has been ${status}`,
            onClickPath: '/notification',
            read: false,
        });

        user.isDoctor = status === 'approved' ? true : false;
        await user.save();

        res.status(200).send({
            success: true,
            message: 'Account status updated successfully',
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error in Account Status',
            error,
        });
    }
};

const deleteDoctorController = async (req, res) => {
    try {
      const doctorId = req.params.id;
      const doctor = await doctorModel.findByIdAndDelete(doctorId);
  
      if (!doctor) {
        return res.status(404).send({
          success: false,
          message: 'Doctor not found',
        });
      }
  
      res.status(200).send({
        success: true,
        message: 'Doctor request deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting doctor:', error);
      res.status(500).send({
        success: false,
        message: 'Error deleting doctor',
        error: error.message,
      });
    }
  };




module.exports = {
    getAllDoctorsController,
    getAllUsersController,
    changeAccountStatusController , deleteDoctorController
};