const inputs = document.querySelectorAll('.code-inputs input');
const waring = document.getElementById("waring");

    inputs.forEach((input, index) => {
      input.addEventListener('input', () => {
        if (input.value && index < inputs.length - 1) {
          inputs[index + 1].focus();
        }
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && index > 0) {
          inputs[index - 1].focus();
        }
      });
    });

   async function submitCode() {
      const email = document.getElementById('email').value;
      const code = Array.from(inputs).map(input => input.value).join('');
      if (!email) {
        alert("Please enter your email!");
        return;
      }
      if (code.length < 6) {
        alert("Please enter the 6-digit code!");
        return;
      }
      const {data} = await axios.post("http://localhost:8000/user/verifyotp",{email:email,otp:code})
      console.log(data)
      if(!data.data.success){
           waring.innerText = data.message
           return false
      }
      localStorage.removeItem("vrfemail")
      console.log(data.data.data)
      localStorage.setItem("accesstoken" , data.data.data)
      window.location.href ="../home/html/home.html"
      // Send email and code to backend here
    }

   