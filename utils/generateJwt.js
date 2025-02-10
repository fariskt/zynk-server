const jwt = require("jsonwebtoken");
const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email , role: user.role },process.env.ACCESS_JWT_SECRET, {expiresIn: "1h"});
};

const generateRefreshToken = (user)=> {
    return jwt.sign({ id: user.id }, process.env.REFRESH_JWT_SECRET, {expiresIn: "7d"});
}

module.exports = {
    generateAccessToken,
    generateRefreshToken
}
