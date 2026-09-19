import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Header from "../../components/header/Header";
import style from "./AddProduct.module.css";
import api from "../../api/api";
import {
  validateDescription,
  validateTitle,
  validateImageFile,
} from "./validation";
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
  if (typeof data === "string") {
    return data;
  }
  return (
    data?.error ||
    data?.message ||
    error.message ||
    "Ocurrió un error inesperado."
  );
};
export default function AddProduct({ userData }) {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const filesRef = useRef([]);
  const [provinces, setProvinces] = useState([]);
  const [localities, setLocalities] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [localidad, setSelectedLocalidad] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [errors, setErrors] = useState({ title: null, description: null });
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    disabled: false,
  });
  const provinceAbortRef = useRef(null);
  const localityAbortRef = useRef(null);
  /* ===================================================== MANTENER REF DE ARCHIVOS ACTUALIZADA ===================================================== */ useEffect(() => {
    filesRef.current = files;
  }, [files]);
  /* ===================================================== LIMPIAR OBJECT URLS AL DESMONTAR ===================================================== */ useEffect(() => {
    return () => {
      filesRef.current.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
      provinceAbortRef.current?.abort();
      localityAbortRef.current?.abort();
    };
  }, []);
  /* ===================================================== PROVINCIAS ===================================================== */ useEffect(() => {
    const controller = new AbortController();
    fetch("https://apis.datos.gob.ar/georef/api/provincias", {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("No se pudieron obtener las provincias.");
        }
        return res.json();
      })
      .then((data) => {
        setProvinces(data.provincias || []);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error(error);
        }
      });
    return () => controller.abort();
  }, []);
  /* ===================================================== DRAG / DROP ===================================================== */ const onDrop =
    useCallback(async (acceptedFiles) => {
      const currentFiles = filesRef.current;
      if (currentFiles.length + acceptedFiles.length > MAX_IMAGES) {
        await Swal.fire({
          title: "¡Límite de imágenes alcanzado!",
          text: `No puedes cargar más de ${MAX_IMAGES} imágenes.`,
          icon: "warning",
        });
        return;
      }
      const validatedFiles = [];
      for (const file of acceptedFiles) {
        const validationError = await validateImageFile(file);
        if (validationError) {
          await Swal.fire({
            title: "Imagen no válida",
            text: validationError,
            icon: "warning",
          });
          continue;
        }
        const preview = URL.createObjectURL(file);
        validatedFiles.push(Object.assign(file, { preview }));
      }
      if (!validatedFiles.length) {
        return;
      }
      setFiles((currentFiles) => [...currentFiles, ...validatedFiles]);
    }, []);
  const onDropRejected = useCallback(async () => {
    await Swal.fire({
      title: "Archivo no válido",
      text: "Solo se aceptan imágenes JPG o PNG de hasta 5 MB.",
      icon: "warning",
    });
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] },
    maxSize: MAX_IMAGE_SIZE,
    multiple: true,
    disabled: formData.disabled,
  });
  /* ===================================================== LIMPIAR ARCHIVOS ===================================================== */ const clearFiles =
    useCallback(() => {
      filesRef.current.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
      setFiles([]);
    }, []);
  /* ===================================================== ELIMINAR UNA IMAGEN ===================================================== */ const handleDeleteImage =
    useCallback((index) => {
      setFiles((currentFiles) => {
        const fileToRemove = currentFiles[index];
        if (fileToRemove?.preview) {
          URL.revokeObjectURL(fileToRemove.preview);
        }
        return currentFiles.filter((_, fileIndex) => fileIndex !== index);
      });
    }, []);
  /* ===================================================== INPUTS ===================================================== */ const handleChange =
    (event) => {
      const { name, value } = event.target;
      setFormData((current) => ({ ...current, [name]: value }));
      let error = null;
      if (name === "title") {
        error = validateTitle(value);
      }
      if (name === "description") {
        error = validateDescription(value);
      }
      setErrors((current) => ({ ...current, [name]: error }));
    };
  /* ===================================================== PROVINCIA ===================================================== */ const handleProvinceChange =
    async (event) => {
      const province = event.target.value;
      provinceAbortRef.current?.abort();
      localityAbortRef.current?.abort();
      setSelectedProvince(province);
      setSelectedLocalidad("");
      setLocalities([]);
      if (!province) {
        return;
      }
      const controller = new AbortController();
      localityAbortRef.current = controller;
      try {
        const response = await fetch(
          `https://apis.datos.gob.ar/georef/api/localidades?provincia=${encodeURIComponent(province)}&max=500`,
          { signal: controller.signal },
        );
        if (!response.ok) {
          throw new Error("No se pudieron obtener las localidades.");
        }
        const data = await response.json();
        setLocalities(data.localidades || []);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(error);
        }
      }
    };
  /* ===================================================== VALIDAR FORMULARIO ===================================================== */ const validateForm =
    () => {
      const titleError = validateTitle(formData.title);
      const descriptionError = validateDescription(formData.description);
      setErrors({ title: titleError, description: descriptionError });
      return !titleError && !descriptionError;
    };
  /* ===================================================== PREMIUM ===================================================== */ const handlePremium =
    async () => {
      try {
        const response = await api.post("/plans/create-order", {
          /* El backend debe validar el usuario autenticado. No debe confiar únicamente en este ID enviado por el cliente. */ userId:
            userData?.id,
          title: "Premium",
          quantity: 1,
          currency_id: "ARS",
          description: "Usuario premium",
        });
        const initPoint = response.data?.response?.body?.init_point;
        if (!initPoint || !initPoint.startsWith("https://")) {
          throw new Error("No se recibió un enlace de pago válido.");
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
  /* ===================================================== SUBMIT ===================================================== */ const handleSubmit =
    async (event) => {
      event.preventDefault();
      const hasRequiredFields =
        formData.title.trim() &&
        files.length > 0 &&
        selectedProvince &&
        localidad &&
        selectedCategory;
      if (!hasRequiredFields) {
        await Swal.fire({
          title: "Campos obligatorios",
          text: "Todos los campos marcados con * son obligatorios.",
          icon: "warning",
        });
        return;
      }
      if (!validateForm()) {
        await Swal.fire({
          title: "Errores en el formulario",
          text: "Revisa el título y la descripción.",
          icon: "error",
        });
        return;
      }
      setFormData((current) => ({ ...current, disabled: true }));
      try {
        /* Firma desde TU backend. */ const signRes = await api.get(
          "posts/cloudinary/signature",
        );
        const { apiKey, timestamp, signature, cloudName } = signRes.data;
        if (!apiKey || !timestamp || !signature || !cloudName) {
          throw new Error("La firma de Cloudinary es inválida.");
        }
        /* Subida paralela a Cloudinary. */ const uploadPromises = files.map(
          async (file) => {
            const uploadFormData = new FormData();
            uploadFormData.append("file", file);
            uploadFormData.append("api_key", apiKey);
            uploadFormData.append("timestamp", timestamp);
            uploadFormData.append("signature", signature);
            uploadFormData.append("folder", "postimages");
            const uploadResponse = await fetch(
              `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
              { method: "POST", body: uploadFormData },
            );
            const uploadData = await uploadResponse.json();
            if (!uploadResponse.ok) {
              throw new Error(
                uploadData.error?.message ||
                  "No se pudo subir una imagen a Cloudinary.",
              );
            }
            if (!uploadData.secure_url) {
              throw new Error("Cloudinary no devolvió una URL segura.");
            }
            return uploadData.secure_url.replace(
              "/upload/",
              "/upload/q_auto,f_auto/",
            );
          },
        );
        const imageUrls = await Promise.all(uploadPromises);
        if (!imageUrls.length) {
          throw new Error("No se pudo subir ninguna imagen.");
        }
        const newPost = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          image: imageUrls,
          ubication: `${selectedProvince}, ${localidad}`,
          category: selectedCategory,
          /* Idealmente eliminá UserId del cliente y hacé que el backend lo derive del token. Se deja aquí solo por compatibilidad con tu API actual. */ UserId:
            userData?.id,
        };
        await api.post("/posts/", newPost);
        clearFiles();
        setSelectedCategory("");
        setSelectedProvince("");
        setSelectedLocalidad("");
        setLocalities([]);
        setFormData({ title: "", description: "", disabled: false });
        setErrors({ title: null, description: null });
        await Swal.fire({
          icon: "success",
          title: "🎉 ¡Hecho!",
          text: "Tu publicación fue creada correctamente.",
          allowOutsideClick: false,
        });
        /* Si el usuario ya está autenticado, normalmente tendría más sentido ir al perfil o al inicio. */ navigate(
          "/",
        );
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
          await Swal.fire({
            icon: "error",
            title: "No se pudo crear la publicación",
            text: errorMessage,
          });
        }
      } finally {
        setFormData((current) => ({ ...current, disabled: false }));
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
      {" "}
      <Header banner1={Banner} banner2={Banner2} />{" "}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className={style.container}
      >
        {" "}
        <h3>Crear publicación</h3>{" "}
        <form className={style.create} onSubmit={handleSubmit}>
          {" "}
          <div className={style.part1}>
            {" "}
            <label className={style.fieldLabel}>
              {" "}
              Título*{" "}
              <input
                className={style.input}
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Inserte título"
                disabled={formData.disabled}
                maxLength={30}
                autoComplete="off"
              />{" "}
              {errors.title && (
                <span className={style.errorMessage}> {errors.title} </span>
              )}{" "}
            </label>{" "}
            <label className={style.fieldLabel}>
              {" "}
              Descripción{" "}
              <textarea
                className={style.input}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Inserte descripción"
                disabled={formData.disabled}
                maxLength={250}
              />{" "}
              <div className={style.characterCount}>
                {" "}
                {formData.description.length}/250{" "}
              </div>{" "}
              {errors.description && (
                <span className={style.errorMessage}>
                  {" "}
                  {errors.description}{" "}
                </span>
              )}{" "}
            </label>{" "}
            <label className={style.fieldLabel}>
              {" "}
              Imagen*{" "}
              <section className={style.files}>
                {" "}
                <div className={style.dropzone} {...getRootProps()}>
                  {" "}
                  <input {...getInputProps()} />{" "}
                  {isDragActive
                    ? "Suelta tus archivos aquí"
                    : "Selecciona o arrastra tus archivos aquí"}{" "}
                </div>{" "}
                {files.length > 0 && (
                  <div className={style.previewGrid}>
                    {" "}
                    {files.map((file, index) => (
                      <div
                        key={`${file.name}-${file.lastModified}-${index}`}
                        className={style.previewItem}
                      >
                        {" "}
                        <img
                          src={file.preview}
                          alt={`Vista previa ${index + 1}`}
                          className={style.previewImage}
                        />{" "}
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(index)}
                          disabled={formData.disabled}
                          className={style.removeImageButton}
                          aria-label={`Eliminar imagen ${index + 1}`}
                        >
                          {" "}
                          ✖️{" "}
                        </button>{" "}
                      </div>
                    ))}{" "}
                  </div>
                )}{" "}
              </section>{" "}
            </label>{" "}
          </div>{" "}
          <div className={style.part2}>
            {" "}
            <label htmlFor="province" className={style.fieldLabel}>
              {" "}
              Provincia*{" "}
            </label>{" "}
            <select
              id="province"
              value={selectedProvince}
              onChange={handleProvinceChange}
              disabled={formData.disabled}
            >
              {" "}
              <option value=""> Provincia </option>{" "}
              {sortedProvinces.map((province) => (
                <option key={province.id} value={province.nombre}>
                  {" "}
                  {province.nombre}{" "}
                </option>
              ))}{" "}
            </select>{" "}
            <label htmlFor="localidad" className={style.fieldLabel}>
              {" "}
              Localidad*{" "}
            </label>{" "}
            <select
              id="localidad"
              value={localidad}
              onChange={(event) => setSelectedLocalidad(event.target.value)}
              disabled={formData.disabled || !selectedProvince}
            >
              {" "}
              <option value=""> Localidad </option>{" "}
              {sortedLocalities.map((locality) => (
                <option key={locality.id} value={locality.nombre}>
                  {" "}
                  {locality.nombre}{" "}
                </option>
              ))}{" "}
            </select>{" "}
            <label htmlFor="category" className={style.fieldLabel}>
              {" "}
              Categoría*{" "}
            </label>{" "}
            <select
              id="category"
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              disabled={formData.disabled}
            >
              {" "}
              <option value=""> Categoría </option>{" "}
              {categories.map((category) => (
                <option key={category} value={category}>
                  {" "}
                  {category}{" "}
                </option>
              ))}{" "}
            </select>{" "}
          </div>{" "}
          <button
            type="submit"
            className={style.button}
            disabled={formData.disabled}
          >
            {" "}
            Crear{" "}
          </button>{" "}
          {formData.disabled && (
            <div className={style.loaderContainer}>
              {" "}
              <span> Cargando publicación... </span>{" "}
              <div className={style.loader} />{" "}
            </div>
          )}{" "}
        </form>{" "}
        <h5 className={style.message}>
          {" "}
          Los campos con * son obligatorios{" "}
        </h5>{" "}
      </motion.div>{" "}
    </>
  );
}
