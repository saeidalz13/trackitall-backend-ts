import { Router } from "express";
import { homeController } from "../controllers/home";
import { authController } from "../controllers/auth";
import { Urls } from "./urls";

const router = Router();

router.get(Urls.HOME, homeController.getHome);

router.post(Urls.SIGNUP, authController.postSignup);


export default router;
