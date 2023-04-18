import { Request, Response } from 'express'
import jwt from 'jsonwebtoken';

import Otp, { IOtp } from '../models/otp'
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import User, { IUserDocument, userValidation } from '../models/user'
import configs from '../config/configs'

const jwtSecret = configs.JWT_SECRET;

//Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: configs.EMAIL,
    pass: configs.PASSWORD,
  }
})

// create json web token 30 -means 30 days
const maxAge = 30 * 24 * 60 * 60;
export const createToken = (id) => {
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: maxAge
  });
};

const userLogin = async (req: Request, res: Response) => {

    try {
      let  { email, password } = req.body;
      email = email.trim()
      password = password.trim()

      if(email === null || password === null || email === "" || password == ""){
        return res.status(400).json({ error: "Wrong format of Admin info sent.", message: "Must provide Email and password." }).end();
      }
      const user: IUserDocument = await User.login(email,password);

      const token = createToken(user);

      res.header('token', token);
      res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });

      const cur_user = await User.findOne({_id: user._id}).populate("avatar").lean().exec();
      return res.status(200).json({
        token: token,
        message: 'User logged in successfully',
        data: cur_user
      });
    }
    catch (err) {
      if (err.isJoi === true) {
        return res.status(400).json({ error: err.details[0].message });
      }
      return res.status(400).json({ error: "Wrong User credentials." , message: "Must provide Email and password."}).end();
    }
}

const userSignup = async (req, res) => {
  try {
    let { userName, name,email,bio,department, year, country,avatar,password,favoriteTags } = req.body;

    const validatedUser = await userValidation.validateAsync({ userName, name,email,bio, department, year,country,avatar,password,favoriteTags });

    //check if user exists with email
    const userByEmail = await User.findOne({ email: validatedUser.email }).lean().exec();

    //if user found return error
    if (userByEmail) {
      return res.status(400).json({ error: "That email is already registered", message: "Must provide unique email" }).end();
    }

    //check if user exists with username
    const userByUserName = await User.findOne({ userName: validatedUser.userName }).lean().exec();

    //if user found return error
    if (userByUserName) {
      return res.status(400).json({ error: "That user Name is already registered", message: "Must provide unique userName" }).end();
    }

    const new_user = await User.create({...validatedUser});

    //send jwt token
    const token = createToken(new_user);
    res.header('token', token);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });

    //finish registering the user || send success message
    const cur_user = await User.findOne({_id: new_user._id}).populate("avatar").lean().exec();
    return res.status(201).json({
      token: token,
      message: "User registered successfully!",
      data: cur_user
    }).end();
  }
  catch (err) {
    if (err.isJoi === true) {
      return res.status(400).json({ error: err.details[0].message, message: err.details[0].message }).end();
    }
    return res.status(400).json({ error: "Wrong format of user info sent.", message: err.message }).end();
  }
}

//verify OTP before login
const verifyUserAndOtp = async ({ email, otp }) => {
    try {
  
      //if there is no email or otp provided return error
      if (!email || !otp) {
        return {isValid: false , error: "Empty user details is not allowed!" }
      } else {
        //#Verify the OTP
        const otpVerificationRecord = await Otp.find({ email });
        if (otpVerificationRecord.length <= 0) {
          //if there is no record with given email return error 
          return {isValid: false, errors: "Incorrect verification code sent." }
        } else {
  
          //at this point it means otp exists
          const { expiresAt } = otpVerificationRecord[0];
          const hashedOtp = otpVerificationRecord[0].otp;
  
          //if otp has expired return OTP expired error
          if (expiresAt.getTime() < Date.now()) {
            // await Otp.deleteMany({email});
            return {isValid: false, error: "Verification code has expired. Please request again." }
          } else {
  
            // If everything is okay compare the otp to saved one
            const validOTP = await bcrypt.compare(otp, hashedOtp);
  
            if (!validOTP) {
              // if different otp is sent return error
              return {isValid: false, error: "Invalid code passed. Please check your inbox again." }
            } else {
  
              //if OTP is valid then return true and delete the otp record
              await Otp.deleteMany({ email });
              //return true to end the execution of code
              return {isValid: true, error: "" };
            }
          }
        }
      }
    } catch (error) {
      return {isValid: false, error: "Server error." }
    }
  }


  //SEND OTP Verification to Email(to be called from routes)
  const sendOtpVerificationEmail = async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ errors: "Empty email and role details are not allowed!" }).end();
    }
    try {
      //call send otp method with provided email
      return await sendOtp({ email }, res);
    } catch (error) {
      return res.status(400).json({ errors: "sending Email Verification code failed" }).end();
    }
  }

  //OTP verification setup
  const sendOtp = async ({ email }, res) => {
  
    email.trim();
  
    //if empty email is sent with request return bad request
    if (email == "") {
      return res.status(400).json({ errors: "Empty email is not allowed." }).end();
    }
    try {
      //Check if there is a user with same email is in a process of being verified
      const otpRecord = await Otp.find({ email: email }).lean().exec();
      //if user found delete the former OTP and resend new one
      if (otpRecord.length > 0) {
        // delete the existing otp and resend new one
        const result = await Otp.deleteMany({ email });
      }
  
      //if every thing is okay send verification OTP
      const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
  
  
      //setup mail options
      const mailOptions = {
        from: configs.EMAIL,
        to: email,
        subject: "A2SV Email Verification",
        html: `<p>Use verification code <b>${otp}</b> to verify your account and complete the sign in. This verification code is valid for <b> 5 minutes.</b>.</p>`
      }
  
      //hash the otp
      const salt = await bcrypt.genSalt();
      const hashedOtp = await bcrypt.hash(otp, salt);
      const newOtp = new Otp({
        email: String(email),
        otp: hashedOtp,
        createdAt: Date.now(),
        expiresAt: Date.now() + 300000
      });
  
      const savedOTP = await newOtp.save();
      const result = await transporter.sendMail(mailOptions);
  
      //Finally send a success message
      return res.status(201).json({
        status: "PENDING",
        message: "Verification otp Email sent successfully!"
      }).end();
  
    } catch (error) {
      return res.status(400).json({ errors: "Email Verification failed" });
    }
  }
  
  //resend verification
  const resendOtpVerification = async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ errors: "Empty user details are not allowed!" }).end();
    } else {
      email.trim()
      if (email == "") {
        return res.status(400).json({ errors: "Empty email details is not allowed!" }).end();
      }
      const otpRecord = await Otp.find({ email: email }).lean().exec();
      //if user found return error
      if (otpRecord.length > 0) {
        // delete the existing otp and resend new one
        const result = await Otp.deleteMany({ email });
        //call the sendOTP method 
        return await sendOtp({ email }, res);
      } else {
        return res.status(400).json({ errors: "There is no user by this email being registered." }).end();
      }
    }
  }

//TODO: admin change Password
const changePassword = async (req: Request, res: Response) => {
  // Take user input from req body 
  const { oldPassword, newPassword, confirmPassword } = req.body
  try {
    if (!oldPassword || !newPassword || !confirmPassword || oldPassword == "" || newPassword == "" || confirmPassword == "") {
      return res.status(400).json({ error: { message: "Empty fields are not allowed" } })
    }
    //check user
    if (!req.body.user) {
      return res.status(400).json({ error: { message: "User not Authenticated" } });
    }
    //Check password with confirm password
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: { message: "Wrong password confirmation!" } });
    }
    //Check if password length 
    if(newPassword.length < 6){
      return res.status(400).json({ error: { message: "Password length should be greater than 6!" } });
    }
    //Compare oldPassword.
    const isValid = await bcrypt.compare(oldPassword, req.body.user.password);
    if (!isValid) {
      return res.status(400).json({ error: { message: "Wrong Old password!" } });
    }
    //If everything checks out save the updates
    //Hash the new Password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const changedUser = await User.findOneAndUpdate(
      { _id: req.body.user._id },
      {
        password: hashedPassword
      }
    )

    return res.status(200).json({
      message: 'Password changed successfully!'
    })

  } catch (error) {
    return res.status(400).json({ error: { message: "Error while changing password", err: error.message } });
  }
};

//Forgot Password
const userForgotPassVerifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    const user: IUserDocument = await User.findOne({email,});

    if(!user) return res.status(400).json({ error: { message: "User doesn't exits with that Email." } });

    //Verify the user is the owner of the Email | OTP
    const otpVerification = await verifyUserAndOtp({email, otp})

    if(!otpVerification.isValid){
      return res.status(400).json({ error: otpVerification.errors })
    }

    const salt = await bcrypt.genSalt();
    const resetToken = await bcrypt.hash(otp, salt);
    user.resetToken = resetToken
    await User.findByIdAndUpdate(user._id, {...user})
    return res.status(200).json({
      email: email,
      otp: otp,
      message: 'OTP verified successfully',
    });
  }
  catch (err) {
    return res.status(400).json({ error: "Wrong User credentials sent." }).end();
  }
}

const forgotChangePassword = async (req: Request, res: Response) => {
  // Take user input from req body 
  const { email, newPassword, confirmPassword, otp } = req.body
  try {
    if (!email || !otp || !newPassword || !confirmPassword || otp === "" || newPassword === "" || confirmPassword == "" || email === "") {
      return res.status(400).json({ error: { message: "Empty fields are not allowed" } })
    }
    //Check password with confirm password
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: { message: "Wrong password confirmation!" } });
    }
    //Check if password length 
    if(newPassword.length < 6){
      return res.status(400).json({ error: { message: "Password length should be greater than 6!" } });
    }
    //Compare otp.
    const user = await User.findOne({email,})
    const isValid = await bcrypt.compare(otp, user.resetToken);

    if (!isValid) {
      return res.status(400).json({ error: { message: "Wrong OTP verification code sent!" } });
    }
    //If everything checks out save the updates
    //Hash the new Password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const changedUser = await User.findOneAndUpdate(
      { _id: user._id },
      {
        password: hashedPassword,
        resetToken: ""
      }
    )

    return res.status(200).json({
      message: 'Password changed successfully!'
    })
  } catch (error) {
    return res.status(400).json({ error: { message: "Error while changing password", err: error.message } });
  }
};

//CurrentUser
const currentUser = (req: Request, res:Response) => {
  let token = req.headers['authorization'] || req.body.token || req.headers.cookie?.split('=')[1] || req.cookies?.jwt;

  if (token) {
    const bearer = token.split(' ');
    if(bearer.length == 2){
      token = bearer[1];
    }else{
      token = bearer[0];
    }
    jwt.verify(token, jwtSecret, async (err, decodedToken) => {
      if (err) {
        return res.status(400).json({ error: "User should be authenticated", message: "User not authenticated. The token sent is bad or expired."}).end();
      } else {
        let user = await User.findById(decodedToken.id._id).populate("avatar").lean().exec();
        if(!user){
          return res.status(400).json({ error: "User should be authenticated",  message: "User not authenticated or token sent is bad or expired." }).end();
        }

        return res.status(200).json({
          message: "User data retrieved successfully!",
          data: user
        });

      }
    });
  } else {
      return res.status(400).json({ error:"User not authenticated!", message: "user must be authenticated"}).end();
  }
};

const logoutUser = async (req, res) => {
  try {
    return res.cookie('jwt', '', { maxAge: 1 }).header('token', "").status(201).json({
      status: "Logged out",
      message: "User logged out successfully!"
    }).end();
  } catch (error) {
    return res.status(400).json({ error: "Error while logging out!", message: "could not logout user"}).end();
  }
}

const UserControllers = { userLogin, userSignup, logoutUser, changePassword, sendOtpVerificationEmail, resendOtpVerification, forgotChangePassword, userForgotPassVerifyOTP,currentUser }
export default UserControllers