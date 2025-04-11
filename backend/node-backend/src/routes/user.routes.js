import { Router } from "express"
import {
    loginUser,
    registerUser,
    verifyOtp,
    getProfile
} from "../controllers/user.controller.js"

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
// router.route("/logout").post();
router.route("/verifyotp").post(verifyOtp);
router.route("/getprofile").get(getProfile);

export const user_route = router;
