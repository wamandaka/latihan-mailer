require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();
var jwt = require("jsonwebtoken");
const { ResponseTemplate } = require("../helper/template_helper");
const nodemailer = require("nodemailer");
// const crypto = require("crypto");

// function generateUniqueToken() {
//   const currentTimestamp = Date.now().toString();
//   const randomBytes = crypto.randomBytes(16).toString("hex");
//   const uniqueToken = crypto
//     .createHash("sha1")
//     .update(currentTimestamp + randomBytes)
//     .digest("hex");
//   return uniqueToken;
// }

async function register(req, res, next) {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        // TODO: replace `user` and `pass` values from <https://forwardemail.net>
        user: process.env.EMAIL_SMTP,
        pass: process.env.PASS_SMTP,
      },
    });

    let { name, email, password, age, profile_picture } = req.body;
    // const formattedDate = new Date(birthdate).toISOString().split("T")[0];
    let existUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (existUser) {
      let resp = ResponseTemplate(null, "User already exist", null, 400);
      res.json(resp);
      return;
    }
    let encriptedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: encriptedPassword,
        age: parseInt(age),
        // birthdate: formattedDate,
        profile_picture: profile_picture,
        is_verified: false,
      },
    });
    // Pengguna berhasil diautentikasi, generate token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email }, // Payload token
      process.env.SECRET_KEY // Rahasia untuk menandatangani token (gantilah dengan rahasia yang kuat)
      // { expiresIn: "1h" } // Opsional: Waktu kedaluwarsa token
    );

    const mailOptions = await transporter.sendMail({
      from: process.env.EMAIL_SMTP, // sender address
      to: email, // list of receivers
      subject: "Hello ✔", // Subject line
      text: "Hello world?", // plain text body
      html: `token anda: ${token}`, // html body
    });
    console.log("Email sent: " + mailOptions.response);
    let resp = ResponseTemplate(user, "create successfully", null, 200);
    res.json(resp);
    return;
  } catch (error) {
    next(error);
  }
}

async function authUser(req, res) {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      let resp = ResponseTemplate(
        null,
        "Incorrect email or password",
        null,
        401
      );
      res.json(resp);
      return;
    } else {
      // Pengguna berhasil diautentikasi, generate token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email }, // Payload token
        process.env.SECRET_KEY // Rahasia untuk menandatangani token (gantilah dengan rahasia yang kuat)
        // { expiresIn: "1h" } // Opsional: Waktu kedaluwarsa token
      );
      let resp = ResponseTemplate({ token }, "login success", false, 200);
      res.json(resp);
      return;
    }
  } catch (error) {
    let resp = ResponseTemplate(false, "Internal Server Error", false, 500);
    Sentry.captureException(error);
    res.json(resp);
    return;
  }
}

async function verify(req, res, next) {
  try {
    const verificationToken = req.query.token;

    // Lakukan validasi token dan verifikasi pengguna di sini
    jwt.verify(
      verificationToken,
      process.env.SECRET_KEY,
      async (err, decoded) => {
        if (err) {
          let resp = ResponseTemplate(false, "invalid token", null, 401);
          return res.json(resp);
        }

        // Verifikasi pengguna dengan token
        const updatedUser = await prisma.user.update({
          where: { email: decoded.email }, // Gunakan decoded.email untuk mendapatkan email dari token
          data: { is_verified: true },
        });

        let resp = ResponseTemplate(
          updatedUser,
          "Account verified successfully",
          null,
          200
        );
        res.json(resp);
      }
    );
  } catch (error) {
    next(error);
  }
}

module.exports = { register, authUser, verify };
