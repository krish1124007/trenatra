import {
    addMachine,
    updateMachine,
    deleteMachine,
    getAllMachines,
    getMachinesDetails,
    startTraining,
    startLive
} from "../controllers/machine.controller.js"

import {Router} from "express";

const router = Router();

router.route("/createmachine").post(addMachine);
router.route("/deletemachine").post(deleteMachine);
router.route("/getallmachines").get(getAllMachines);
router.route("/livedata").get(startLive)
router.route("/updatemachine/:id").post(updateMachine);
router.route("/getmachine/:id").get(getMachinesDetails);
router.route("/train/:id").get(startTraining);

const machine_router = router;

export {machine_router}