const JWT = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  try {
    const token = req.headers['authorization'].split(' ')[1];
    JWT.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(200).send({ message: 'Authorization Failed', success: false });
      } else {
        req.body.userId = decoded.id;
        next();
      }
    });
  } catch (error) {
    res.status(401).send({
      message: "Authorization Failed",
      success: false
    });
  }
};
