import api from "../api/api";
const handlePremiumPurchase = async (userId) => {
  try {
    const paymentData = {
      userId: userId,
      title: "Premium",
      quantity: 1,
      currency_id: "ARS",
      description: "Usuario premium",
    };

    const response = await api.post("/plans/create-order", paymentData);

    if (response?.data?.init_point) {
      // 🔴 Redirección a MercadoPago
      window.location.href = response.data.init_point;
    } else {
      throw new Error("No se recibió init_point");
    }
  } catch (error) {
    console.error("Error al iniciar compra premium:", error);

    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo iniciar el proceso de pago. Intenta nuevamente.",
    });
  }
};

export { handlePremiumPurchase };