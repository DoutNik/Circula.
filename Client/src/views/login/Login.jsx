/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import Logo from '../../assets/locan.png'
import { useState } from 'react'
import style from './Login.module.css'
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { auth } from "../../firebase.js";
import axios from "axios";
import Swal from 'sweetalert2'; 

//import LoginButton from '../../components/logButtons/LoginButton';

const Login = ({ setAuth, userData }) => {
  const [input, setInput] = useState({
    username: "",
    password: "",
  });

  const [error, setErrors] = useState("")


  const handleInputChange = (e) => {
    setInput({
      ...input,
      [e.target.name]: e.target.value,
    })
    
  }

  const handleSumbit = async (e) => {
  e.preventDefault();

  try {
    let loginUser = {
      username: input.username,
      password: input.password,
    };

    // 1️⃣ Llamás al backend para autenticar
    const response = await axios.post("/users/login", loginUser);

    if (response.data && response.data.token && response.data.firebaseToken) {
      // 2️⃣ Guardás tu JWT local
      localStorage.setItem("token", response.data.token);

      // 3️⃣ Iniciás sesión en Firebase con el Custom Token
      await signInWithCustomToken(auth, response.data.firebaseToken);

      // 4️⃣ Seteás estado global
      setAuth(true, response.data.usuario);

      // 5️⃣ Notificación
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Login exitoso",
        showConfirmButton: false,
        timer: 1000,
        timerProgressBar: true,
      });

    } else {
      setErrors("Usuario o contraseña incorrectos");
    }
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    setErrors("Usuario o contraseña incorrectos");
  }
};

  return (
    <div className={style.container}>
      <img src={Logo}/>
        <div>
          <h2>Iniciar sesión</h2>
        </div>
        <div className={style.form}>
          <form>
              <div>
                <input type="text" name="username" placeholder='Usuario' onChange={handleInputChange}
                  value={input.username}/>
              </div>
              <div>
                <input type="password"name="password" placeholder='Contraseña'onChange={handleInputChange}
                  value={input.password}/>
              </div>
              
              {error && <div className={style.error}>{error}</div> }
              <button onClick={handleSumbit} className={style.iniciar}>Iniciar sesión</button>
          </form>
        </div>

        <div className={style.buttons}>
          <span>
          ¿No tienes una cuenta? 
          <Link to='/register' className={style.register}>Regístrate</Link>
          </span>
        </div>

        {/* <div className={style.buttons}>
          <span>
          o 
          <LoginButton/>
          </span>
        </div> */}
        <div className={style.buttons}>
          <span className={style.recover}>
          ¿Olvidaste la contraseña? 
          <Link to='/forgotpassword' className={style.register}>Recuperar</Link>
          </span>
        </div>
    </div>
    
  )
}

export default Login