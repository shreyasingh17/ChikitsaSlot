const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const doctorRoutes = require('./routes/doctorRoutes'); 

const path=require('path')
dotenv.config();
connectDB();

const app = express();

app.use(cors());

//middlewares
app.use(express.json());
app.use(morgan('dev'));

//routes
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/doctor', doctorRoutes); 

//static files 

app.use(express.static(path.join(__dirname,'./client/build'))) ;
app.get("*" , function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build/index.html")) ;
}) ;

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server Running in ${process.env.NODE_ENV} MODE on port ${PORT}.bgCyan.white`);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
