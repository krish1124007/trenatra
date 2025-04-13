let runtime = 0;

function generateMachineData() {
  // Base values with realistic variations
  const baseTemp = 45 + (Math.random() * 10 - 5);
  const baseVib = 2.5 + (Math.random() * 0.5 - 0.25);
  const basePress = 100 + (Math.random() * 10 - 5);
  
  runtime += 0.1 + (Math.random() * 0.3);
  
  // 5% chance of anomaly
  const injectAnomaly = Math.random() < 0.05;
  
  let temperature = baseTemp;
  let vibration = baseVib;
  let pressure = basePress;
  
  if (injectAnomaly) {
    // Random anomaly type
    const anomalyType = Math.floor(Math.random() * 3);
    switch(anomalyType) {
      case 0: temperature += 20 + (Math.random() * 10); break;
      case 1: vibration += 3 + (Math.random() * 2); break;
      case 2: pressure += Math.random() > 0.5 ? 30 : -30; break;
    }
  }
  
  return [
    parseFloat(temperature.toFixed(2)),
    parseFloat(vibration.toFixed(2)),
    parseFloat(pressure.toFixed(2)),
    parseFloat(runtime.toFixed(2))
  ];
}

export { generateMachineData };