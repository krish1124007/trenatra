const username  = document.getElementById('username');
const password = document.getElementById('password');
const email = document.getElementById('email');
const signup = document.getElementById('signup');
const signin = document.getElementById("signin");
const error_message = document.getElementById('error_message');
const login_username = document.getElementById("login-username");
const login_password = document.getElementById("login-password")


async function register()
{
    
    const userdata ={
        username:username.value,
        password:password.value,
        email:email.value
    }
    // console.log(data)
    startLoading();
    
      const {data} = await axios.post("http://localhost:8000/user/register",userdata)
      stopLoading();
      console.log(data)
    
      if(!data.success)
      {
        console.log(!error.response.data.data.success)
        error_message.innerText = "this username is already exist"


      }
      window.location.href = "..home/home.html";

    
    

}
async function login()
{
  const userdata = {
    username:login_username.value,
    password:login_password.value
  }
  localStorage.setItem("vrfemail" , login_username)
  startLoading();
  const {data} = await axios.post("http://localhost:8000/user/login" ,userdata);
  console.log(data)
  stopLoading();
  if(!data.success)
  {

    document.getElementById("login_warning").innerText = data.message
      
  }
  window.location.href = "../verify/vrf.html";
  
  
}

signup.addEventListener("click" ,  register)
signin.addEventListener("click" , login)

  
