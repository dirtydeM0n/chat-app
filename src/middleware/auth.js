const jwt = require("jsonwebtoken");
const { jwt_secret } = require("../../constanst");

module.exports = function (req, res, next) {
  // Retrieving the token from the http header
  const token = req.header("x-auth-token") || req.header("X-AUTH-TOKEN");

  // Check whether a token is available or not
  if (!token) {
    return res
      .status(401)
      .json({ msg: "No token found, authorization denied" });
  }

  // Verifying the present token
  try {
    const decoded = jwt.verify(token, jwt_secret); // token verification
    req.user = decoded.user;
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Token is not valid" });
  }
};
