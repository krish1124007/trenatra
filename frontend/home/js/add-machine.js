// Handle form submission
const addMachineForm = document.querySelector('.add-machine-form');

if (addMachineForm) {
  addMachineForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const machineData = {
      machine_name: document.getElementById('machineName').value,
      machine_model: document.getElementById('machineModel').value,
      serial_number: document.getElementById('serialNumber').value,
      last_service_date: document.getElementById('lastServiceDate').value,
      machine_comfort_parameters: [{
        temp: document.getElementById('temperature').value || undefined,
        vibration: document.getElementById('vibration').value || undefined,
        power_usage: document.getElementById('powerUsage').value || undefined,
        avarage_runtime: document.getElementById('averageRuntime').value
      }]
    };
    
    
    const {data} = await axios.post("http://localhost:8000/machine/createmachine",machineData);
    console.log(data)
    alert("Machine added successfully!")
    // Clear form
    addMachineForm.reset();
    
  });
}