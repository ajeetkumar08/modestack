const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
  try {
    if (!req.header("Authorization")) throw new Error();

    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = await jwt.verify(token, "modestack");
     console.log("Decoded", decoded);
     res.userId = decoded.id;
     next();
   
  } catch (err) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
      errors: err.message,
    });
  }
};

module.exports = auth;