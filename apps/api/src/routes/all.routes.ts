import {Router} from 'express';
import {signupHandler, signinHandler, googleSigninHandler} from "../controllers/auth.routes";
import {redirectHandler} from "../controllers/redirect.routes"
import {createLink, getLinks, deleteLink} from "../controllers/link.routes";

import {rateLimitMiddleware} from "../middlewares/rateLimit.middleware"
import {authMiddleware} from "../middlewares/auth.middleware";

const router :Router = Router();


router.post("/api/v1/signup",signupHandler);
router.post("/api/v1/signin", signinHandler);
router.post("/api/v1/oauth/google", googleSigninHandler);

router.post("/api/v1/link",authMiddleware,rateLimitMiddleware, createLink);
router.get("/api/v1/links", authMiddleware, getLinks);
router.delete("/api/v1/link/:id", authMiddleware, rateLimitMiddleware, deleteLink);

router.get("/:shortcode", redirectHandler)

export default router;
