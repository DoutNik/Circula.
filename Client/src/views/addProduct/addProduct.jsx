/* eslint-disable no-unused-vars */
// eslint-disable react/prop-types */
import React, { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import Header from "../../components/header/Header";
import style from "./AddProduct.module.css";
import api from "../../api/api";
import { useNavigate } from "react-router-dom";
import { validateDescription, validateTitle } from "./validation";
import Swal from "sweetalert2";

export default function AddProduct({ userData }) {
  const { id } = userData;
  const navigate = useNavigate();

  //Configuración de la biblioteca para cargar imagenes.
  const thumbsContainer = {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 15,
    justifyContent: "center",
  };

  const img = {
    display: "block",
    borderRadius: 5,
    width: 60,
    height: 60,
    marginRight: 5,
  };

  // Constantes para Cloudinary.

  const preset_key = "postsimages";
  const cloud_name = "dsc4kqz3g";
  const folderName = "postimages";

  const [files, setFiles] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [errors, setErrors] = useState({});

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (files.length + acceptedFiles.length > 3) {
        Swal.fire({
          title: "¡Límite de imágenes alcanzado!",
          text: "No puedes cargar más de 3 imágenes.",
          icon: "warning",
        });
        return;
      }

      const updatedFiles = [...files, ...acceptedFiles];
      setFiles(updatedFiles);
    },
    [files],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 3,
    maxSize: 5 * 1024 * 1024, // 5MB
    accept: { "image/*": [] },
  });

  useEffect(() => {
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, []);

  //Menejo de la API para obtener las provincias y las localidades.
  const [provinces, setProvinces] = useState([]);
  const [localities, setLocalities] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [localidad, setSelectedLocalidad] = useState("");
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
  };
  const sortedProvinces = provinces.sort((a, b) => {
    return a.nombre.localeCompare(b.nombre);
  });

  const sortedLocalities = localities.sort((a, b) => {
    return a.nombre.localeCompare(b.nombre);
  });

  //Manejo de las categorías.
  const [selectedCategory, setSelectedCategory] = useState("");
  const categories = [
    "🧁 Alimentos",
    "⚱️ Antiguedades",
    "🎨 Arte y artesanías",
    "⚽️ Articulos deportivos",
    "📺 Audio y video",
    "📷 Cámaras y accesorios",
    "📱 Celulares",
    "💻 Computadoras",
    "🔌Electrodomésticos",
    "🛠️ Herramientas",
    "🎸 Instrumentos musicales",
    "💍 Joyas y relojes",
    "🪑 Muebles y hogar",
    "🚗 Rodados con motor",
    "🚲 Rodados sin motor",
    "👕 Ropa e indumentaria",
    "🛒 Varios",
    "🎮 Videojuegos",
  ];

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null,
    ubication: "",
    category: "",
    disabled: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    let error = "";

    if (name === "title") {
      error = validateTitle(value);
    } else if (name === "description") {
      error = validateDescription(value);
    }
    setErrors({ ...errors, [name]: error });
  };

  const handleFile = (event) => {
    const selectedFiles = event.target.files;

    if (files.length + selectedFiles.length > 3) {
      Swal.fire({
        title: "¡Límite de imágenes alcanzado!",
        text: "Solo puedes subir un máximo de 3 imágenes.",
        icon: "warning",
      });
      return;
    }

    const updatedFiles = [...files, ...selectedFiles];
    setFiles(updatedFiles);
  };

  const handleDeleteImage = (event, index) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1); // Eliminar el archivo del estado
    setFiles(updatedFiles);

    const updatedIndices = [...selectedIndices];
    updatedIndices.splice(index, 1); // Eliminar el índice de la lista de selección
    setSelectedIndices(updatedIndices);
  };

  // Función que se ejecuta al darle 'Crear Post'.

  const handleSubmit = async (e) => {
    e.preventDefault();
      const signRes = await api.get("posts/cloudinary/signature");


    setFormData({
      ...formData,
      disabled: true,
    });

    // Subir imágenes a Cloudinary y obtener las URLs.
    const uploadPromises = files.map(async (file) => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", signRes.data.apiKey);
        formData.append("timestamp", signRes.data.timestamp);
        formData.append("signature", signRes.data.signature);
        formData.append("folder", "postimages");
        

        const res = await api.post(
          `https://api.cloudinary.com/v1_1/${signRes.data.cloudName}/image/upload`,
          formData,
        );

        // Optimización automática
        return res.data.secure_url.replace(
          "/upload/",
          "/upload/q_auto,f_auto/",
        );
      } catch (error) {
        console.error("Error al subir imagen:", error);
        return null;
      }
    });

    const imageUrls = await Promise.all(uploadPromises);
    const errors = {};

    const titleError = validateTitle(formData.title);
    if (titleError) {
      errors.title = titleError;
    }

    const descriptionError = validateDescription(formData.description);
    if (descriptionError) {
      errors.description = descriptionError;
    }

    if (
      formData.title.trim() === "" ||
      imageUrls.length === 0 || // Reemplaza imageUrls2 por imageUrls
      selectedProvince === "" ||
      localidad === "" ||
      selectedCategory === ""
    ) {
      Swal.fire({
        title: "Campos obligatorios",
        text: "Todos los campos marcados con * son obligatorios.",
        icon: "warning",
      });
      setFormData({
        ...formData,
        disabled: false,
      });
      return;
    }
    setErrors(errors);

    const errorKeys = Object.keys(errors);

    if (errorKeys.length > 0) {
      const errorMessage = errorKeys.map((key) => {
        if (key === "requiredFields") {
          return errors[key];
        }
        return `Hay un error en el campo ${key}`;
      });

      Swal.fire({
        title: "Errores en el formulario",
        text: errorMessage.join("\n"),
        icon: "error",
      });
      setFormData({
        ...formData,
        disabled: false,
      });
      return;
    }

    // Filtrar los resultados nulos, en caso de que haya habido errores.
    const validImageUrls = imageUrls.filter((url) => url !== null);

    // Guardar las URLs seguras de las imágenes en el estado.
    setImageUrls(validImageUrls);

    // Creación de la publicación.
    try {
      const newPost = {
        title: formData.title,
        description: formData.description,
        image: validImageUrls,
        ubication: `${selectedProvince}, ${localidad}`,
        category: selectedCategory,
        UserId: id,
      };

      const response = await api.post("/posts/", newPost);

      if (response) {
        Swal.fire({
          icon: "success",
          title: "🎉 ¡Hecho! 🎉",
          html: "<p>Tu publicación ha sido creada correctamente. Puedes verla en tu perfil o visualizarla en el inicio.</p>",
          allowOutsideClick: false,
        }).then(() => {
          navigate("/login");
        });

        setFiles([]);
        setSelectedCategory("");
        setSelectedLocalidad("");
        setSelectedProvince("");
        setFormData({
          title: "",
          description: "",
          disabled: false,
        });
      } else {
        console.log("Hubo un error al crear la publicación.");
      }
    } catch (error) {
      console.error("Error al enviar los datos al servidor:", error);
      console.log("Hubo un error al crear la publicación.");

      const handlePremium = async () => {
        try {
          let paymentData;

          if (userData) {
            paymentData = {
              userId: userData.id,
              title: "Premium",
              quantity: 1,
              currency_id: "ARS",
              description: "Usuario premium",
            };
          } else {
            paymentData = {
              userId: user.id,
              title: "Premium",
              quantity: 1,
              currency_id: "ARS",
              description: "Usuario premium",
            };
          }

          const response = await api.post("/plans/create-order", paymentData);

          if (response) {
            window.location.href = response.data.response.body.init_point;
          } else {
            console.error("Init point not found in the response");
          }
        } catch (error) {
          console.error("Error al realizar solicitud de compra", error);
        }
      };

      if (error.response && error.response.data && error.response.data.error) {
        const errorMessage = error.response.data.error;
        if (
          errorMessage ===
          "Solo los usuarios premium pueden tener mas de una publicacion a la vez!"
        ) {
          const payResponse = await Swal.fire({
            title: "¡Ups!",
            text: "Solo los usuarios premium pueden tener más de una publicación a la vez.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Hacerse Premium",
            cancelButtonText: "Cancelar",
            reverseButtons: true,
            preConfirm: () => {
              handlePremium(true);
            },
          });

          if (payResponse.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
              icon: "info",
              title: "Acción cancelada",
              text: "No te has vuelto Premium. Si decides hacerlo más tarde, ¡siempre estamos aquí!",
            });
          }
        } else {
          Swal.fire({
            icon: "warning",
            title: "Usuario Premium",
            text: errorMessage,
          });
        }
      } else {
        console.error("Error inesperado:", error);
      }

      setFormData({
        ...formData,
        disabled: false,
      });
    }
  };

  const Banner =
    "https://res.cloudinary.com/dlahgnpwp/image/upload/v1699885578/emailAssets/er00zffd102eyze13aug.jpg";
  const Banner2 =
    "https://res.cloudinary.com/dlahgnpwp/image/upload/v1699885578/emailAssets/cyzzxxg8vkfxaqzolq9m.jpg";

  return (
    <>
      <Header banner1={Banner} banner2={Banner2}></Header>
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.8,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        className={style.container}
      >
        <h3>Crear publicación</h3>
        <form className={style.create}>
          <div className={style.part1}>
            <label>
              Titulo*
              <input
                className={style.input}
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Inserte titulo"
                disabled={formData.disabled}
              />
              {errors.title && (
                <div className={style.errorMessage}>{errors.title}</div>
              )}
            </label>
            <label>
              Descripción
              <textarea
                className={style.input}
                type="text"
                name="description"
                onChange={handleChange}
                value={formData.description}
                placeholder="Inserte descripcion"
                disabled={formData.disabled}
              />
              {errors.description && (
                <div className={style.errorMessage}>{errors.description}</div>
              )}
            </label>
            <label>
              Imagen*
              <section className={style.files}>
                <div
                  className={style.dropzone}
                  {...getRootProps()}
                  onClick={(event) => event.stopPropagation()}
                  disabled={formData.disabled}
                >
                  <input {...getInputProps()} onChange={handleFile} />
                  {isDragActive
                    ? "Suelta tus archivos aquí"
                    : "Selecciona o arrastra tus archivos aquí"}
                </div>
                {files.length > 0 && (
                  <div style={thumbsContainer}>
                    {files.map((file, index) => (
                      <div key={index}>
                        <img
                          style={img}
                          src={URL.createObjectURL(file)}
                          alt={`Imagen ${index}`}
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(index)}
                        >
                          ✖️
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </label>
          </div>
          <div className={style.part2}>
            <label>Provincia*</label>
            <select
              onChange={handleProvinceChange}
              disabled={formData.disabled}
            >
              <option value="Elige una provincia">Provincia</option>
              {sortedProvinces.map((province) => (
                <option key={province.id} value={province.nombre}>
                  {province.nombre}
                </option>
              ))}
            </select>
            <span></span>
            <label>Localidad*</label>
            <select
              id="selectLocalidades"
              onChange={handleLocalidadChange}
              disabled={formData.disabled}
            >
              <option value="Elige una localidad">Localidad</option>
              {sortedLocalities.map((locality) => (
                <option key={locality.id} value={locality.nombre}>
                  {locality.nombre}
                </option>
              ))}
            </select>
            <span></span>
            <label>Categoría*</label>
            <select
              name="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={formData.disabled}
            >
              <option value="Elige una categoría">Categoría</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <span></span>
          </div>
        </form>
        <button
          type="submit"
          onClick={handleSubmit}
          className={style.button}
          disabled={formData.disabled}
        >
          Crear
        </button>
        {formData.disabled && (
          <div className={style.loaderContainer}>
            <span>Cargando publicación...</span>
            <div className={style.loader}></div>
          </div>
        )}
        <h5 className={style.message}>Los campos con * son obligatorios</h5>
      </motion.div>
    </>
  );
}
