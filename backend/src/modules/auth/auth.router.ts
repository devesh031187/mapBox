import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate.js";
import { changePasswordSchema, loginSchema } from "./auth.schema.js";
import * as authController from "./auth.controller.js";

const router = Router();

router.post("/login", validate({ body: loginSchema }), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.me);
router.patch(
  "/change-password",
  authenticate,
  validate({ body: changePasswordSchema }),
  authController.changePassword
);

export default router;
