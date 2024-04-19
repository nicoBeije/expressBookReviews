const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const customer_routes = require("./router/auth_users.js").authenticated;
const genl_routes = require("./router/general.js").general;

const app = express();

app.use(express.json());

app.use(
  "/customer",
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
  })
);

app.use("/customer/auth/*", function auth(req, res, next) {
  const token =
    req.headers.authorization?.split(" ")[1] ||
    req.session.authorization?.accessToken;
  if (token) {
    jwt.verify(token, "access", (err, decoded) => {
      console.log("Token: ", token);
      if (err) {
        console.log("JWT Error: ", err);
        return res
          .status(403)
          .json({ message: "User not authenticated", error: err.message });
      } else {
        req.user = decoded;
        next();
      }
    });
  } else {
    console.log("No token provided");
    return res.status(403).json({ message: "No token provided" });
  }
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => {
  const host = "localhost";
  console.log(`Server is running at http://${host}:${PORT}`);
});
