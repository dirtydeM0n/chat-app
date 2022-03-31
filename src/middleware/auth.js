const jwt = require("jsonwebtoken");
const { jwt_secret } = require("../../constanst");

module.exports = function (req, res, next) {
  // Retrieving the token from the http header
  const header_token = req.header("x-auth-token") || req.header("X-AUTH-TOKEN");
  // Check whether a token is available or not
  if (!header_token) {
    return res
      .status(401)
      .json({ msg: "No token found, authorization denied" });
  }
  const token = header_token.split("Bearer ")[1];
  // Verifying the present token
  try {
    const decoded = jwt.verify(token, jwt_secret); // token verification
    req.user = decoded.user;
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Token is not valid" });
  }
};
