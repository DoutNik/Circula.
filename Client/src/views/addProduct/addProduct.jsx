import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import Header from "../../components/header/Header";
import style from "./AddProduct.module.css";
import api from "../../api/api";
import { validateDescription, validateTitle } from "./validation";

const MAX_IMAGES = 3;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const categories = [
  "🧁 Alimentos",
  "🍹 Bebidas",
  "⚱️ Antiguedades",
  "🎨 Arte y artesanías",
  "⚽️ Articulos deportivos",
  "📺 Audio y video",
  "📷 Cámaras y accesorios",
  "📱 Celulares",
  "💻 Computadoras",
  "🔌 Electrodomésticos",
  "🛠️ Herramientas",
  "🎸 Instrumentos musicales",
  "💍 Joyas y relojes",
  "🪑 Muebles y hogar",
  "🚗 Rodados con motor",
  "🚲 Rodados sin motor",
  "👕 Ropa e indumentaria",
  "🎮 Videojuegos",
  "🛒 Varios",
];

const getErrorMessage = (error) => {
  const data = error.response?.data;

  if (typeof data === "string") return data;

  return (
    data?.error ||
    data?.message ||
    error.message ||
    "Ocurrió un error inesperado."
  );
};

export default function AddProduct({ userData }) {
  const navigate = useNavigate();

  const preset_key = "postsimages";
  const cloud_name = "dsc4kqz3g";
  const folderName = "postimages";

  const [files, setFiles] = useState([]);
  const filesRef = useRef([]);

  const [provinces, setProvinces] = useState([]);
  const [localities, setLocalities] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [localidad, setSelectedLocalidad] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const [errors, setErrors] = useState({
    title: null,
    description: null,
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    disabled: false,
  });

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => {
    return () => {
      filesRef.current.forEach((file) => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });
    };
  }, []);

  useEffect(() => {
    fetch("https://apis.datos.gob.ar/georef/api/provincias")
      .then((res) => {
        if (!res.ok) throw new Error("No se pudieron obtener las provincias.");
        return res.json();
      })
      .then((data) => setProvinces(data.provincias))
      .catch((error) => console.error(error));
  }, []);

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (files.length + acceptedFiles.length > MAX_IMAGES) {
        Swal.fire({
          title: "¡Límite de imágenes alcanzado!",
          text: `No puedes cargar más de ${MAX_IMAGES} imágenes.`,
          icon: "warning",
        });
        return;
      }

      const filesWithPreview = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        }),
      );

      setFiles((currentFiles) => [...currentFiles, ...filesWithPreview]);
    },
    [files],
  );

  const onDropRejected = () => {
    Swal.fire({
      title: "Archivo no válido",
      text: "Solo se aceptan imágenes de hasta 5 MB.",
      icon: "warning",
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: { "image/*": [] },
    maxSize: MAX_IMAGE_SIZE,
    multiple: true,
    disabled: formData.disabled,
  });

  const clearFiles = () => {
    files.forEach((file) => {
      if (file.preview) URL.revokeObjectURL(file.preview);
    });

    setFiles([]);
  };

  const handleDeleteImage = (index) => {
    const imageToRemove = files[index];

    if (imageToRemove?.preview) {
      URL.revokeObjectURL(imageToRemove.preview);
    }

    setFiles((currentFiles) =>
      currentFiles.filter((_, fileIndex) => fileIndex !== index),
    );
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    let error = null;

    if (name === "title") {
      error = validateTitle(value);
    }

    if (name === "description") {
      error = validateDescription(value);
    }

    setErrors((current) => ({
      ...current,
      [name]: error,
    }));
  };

  const handleProvinceChange = (event) => {
    const province = event.target.value;

    setSelectedProvince(province);
    setSelectedLocalidad("");
    setLocalities([]);

    if (!province) return;

    fetch(
      `https://apis.datos.gob.ar/georef/api/localidades?provincia=${encodeURIComponent(
        province,
      )}&max=500`,
    )
      .then((res) => {
        if (!res.ok) throw new Error("No se pudieron obtener las localidades.");
        return res.json();
      })
      .then((data) => setLocalities(data.localidades))
      .catch((error) => console.error(error));
  };

  const validateForm = () => {
    const titleError = validateTitle(formData.title);
    const descriptionError = validateDescription(formData.description);

    setErrors({
      title: titleError,
      description: descriptionError,
    });

    return !titleError && !descriptionError;
  };

  const handlePremium = async () => {
    try {
      const response = await api.post("/plans/create-order", {
        userId: userData.id,
        title: "Premium",
        quantity: 1,
        currency_id: "ARS",
        description: "Usuario premium",
      });

      const initPoint = response.data?.response?.body?.init_point;

      if (!initPoint) {
        throw new Error("No se recibió el enlace de pago.");
      }

      window.location.assign(initPoint);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No se pudo iniciar el pago",
        text: getErrorMessage(error),
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const hasRequiredFields =
      formData.title.trim() &&
      files.length > 0 &&
      selectedProvince &&
      localidad &&
      selectedCategory;

    if (!hasRequiredFields) {
      Swal.fire({
        title: "Campos obligatorios",
        text: "Todos los campos marcados con * son obligatorios.",
        icon: "warning",
      });
      return;
    }

    if (!validateForm()) {
      Swal.fire({
        title: "Errores en el formulario",
        text: "Revisa el título y la descripción.",
        icon: "error",
      });
      return;
    }

    setFormData((current) => ({
      ...current,
      disabled: true,
    }));

    try {
      // Este request sí usa `api`, porque consulta tu backend.
      const signRes = await api.get("posts/cloudinary/signature");

      const { apiKey, timestamp, signature, cloudName } = signRes.data;

      if (!apiKey || !timestamp || !signature || !cloudName) {
        throw new Error("La firma de Cloudinary es inválida.");
      }

      // NO usar `api.post` aquí: api agrega el header `token`.
      // Cloudinary bloquea ese header por CORS.
      const uploadPromises = files.map(async (file) => {
        const uploadFormData = new FormData();

        uploadFormData.append("file", file);
        uploadFormData.append("api_key", apiKey);
        uploadFormData.append("timestamp", timestamp);
        uploadFormData.append("signature", signature);
        uploadFormData.append("folder", folderName);

        const uploadResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: uploadFormData,
          },
        );

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(
            uploadData.error?.message ||
              "No se pudo subir una imagen a Cloudinary.",
          );
        }

        return uploadData.secure_url.replace(
          "/upload/",
          "/upload/q_auto,f_auto/",
        );
      });

      const imageUrls = await Promise.all(uploadPromises);

      if (imageUrls.length === 0) {
        throw new Error("No se pudo subir ninguna imagen.");
      }

      const newPost = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        image: imageUrls,
        ubication: `${selectedProvince}, ${localidad}`,
        category: selectedCategory,
        UserId: userData.id,
      };

      await api.post("/posts/", newPost);

      clearFiles();
      setSelectedCategory("");
      setSelectedProvince("");
      setSelectedLocalidad("");
      setLocalities([]);
      setFormData({
        title: "",
        description: "",
        disabled: false,
      });

      await Swal.fire({
        icon: "success",
        title: "🎉 ¡Hecho!",
        text: "Tu publicación fue creada correctamente.",
        allowOutsideClick: false,
      });

      // Cambia esta ruta si tu perfil tiene otra URL.
      navigate("/login");
    } catch (error) {
      const errorMessage = getErrorMessage(error);

      if (errorMessage.toLowerCase().includes("premium")) {
        const result = await Swal.fire({
          title: "Límite de publicaciones alcanzado",
          text: errorMessage,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Hacerse Premium",
          cancelButtonText: "Cancelar",
          reverseButtons: true,
        });

        if (result.isConfirmed) {
          await handlePremium();
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "No se pudo crear la publicación",
          text: errorMessage,
        });
      }
    } finally {
      setFormData((current) => ({
        ...current,
        disabled: false,
      }));
    }
  };

  const sortedProvinces = [...provinces].sort((a, b) =>
    a.nombre.localeCompare(b.nombre),
  );

  const sortedLocalities = [...localities].sort((a, b) =>
    a.nombre.localeCompare(b.nombre),
  );

  const Banner =
    "https://res.cloudinary.com/dlahgnpwp/image/upload/v1699885578/emailAssets/er00zffd102eyze13aug.jpg";

  const Banner2 =
    "https://res.cloudinary.com/dlahgnpwp/image/upload/v1699885578/emailAssets/cyzzxxg8vkfxaqzolq9m.jpg";

  return (
    <>
      <Header banner1={Banner} banner2={Banner2} />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={style.container}
      >
        <h3>Crear publicación</h3>

        <form className={style.create} onSubmit={handleSubmit}>
          <div className={style.part1}>
            <label>
              Título*
              <input
                className={style.input}
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Inserte título"
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
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Inserte descripción"
                disabled={formData.disabled}
              />
              {errors.description && (
                <div className={style.errorMessage}>{errors.description}</div>
              )}
            </label>

            <label>
              Imagen*
              <section className={style.files}>
                <div className={style.dropzone} {...getRootProps()}>
                  <input {...getInputProps()} />

                  {isDragActive
                    ? "Suelta tus archivos aquí"
                    : "Selecciona o arrastra tus archivos aquí"}
                </div>

                {files.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      flexWrap: "wrap",
                      marginTop: 15,
                      justifyContent: "center",
                    }}
                  >
                    {files.map((file, index) => (
                      <div key={`${file.name}-${file.lastModified}-${index}`}>
                        <img
                          src={file.preview}
                          alt={`Imagen ${index + 1}`}
                          style={{
                            display: "block",
                            borderRadius: 5,
                            width: 60,
                            height: 60,
                            marginRight: 5,
                          }}
                        />

                        <button
                          type="button"
                          onClick={() => handleDeleteImage(index)}
                          disabled={formData.disabled}
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
              value={selectedProvince}
              onChange={handleProvinceChange}
              disabled={formData.disabled}
            >
              <option value="">Provincia</option>
              {sortedProvinces.map((province) => (
                <option key={province.id} value={province.nombre}>
                  {province.nombre}
                </option>
              ))}
            </select>

            <label>Localidad*</label>
            <select
              value={localidad}
              onChange={(event) => setSelectedLocalidad(event.target.value)}
              disabled={formData.disabled || !selectedProvince}
            >
              <option value="">Localidad</option>
              {sortedLocalities.map((locality) => (
                <option key={locality.id} value={locality.nombre}>
                  {locality.nombre}
                </option>
              ))}
            </select>

            <label>Categoría*</label>
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              disabled={formData.disabled}
            >
              <option value="">Categoría</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className={style.button}
            disabled={formData.disabled}
          >
            Crear
          </button>

          {formData.disabled && (
            <div className={style.loaderContainer}>
              <span>Cargando publicación...</span>
              <div className={style.loader} />
            </div>
          )}
        </form>

        <h5 className={style.message}>Los campos con * son obligatorios</h5>
      </motion.div>
    </>
  );
}