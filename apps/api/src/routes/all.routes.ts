import {Router} from 'express';
import {signupHandler, signinHandler} from "../controllers/auth.routes";
import {redirectHandler} from "../controllers/redirect.routes"
import {createLink} from "../controllers/link.routes";

import {rateLimitMiddleware} from "../middlewares/rateLimit.middleware"
import {authMiddleware} from "../middlewares/auth.middleware";

const router :Router = Router();


router.post("/api/v1/signup",signupHandler);
router.post("/api/v1/signin", signinHandler);

router.post("/api/v1/link",authMiddleware,rateLimitMiddleware, createLink);

router.get("/:shortcode", redirectHandler)

export default router;
