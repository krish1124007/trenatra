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
router.route("/:id").get(getMachinesDetails);
router.route("/train/:id").get(startTraning);
router.route("/livedata/:id").post(startLive)

const machine_router = router;

export {machine_router}