import { Router } from "express";
import * as controller from "./location.controller";

const router = Router();

router.get("/locations", controller.listLocations);

export default router;
