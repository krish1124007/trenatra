import axios from "axios";

let runtime = 0;
let sendCount = 0;

// Base values
const baseTemperature = 75;
const baseVibration = 2.5;
const basePressure = 100;

// Track when to send anomaly
function shouldInjectAnomaly() {
  return sendCount % 10 === 0 && sendCount !== 0;
}

function generateMachineData() {
  sendCount++;
  runtime += Math.random() * 1.5; // simulate runtime increase

  // Small variations
  let temperature = baseTemperature + (Math.random() * 2 - 1); // small variation around baseTemperature
  let vibration = baseVibration + (Math.random() * 0.5 - 0.25); // small variation around baseVibration
  let pressure = basePressure + (Math.random() * 3 - 1.5); // small variation around basePressure

  // Inject anomaly every 10th send
  if (shouldInjectAnomaly()) {
    console.log("🚨 Injecting anomaly!");
    temperature += Math.random() > 0.5 ? 20 : -20;
    vibration += Math.random() > 0.5 ? 5 : -5;
    pressure += Math.random() > 0.5 ? 30 : -30;
  }
  
  return {data:[
    [temperature.toFixed(2), vibration.toFixed(2), pressure.toFixed(2), runtime.toFixed(2)]

  ]}
}

export {generateMachineData}
