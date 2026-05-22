import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { validate } from "../../middleware/validate.js";
import { createVendorSchema, updateVendorSchema, updateVendorStatusSchema } from "./vendors.schema.js";
import * as ctrl from "./vendors.controller.js";

const router = Router();
router.use(authenticate);

router.get("/", ctrl.list);
router.get("/:id", ctrl.getOne);
router.get("/:id/performance", ctrl.getPerformance);
router.get("/:id/items", ctrl.getItems);
router.post("/", authorize("ADMIN", "STORE_MANAGER"), validate({ body: createVendorSchema }), ctrl.create);
router.put("/:id", authorize("ADMIN", "STORE_MANAGER"), validate({ body: updateVendorSchema }), ctrl.update);
router.patch(
  "/:id/status",
  authorize("ADMIN"),
  validate({ body: updateVendorStatusSchema }),
  ctrl.setStatus
);

export default router;
