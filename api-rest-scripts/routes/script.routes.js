import express from 'express';
import { scriptHandlers } from "../controllers/script.Controller.js";

var router = express.Router();

router.post('/execute_vpn', scriptHandlers.execute_vpn);

export default router;