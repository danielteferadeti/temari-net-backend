import { Router } from "express";
import UserControllers from "../controllers/user";
import isAuthenticated from "../middlewares/authenticate";
import multipleUpload from "../middlewares/multipleUpload";

const router = Router();

router.post("/login", UserControllers.userLogin);
router.post("/signup", multipleUpload, UserControllers.userSignup);
router.post("/userChangePassword", isAuthenticated, UserControllers.changePassword);
router.post("/forgotChangePassword", UserControllers.forgotChangePassword);
router.get("/logout", isAuthenticated, UserControllers.logoutUser);
router.post("/sendOTPCode", UserControllers.sendOtpVerificationEmail);
router.post("/reSendOTPCode", UserControllers.resendOtpVerification);
router.post("/forgotPassVerifyOTP", UserControllers.userForgotPassVerifyOTP);
router.get("/currentUser", isAuthenticated, UserControllers.currentUser);


export default router;