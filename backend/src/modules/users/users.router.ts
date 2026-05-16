import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { validate } from "../../middleware/validate.js";
import {
  createUserSchema,
  updateStatusSchema,
  updateUserSchema,
} from "./users.schema.js";
import * as usersController from "./users.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", authorize("ADMIN", "GM_DIRECTOR"), usersController.list);
router.get("/:id", authorize("ADMIN", "GM_DIRECTOR"), usersController.getOne);
router.post(
  "/",
  authorize("ADMIN"),
  validate({ body: createUserSchema }),
  usersController.create
);
router.put(
  "/:id",
  authorize("ADMIN"),
  validate({ body: updateUserSchema }),
  usersController.update
);
router.patch(
  "/:id/status",
  authorize("ADMIN"),
  validate({ body: updateStatusSchema }),
  usersController.setStatus
);

export default router;
