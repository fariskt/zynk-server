import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email , role: user.role },process.env.ACCESS_JWT_SECRET, {expiresIn: "7d"});
};

export const generateRefreshToken = (user)=> {
    return jwt.sign({ id: user.id }, process.env.REFRESH_JWT_SECRET, {expiresIn: "7d"});
}
