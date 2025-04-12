import {
    addMachine,
    updateMachine,
    deleteMachine,
    getAllMachines,
    getMachinesDetails,
    startTraning,
    startLive
} from "../controllers/machine.controller.js"

import {Router} from "express";

const router = Router();

router.route("/createmachine").post(addMachine);
router.route("/updatemachine").post(updateMachine);
router.route("/deletemachine").post(deleteMachine);
router.route("/getallmachines").get(getAllMachines);
router.route("/livedata").get(startLive)
router.route("/getmachine/:id").get(getMachinesDetails);
router.route("/train/:id").get(startTraning);

const machine_router = router;

export {machine_router}