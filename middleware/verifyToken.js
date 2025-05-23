import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  const {token} = req.cookies;  
  
  if (!token) {
    return res.status(401).json({ success: false, message: "Access token required" });
  }
  jwt.verify(token, process.env.ACCESS_JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: "Invalid or expired token" });
    }
    req.user = decoded;    
    next();
  });
};

export default verifyToken;