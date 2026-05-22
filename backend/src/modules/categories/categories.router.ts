import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { validate } from "../../middleware/validate.js";
import { createCategorySchema, updateCategorySchema } from "./categories.schema.js";
import * as ctrl from "./categories.controller.js";

const router = Router();
router.use(authenticate);

router.get("/tree", ctrl.listTree);
router.get("/flat", ctrl.listFlat);
router.get("/:id", ctrl.getOne);
router.post("/", authorize("ADMIN", "STORE_MANAGER"), validate({ body: createCategorySchema }), ctrl.create);
router.put("/:id", authorize("ADMIN", "STORE_MANAGER"), validate({ body: updateCategorySchema }), ctrl.update);
router.delete("/:id", authorize("ADMIN"), ctrl.remove);

export default router;
