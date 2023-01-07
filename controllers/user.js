import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Profile from '../models/Profile.js';



export const signin = async (req, res) => {
  const { email, password } = req.body; //Coming from formData

  
    const existingUser = await User.findOne({ email });

    //get userprofile and append to login auth detail
    const userProfile = await Profile.findOne({
      userId: existingUser?._id,
    });

    if (!existingUser)
      return res.status(404).json({ message: 'Invalid credentials' });

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordCorrect)
      return res.status(400).json({ message: 'Invalid credentials' });

    //If credentials are valid, create a token for the user
    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      process.env.SECRET,
      { expiresIn: '1h' }
    );

    //Then send the token to the client/frontend
    res.status(200).json({ result: existingUser, userProfile, token });

};

export const signup = async (req, res) => {
  const { email, password, confirmPassword, firstName, lastName, bio } =
    req.body;

  try {
    const existingUser = await User.findOne({ email });
    const userProfile = await Profile.findOne({
      userId: existingUser?._id,
    });

    if (existingUser)
      return res.status(400).json({ message: 'User already exist' });

    if (password !== confirmPassword)
      return res.status(400).json({ message: "Password don't match" });

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await User.create({
      email,
      password: hashedPassword,
      name: `${firstName} ${lastName}`,
      bio,
    });

    const token = jwt.sign({ email: result.email, id: result._id }, SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({ result, userProfile, token });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const forgotPassword = (req, res) => {
  const { email } = req.body;

  // NODEMAILER TRANSPORT FOR SENDING POST NOTIFICATION VIA EMAIL
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
    }
    const token = buffer.toString('hex');
    User.findOne({ email: email }).then((user) => {
      if (!user) {
        return res
          .status(422)
          .json({ error: 'User does not exist in our database' });
      }
      user.resetToken = token;
      user.expireToken = Date.now() + 3600000;
      user
        .save()
        .then((result) => {
          transporter.sendMail({
            to: user.email,
            from: process.env.EMAIL_FROM,
            subject: 'Password reset request',
            html: `
                    <p>You requested for password reset from Arc Invoicing application</p>
                    <h5>Please click this <a href="http://localhost:3000/reset/${token}">link</a> to reset your password</h5>
                    <p>Link not clickable?, copy and paste the following url in your address bar.</p>
                    <p>http://localhost:3000/reset/${token}</p>
                    <P>If this was a mistake, just ignore this email and nothing will happen.</P>
                    `,
          });
          res.json({ message: 'check your email' });
        })
        .catch((err) => console.log(err));
    });
  });
};

export const resetPassword = (req, res) => {
  const newPassword = req.body.password;
  const sentToken = req.body.token;
  User.findOne({ resetToken: sentToken, expireToken: { $gt: Date.now() } })
    .then((user) => {
      if (!user) {
        return res.status(422).json({ error: 'Try again session expired' });
      }
      bcrypt.hash(newPassword, 12).then((hashedpassword) => {
        user.password = hashedpassword;
        user.resetToken = undefined;
        user.expireToken = undefined;
        user.save().then((saveduser) => {
          res.json({ message: 'password updated successfully' });
        });
      });
    })
    .catch((err) => {
      console.log(err);
    });
};