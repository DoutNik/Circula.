import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import style from "./UserProfile.module.css";
import api from "../../api/api";

const UserProfile = ({ id }) => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [showRating, setShowRating] = useState(false);
  const [isRating, setIsRating] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get("/users/anotherUserId", {
          params: {
            id: userId,
          },
        });

        if (response.data) {
          setUserData(response.data);
        } else {
          console.error("No se recibieron datos del usuario");
        }
      } catch (error) {
        console.error(
          "Error al obtener la información del usuario:",
          error
        );
      }
    };

    fetchUserData();
  }, [userId]);

  const handleRating = async (value) => {
    if (isRating || !id?.id || !userId) return;

    setIsRating(true);

    try {
      const newReview = {
        userId: id.id,
        reviewedUserId: userId,
        rating: value,
      };

      await api.post("/reviews/", newReview);

      const response = await api.get(
        `/reviews/averageRating/${userId}`
      );

      setUserData((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          averageRating: response.data.averageRating,
        };
      });

      setShowRating(false);
    } catch (error) {
      console.error("Error al calificar al usuario:", error);
    } finally {
      setIsRating(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (!userData) {
    return (
      <main className={style.loading}>
        <p>Cargando perfil...</p>
      </main>
    );
  }

  if (showRating) {
    return (
      <main className={style.ratingView}>
        <section className={style.modal}>
          <h2>Calificá a {userData.username}</h2>

          <p className={style.ratingText}>
            Seleccioná una cantidad de estrellas.
          </p>

          <div
            className={style.ratingContainer}
            aria-label="Seleccionar calificación"
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <label
                key={value}
                className={style.starLabel}
              >
                <input
                  type="radio"
                  name="rating"
                  value={value}
                  onChange={() => handleRating(value)}
                  disabled={isRating}
                  className={style.starInput}
                />

                <span
                  className={style.star}
                  aria-hidden="true"
                >
                  ⭐
                </span>

                <span className={style.starNumber}>
                  {value}
                </span>
              </label>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowRating(false)}
            className={style.back}
            disabled={isRating}
          >
            Atrás
          </button>
        </section>
      </main>
    );
  }

  const averageRating = Number(userData.averageRating) || 0;
  const roundedRating = Math.round(averageRating);
  const isPremium = userData.premium === "premium";

  return (
    <main className={style.container}>
      <section
        className={
          isPremium
            ? style.avatarPremium
            : style.avatar
        }
      >
        <div className={style.profileTop}>
          <div className={style.photoWrapper}>
            <img
              src={userData.image}
              className={style.photo}
              alt={`Avatar de ${userData.username}`}
            />

            {isPremium && (
              <img
                src="https://img.icons8.com/color/48/guarantee.png"
                alt="Usuario Premium"
                className={style.logo}
              />
            )}
          </div>

          <h2>{userData.username}</h2>

          <p className={style.email}>
            {userData.email}
          </p>
        </div>

        {averageRating > 0 ? (
          <div className={style.rating}>
            <div
              className={style.stars}
              aria-label={`Calificación ${averageRating} de 5`}
            >
              {Array.from(
                { length: roundedRating },
                (_, index) => (
                  <span key={index}>⭐</span>
                )
              )}
            </div>

            <span className={style.ratingValue}>
              {averageRating.toFixed(1)}
            </span>
          </div>
        ) : (
          <p className={style.calif}>
            ¡Todavía no hay calificaciones, sé el primero!
          </p>
        )}

        <div className={style.actions}>
          <button
            type="button"
            className={style.back}
            onClick={handleGoBack}
          >
            Atrás
          </button>

          <button
            type="button"
            onClick={() => setShowRating(true)}
            className={style.bRating}
          >
            Calificar
          </button>
        </div>
      </section>
    </main>
  );
};

export default UserProfile;