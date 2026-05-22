import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { validate } from "../../middleware/validate.js";
import { createStorageLocationSchema, updateStorageLocationSchema } from "./storage-locations.schema.js";
import * as ctrl from "./storage-locations.controller.js";

const router = Router();
router.use(authenticate);

router.get("/", ctrl.list);
router.get("/:id", ctrl.getOne);
router.post("/", authorize("ADMIN", "STORE_MANAGER"), validate({ body: createStorageLocationSchema }), ctrl.create);
router.put("/:id", authorize("ADMIN", "STORE_MANAGER"), validate({ body: updateStorageLocationSchema }), ctrl.update);
router.delete("/:id", authorize("ADMIN"), ctrl.remove);

export default router;
