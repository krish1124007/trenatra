import { machine } from "../models/machines.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { generateMachineData } from "../../machine_data.generater.js";
import axios from "axios";
import {mongoose} from "mongoose"


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
  
  const machine_data = await machine.findById(id);

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

const startTraining = asyncHandler(async (req, res) => {
  const id = req.params.id;
  let trainingCompleted = false;
  
  // Clear any existing interval
  if (req.intervalId) {
    clearInterval(req.intervalId);
  }

  // Send initial response
  res.status(202).json({
    success: true,
    message: 'Training started. 30 samples will be collected.'
  });

  let samplesSent = 0;
  const intervalId = setInterval(async () => {
    if (samplesSent >= 10 && !trainingCompleted) {
      clearInterval(intervalId);
      trainingCompleted = true;
      
      try {
        // Get all training data
        const response = await axios.get('http://localhost:5000/api/ml/get_all_data');
        
        if (!response.data?.success || !Array.isArray(response.data.data?.samples)) {
          throw new Error('Invalid training data format');
        }

        // Save to database
        const updatedMachine = await machine.findByIdAndUpdate(
          id,
          {
            machine_train_data: JSON.stringify(response.data.data.samples),
            machine_traine: true,
            training_status: 'completed'
          },
          { new: true, upsert: true }
        );

        console.log('✅ Training data saved to DB:', updatedMachine._id);
      } catch (err) {
        console.error('❌ DB Save Error:', err.message);
        await machine.findByIdAndUpdate(
          id,
          { training_status: 'failed', error: err.message },
          { new: true }
        );
      }
      return;
    }

    if (samplesSent < 30) {
      samplesSent++;
      const machineData = generateMachineData();
      
      try {
        await axios.post('http://localhost:5000/api/ml/train_model', {
          temperature: machineData[0],
          vibration: machineData[1],
          pressure: machineData[2],
          runtime: machineData[3]
        });
        console.log(`📤 Sent sample ${samplesSent}/30`);
      } catch (err) {
        console.error(`❌ Failed sample ${samplesSent}:`, err.message);
      }
    }
  }, 2000);

  // Store interval ID for cleanup
  req.intervalId = intervalId;
});

const startLive = asyncHandler(async (req, res) => {
  
  // Start monitoring
 
    try {
      const machineData = generateMachineData();
      const response = await axios.post('http://localhost:5000/api/ml/check', {
        data: machineData
      });

      if (response.data.success) {
        
          return res.status(200)
          .json(
            new ApiResponse(200,{succes:true , data:{ values: machineData,
              isAnomaly: response.data.data.is_anomaly}},"fetch successfully")
          )}

        if (response.data.data.is_anomaly) {
          console.warn('🚨 ANOMALY DETECTED!', machineData);
        }
      
    } catch (err) {
      console.error('Live monitoring error:', err.message);
      clearInterval(liveInterval);
    }
 

});




export {
  addMachine,
  updateMachine,
  deleteMachine,
  getAllMachines,
  getMachinesDetails,
  startTraining,
  startLive
}