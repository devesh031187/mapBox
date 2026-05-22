import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { validate } from "../../middleware/validate.js";
import { createItemSchema, updateItemSchema } from "./items.schema.js";
import * as ctrl from "./items.controller.js";

const router = Router();
router.use(authenticate);

router.get("/below-reorder", ctrl.belowReorder);
router.get("/", ctrl.list);
router.get("/:id", ctrl.getOne);
router.get("/:id/stock-ledger", ctrl.getStockLedger);
router.post("/", authorize("ADMIN", "STORE_MANAGER"), validate({ body: createItemSchema }), ctrl.create);
router.put("/:id", authorize("ADMIN", "STORE_MANAGER"), validate({ body: updateItemSchema }), ctrl.update);

export default router;
