import { machine } from "../models/machines.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { generateMachineData } from "../../machine_data.generater.js";
import axios from "axios";


const addMachine = asyncHandler(async (req, res) => {
  try {
    const newMachine = new machine(req.body);
    const savedMachine = await newMachine.save();
    return res.status(200)
      .json(
        new ApiResponse(201, { success: true, data: savedMachine }, "Machine Add Successfully")
      )
  } catch (error) {
    return res.status(400)
      .json(
        new ApiResponse(400, { success: true, data: error }, "something error come while creating the machine")
      )
  }
})

const updateMachine = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await machine.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return res.status(404).json({ message: "Machine not found" });
    }
    return res.status(200)
      .json(
        new ApiResponse(201, { success: true, data: updated }, "update the machine sucessfully")
      )
  } catch (error) {
    return res.status(400)
      .json(
        new ApiResponse(400, { success: false, data: error }, "Error updating machine")
      )
  }
})

const deleteMachine = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await machine.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(400)
        .json(
          new ApiResponse(400, { success: false, data: "Machine not found" }, "Machine not found")
        )
    }
    return res.status(200)
      .json(
        new ApiResponse(200, { success: true, data: "Machine deleted successfully" }, "Machine deleted successfully")
      )
  } catch (error) {
    return res.status(400)
      .json(
        new ApiResponse(400, { success: false, data: "Error deleting machine" }, "Error deleting machine")
      )
  }
})

const getAllMachines = asyncHandler(async (req, res) => {
  const allMachines = await machine.find({});

  return res.status(200)
    .json(
      new ApiResponse(201, { success: true, data: allMachines }, "all machnies data is fetch")
    )
})

const getMachinesDetails = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const machine_data = await machine.findOne({ _id: id });

  if (!machine_data) {
    return res.status(400)
      .json(
        new ApiResponse(400, { succes: false, data: "no data is found" }, "no data is found")
      )
  }
  return res.status(200)
    .json(
      new ApiResponse(200, { succes: true, data: machine_data }, "fetch sucessfully")
    )
})


const startTraning = asyncHandler(async (req, res) => {
  const id = req.params.id;
  let i = 0;
  const settime = setInterval(async () => {
    if (i == 30) {
      clearInterval(settime)
    }
    i++;
    const machineData = generateMachineData();
    try {
      // Sending data to Flask endpoint for anomaly detection and training
      const response = await axios.post('http://localhost:5000/api/ml/train_model', machineData);
      console.log("✅ Machine data sent", response.data);
    } catch (err) {
      console.error("❌ Failed to send data:", err);
    }
  }, 2000);

  const train_data = await axios.get("http://localhost:5000/api/ml/get_all_data");

  if (!train_data.data || !Array.isArray(train_data.data.data)) {
    return res.status(500).json({ success: false, message: "Training data is not in expected format" });
  }

  // Store the array as a string (JSON)
  const machine_Data = await machine.findByIdAndUpdate(
    id,
    {
      machine_train_data: JSON.stringify(train_data.data.data),
      machine_traine: true // mark machine as trained
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: "Machine training data updated successfully",
    data: machine_Data
  });

})

const startLive = asyncHandler(async (req, res) => {
  const id = req.params.id;
  let count = 0;

  const settime = setInterval(async() => {
    if(count==1)
    {
      clearInterval(settime)
    }
    count++;
    const machineData = generateMachineData();
    const data_check = await axios.get("http://localhost:5000/api/ml/check", {data:[machineData]})

    return res.status(200)
    .json(
      new ApiResponse(200,{success:true , data:data_check},"data send sucessfully")
    )
  }, 2000);
});


export {
  addMachine,
  updateMachine,
  deleteMachine,
  getAllMachines,
  getMachinesDetails,
  startTraning,
  startLive
}