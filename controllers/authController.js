import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import expressAsyncHandler from "express-async-handler";

// @desc Login
// @route POST /auth
// @access Public
const login = expressAsyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  const foundUser = await User.findOne({ username }).exec();

  if (!foundUser || !foundUser.active) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const match = bcrypt.compare(password, foundUser.password);

  if (!match) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const accesstoken = jwt.sign(
    {
      UserInfo: {
        username: foundUser.username,
        roles: foundUser.roles,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1m" }
  );

  const refreshtoken = jwt.sign(
    {
      username: foundUser.username,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "1d" }
  );

  //Create secure cookie with refresh token
  res.cookie("jwt", refreshtoken, {
    httpOnly: true, //accessible only by web server
    secure: true, //https
    sameSite: "none", //cross-site cookie
    maxAge: 7 * 24 * 60 * 60 * 1000, // cookie expiry: set to match rT
  });

  //Send accesstoken containing username and roles
  res.json({ accesstoken });
});

// @desc Refresh
// @route GET /auth/refresh
// @access Public - becuase access token has expired
const refresh = (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const refreshToken = cookies.jwt;

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET),
    expressAsyncHandler(async (err, decoded) => {
      console.log(decoded);
      if (err) {
        console.log(err);
        return res.status(403).json({ message: "Forbidden" });
      }

      const foundUser = await User.findOne({ username: decoded.username }).exec();

      if (!foundUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      console.log(foundUser);
      const accessToken = jwt.sign(
        {
          Userinfo: {
            username: foundUser.username,
            roles: foundUser.roles,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1m" }
      );

      res.json({ accessToken });
    });
};

// @desc Logout
// @route POST /auth/logout
// @access Public - just to clear cookie if exists
const logout = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.sendStatus(204); //No content
  }

  res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
  res.json({ message: "Cookie cleared!" });
};

export { login, logout, refresh };
