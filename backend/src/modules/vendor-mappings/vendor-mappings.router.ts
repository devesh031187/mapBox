import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { validate } from "../../middleware/validate.js";
import { createMappingSchema, updateMappingSchema } from "./vendor-mappings.schema.js";
import * as ctrl from "./vendor-mappings.controller.js";

const router = Router();
router.use(authenticate);

router.get("/", ctrl.list);
router.get("/:id", ctrl.getOne);
router.post("/", authorize("ADMIN", "STORE_MANAGER"), validate({ body: createMappingSchema }), ctrl.create);
router.put("/:id", authorize("ADMIN", "STORE_MANAGER"), validate({ body: updateMappingSchema }), ctrl.update);
router.delete("/:id", authorize("ADMIN"), ctrl.remove);

export default router;
