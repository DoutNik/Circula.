import Logo from "../../assets/locan.png";
import React from "react";
import { useState, useEffect } from "react";
import style from "./Register.module.css";
import api from "../../api/api.js";
import {
  validateUsername,
  validateEmail,
  validatePassword,
  validateImageFile,
  validateProvince,
  validateLocalidad,
  validatePasswordRepeat,
} from "./validations";
import Swal from "sweetalert2";
import { auth } from "../../firebase.js"; // tu config de Firebase
import { signInWithCustomToken } from "firebase/auth";

const Register = ({ setAuth }) => {
  const [provinces, setProvinces] = useState([]);
  const [localities, setLocalities] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [localidad, setSelectedLocalidad] = useState("");

  // Constantes para Cloudinary.

  const preset_key = "userProfilePictures";
  const cloud_name = "dsc4kqz3g";

  const [imageError, setImageError] = useState(null);
  const [provinceError, setProvinceError] = useState(null);
  const [localidadError, setLocalidadError] = useState(null);
  const [errors, setErrors] = useState({
    username: null,
    password: null,
    email: null,
    image: null,
    province: null,
    localidad: null,
  });

  useEffect(() => {
    fetch("https://apis.datos.gob.ar/georef/api/provincias")
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((json) => {
        setProvinces(json.provincias);
      })
      .catch((error) => {
        console.error(
          `Error: ${error.status}: ${error.statusText || "Ocurrió un error"}`,
        );
      });
  }, []);

  const handleProvinceChange = (e) => {
    const selectedProvince = e.target.value;
    setSelectedProvince(selectedProvince);

    const provinceError = validateProvince(selectedProvince);
    setErrors({ ...errors, province: provinceError });
    setProvinceError(provinceError);

    fetch(
      `https://apis.datos.gob.ar/georef/api/localidades?provincia=${selectedProvince}&max=500`,
    )
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((json) => {
        setLocalities(json.localidades);
      })
      .catch((error) => {
        console.error(
          `Error al obtener las localidades: ${error.status}: ${
            error.statusText || "Ocurrió un error"
          }`,
        );
      });
  };
  const handleLocalidadChange = (e) => {
    const selectedLocalidad = e.target.value;
    setSelectedLocalidad(selectedLocalidad);

    const localidadError = validateLocalidad(selectedLocalidad);
    setErrors({ ...errors, localidad: localidadError });
    setLocalidadError(localidadError);
  };
  const sortedProvinces = provinces.sort((a, b) => {
    return a.nombre.localeCompare(b.nombre);
  });

  const sortedLocalities = localities.sort((a, b) => {
    return a.nombre.localeCompare(b.nombre);
  });

  const [input, setInput] = useState({
    username: "",
    password: "",
    repeatPassword: "",
    email: "",
    image: "",
    imageFile: null,
    disabled: false,
  });

  const [imageFile, setImageFile] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInput({
      ...input,
      [name]: value,
    });

    if (name === "username") {
      setErrors({ ...errors, username: validateUsername(value) });
    } else if (name === "email") {
      setErrors({ ...errors, email: validateEmail(value) });
    } else if (name === "password") {
      setErrors({ ...errors, password: validatePassword(value) });
    } else if (name === "repeatPassword") {
      setErrors({
        ...errors,
        repeatPassword: validatePasswordRepeat(value, input.password),
      });
    } else if (name === "image") {
      setErrors({ ...errors, image: validateImagen(value) });
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    // Limpiar estado anterior
    setImageError(null);
    if (!file) {
      setInput((prev) => ({ ...prev, image: "" }));
      setImageFile(null);
      return;
    }
    try {
      // Validar archivo real
      const validationError = await validateImageFile(file);
      if (validationError) {
        setImageError(validationError);
        setInput((prev) => ({ ...prev, image: "" }));
        setImageFile(null);
        // Limpiar input file para poder volver a seleccionar el mismo archivo
        event.target.value = "";
        return;
      }
      // Archivo válido → generar preview
      const imageUrl = URL.createObjectURL(file);
      setInput((prev) => ({ ...prev, image: imageUrl }));
      setImageFile(file);
      setImageError(null);
    } catch (error) {
      console.error("Error validando imagen:", error);
      setImageError("No se pudo validar la imagen seleccionada");
      setImageFile(null);
      setInput((prev) => ({ ...prev, image: "" }));
      event.target.value = "";
    }
  };

  const handleImageClear = () => {
    setInput({
      ...input,
      image: "",
    });
    setImageFile(null);
  };

  const handleSumbit = async (e) => {
    e.preventDefault();
    setInput({
      ...input,
      disabled: true,
    });

    if (
      !input.username ||
      !input.email ||
      !input.password ||
      !input.repeatPassword ||
      !input.image ||
      !selectedProvince ||
      !localidad
    ) {
      if (!input.image) {
        setImageError("Es necesario completar con una imagen.");
      } else {
        setImageError(null);
      }

      if (!selectedProvince) {
        setProvinceError("Es necesario seleccionar una provincia.");
      } else {
        setProvinceError(null);
      }

      if (!localidad) {
        setLocalidadError("Es necesario seleccionar una localidad.");
      } else {
        setLocalidadError(null);
      }
      Swal.fire({
        icon: "info",
        title: "Campos incompletos",
        html: "Todos los campos son obligatorios para completar el registro",
      });

      setInput({
        ...input,
        disabled: false,
      });
      return;
    }

    try {
      let secureUrl = "";

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", preset_key);

        const responseImage = await api.post(
          `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload/`,
          formData,
        );

        secureUrl = responseImage.data.secure_url;
      }

      let newUser = {
        username: input.username,
        password: input.password,
        email: input.email,
        image: secureUrl,
        ubication: `${selectedProvince}, ${localidad}`,
        origin: "DB",
      };

      const response = await api.post("/users/register", newUser);

      if (response) {
        // Guardar JWT local
        await localStorage.setItem("token", response.data.token);

        // 🔥 Loguear usuario en Firebase con el token personalizado
        await signInWithCustomToken(auth, response.data.firebaseToken);

        setAuth(true); // Actualizar estado de autenticación

        Swal.fire({
          icon: "success",
          title: "Registro exitoso",
          text: "¡Te has registrado exitosamente!",
        });
      } else {
        console.log("Hubo un error al crear el usuario.");
      }
    } catch (error) {
      console.error("Error al enviar los datos al servidor:", error);
      console.log("Hubo un error al crear el usuario.");

      // El backend manda el motivo real como texto plano en error.response.data
      // (por ejemplo: credenciales faltantes, email inválido, contraseña débil,
      // email/usuario ya registrado). Lo mostramos siempre en vez de un mensaje
      // genérico, para no tener que abrir la consola para enterarse.
      const backendMessage =
        typeof error.response?.data === "string"
          ? error.response.data
          : error.response?.data?.message || error.response?.data?.error;

      Swal.fire({
        icon: "error",
        title: "No se pudo completar el registro",
        text:
          backendMessage ||
          "Hubo un error al registrar el usuario. Por favor, inténtalo de nuevo.",
      });

      setInput({
        ...input,
        disabled: false,
      });
      return;
    }

    setInput({
      username: "",
      password: "",
      repeatPassword: "",
      email: "",
      image: "",
      imageFile: null,
      disabled: false,
    });
  };

  function isSubmitDisabled() {
    return Object.values(errors).some((error) => error !== null);
  }

  return (
    <div className={style.container}>
      <img src={Logo} className={style.logo} />
      <div className={style.title}>
        <h2>Regístrate</h2>
      </div>

      <div className={style.form}>
        <form onSubmit={handleSumbit}>
          <div>
            <input
              type="text"
              name="username"
              placeholder="Usuario"
              onChange={handleInputChange}
              value={input.username}
              disabled={input.disabled}
            />
            {errors.username && (
              <span className={style.error}>{errors.username}</span>
            )}
          </div>

          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleInputChange}
              value={input.email}
              disabled={input.disabled}
            />
            {errors.email && (
              <span className={style.error}>{errors.email}</span>
            )}
          </div>

          <div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Contraseña"
              onChange={handleInputChange}
              value={input.password}
              disabled={input.disabled}
            />
            {/* <input
              type="checkbox"
              id="showPassword"
              onChange={handleShowPassword}
              checked={showPassword}
            /> */}
            {errors.password && (
              <span className={style.error}>{errors.password}</span>
            )}
          </div>
          <div>
            <input
              type="password"
              name="repeatPassword"
              placeholder="Repetir contraseña"
              onChange={handleInputChange}
              value={input.repeatPassword} // Asegúrate de tener un valor inicial en el estado
              disabled={input.disabled}
            />
            {errors.repeatPassword && (
              <span className={style.error}>{errors.repeatPassword}</span>
            )}
          </div>
          {/* <input
              type="checkbox"
              id="showPassword"
              onChange={handleShowPassword}
              checked={showPassword}
            /> */}
          <div className={style.fileInput}>
            <input
              type="file"
              accept="image/*"
              name="image"
              onChange={handleFile}
              disabled={input.disabled}
            />
            {input.image && (
              <div className={style.imagePreview}>
                <img
                  src={input.image}
                  alt="Preview"
                  className={style.imgUser}
                />
                <button type="button" onClick={handleImageClear}>
                  {" "}
                  ✖️{" "}
                </button>{" "}
              </div>
            )}
            {/* {errors.image && <span className={style.error}>{errors.image}</span>} */}
            {imageError && <div className={style.error}>{imageError}</div>}
          </div>

          <select onChange={handleProvinceChange} disabled={input.disabled}>
            <option value="Elige una provincia">Provincia</option>
            {sortedProvinces.map((province) => (
              <option key={province.id} value={province.nombre}>
                {province.nombre}
              </option>
            ))}
          </select>
          {/* {errors.province && <span className={style.error}>{errors.province}</span>} */}
          {provinceError && <div className={style.error}>{provinceError}</div>}

          <select
            id="selectLocalidades"
            onChange={handleLocalidadChange}
            disabled={input.disabled}
          >
            <option value="Elige una localidad">Localidad</option>
            {sortedLocalities.map((locality) => (
              <option key={locality.id} value={locality.nombre}>
                {locality.nombre}
              </option>
            ))}
          </select>
          {/* {errors.localidad && <span className={style.error}>{errors.localidad}</span>} */}
          {localidadError && (
            <div className={style.error}>{localidadError}</div>
          )}

          <button
            className={
              isSubmitDisabled()
                ? `${style.register} ${style.buttonDisabled}`
                : style.register
            }
            disabled={isSubmitDisabled()}
            type="submit"
          >
            Enviar
          </button>
          {input.disabled && (
            <div className={style.loaderContainer}>
              <span>Creando usuario...</span>
              <div className={style.loader}></div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Register;
