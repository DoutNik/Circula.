import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  getMatches,
  getPostById,
  likePost,
  clearDetail,
  getMyLikes,
  getAllPosts,
} from "../../redux/actions";
import { motion } from "framer-motion";

import Slider from "../../components/Slider";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Swal from "sweetalert2";
import api from "../../api/api";
import style from "./Detail.module.css";

const Detail = ({ userData }) => {
  const myUserId = userData?.id;
  const { id } = useParams();
  const likedPostId = Number(id);
  const dispatch = useDispatch();
  const post = useSelector((state) => state.selectedPost);
  const anotherUserId = post?.User?.id;
  const userName = post?.User?.username;
  const myPostId = useSelector((state) => state.selectedPostToInteract);

  const allLikes = useSelector((state) => state.myLikes || []);
  const matches = useSelector((state) => state.matches) || [];
  const [userPosts, setUserPosts] = useState([]);
  const [showPostSelector, setShowPostSelector] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);

  const navigate = useNavigate();

  const [productsStatus, setProductsStatus] = useState("loading");
  const [productsAttempt, setProductsAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setProductsStatus("loading");
    api
      .get(`/posts/userPosts/${myUserId}`)
      .then(({ data }) => {
        if (active) {
          setUserPosts(data);
          setProductsStatus("ready");
        }
      })
      .catch(() => {
        if (active) setProductsStatus("error");
      });
    return () => {
      active = false;
    };
  }, [myUserId, productsAttempt]);

  useEffect(() => {
    if (myUserId) {
      dispatch(getMatches(myUserId));
    }
  }, [dispatch, myUserId]);

  // Comprueba si likedPostId está en la lista de likedPosts
  const isPostLiked = allLikes.some(
    (like) => like.likedPostId === likedPostId && like.myUserId === myUserId,
  );

  const usedProductIds = allLikes
    .filter(
      (like) => like.likedPostId === likedPostId && like.myUserId === myUserId,
    )
    .map((like) => like.myPostId);

  const hasAvailableProduct = userPosts.some(
    (post) => !usedProductIds.includes(post.id),
  );

  const isMatched = matches.some((match) =>
    match.posts?.some((p) => p.id === likedPostId),
  );

  useEffect(() => {
    if (!id) return;

    dispatch(getPostById(id));

    return () => {
      dispatch(clearDetail());
    };
  }, [dispatch, id]);

  useEffect(() => {
    dispatch(getMyLikes());
    dispatch(getAllPosts());
  }, [dispatch]);

  const handleLikeClick = async () => {
    if (productsStatus !== "ready") return;
    if (!userPosts.length) {
      navigate("/addProduct");
      return;
    }
    if (myPostId && userPosts.some((product) => product.id === myPostId)) {
      if (!isPostLiked && !isMatched) {
        await dispatch(likePost(likedPostId, myPostId));

        await dispatch(getMyLikes());

        Swal.fire({
          title: "Solicitud de canje enviada",
          text: "Tu solicitud de canje ha sido enviada con éxito.",
          icon: "success",
        });
      }
    } else {
      setSelectedPostId(null);
      setShowPostSelector(true);
    }
  };
  const settings = {
    dots: true,
    infinite: (post?.image?.length ?? 0) > 1,
    speed: 400,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false,
          dots: true,
        },
      },
    ],
  };
  const allPosts = useSelector((state) => state.allPosts);

  const handlePrevClick = () => {
    const currentIndex = allPosts.findIndex((p) => p.id === parseInt(id, 10));

    if (
      Array.isArray(allPosts) &&
      allPosts.length > 0 &&
      currentIndex !== -1 &&
      currentIndex < allPosts.length - 1
    ) {
      const nextPostId = allPosts[currentIndex + 1].id;
      navigate(`/detail/${nextPostId}`);
    } else {
      console.log(
        "No hay publicaciones disponibles o ya estás en la primera publicación",
      );
    }
  };

  const handleNextClick = () => {
    const currentIndex = allPosts.findIndex((p) => p.id === parseInt(id, 10));

    if (
      Array.isArray(allPosts) &&
      allPosts.length > 0 &&
      currentIndex !== -1 &&
      currentIndex > 0
    ) {
      const prevPostId = allPosts[currentIndex - 1].id;
      navigate(`/detail/${prevPostId}`);
    } else {
      console.log(
        "No hay publicaciones disponibles o ya estás en la última publicación",
      );
    }
  };

  const handleReport = async () => {
    const reason = window.prompt(
      "Contanos brevemente por qué querés denunciar esta publicación:",
    );
    if (!reason?.trim()) return;

    try {
      await api.post("/reports", {
        targetPostId: likedPostId,
        reason: reason.trim(),
      });
      await Swal.fire(
        "Denuncia enviada",
        "Moderación revisará el contenido.",
        "success",
      );
    } catch (error) {
      await Swal.fire(
        "No se pudo enviar",
        error.response?.data?.error || "Intentá nuevamente.",
        "error",
      );
    }
  };

  const isPostAlreadyRequested = (myPostId, likedPostId) => {
    return allLikes.some(
      (like) =>
        Number(like.myPostId) === Number(myPostId) &&
        Number(like.likedPostId) === Number(likedPostId),
    );
  };

  let disabledReason = "";

  if (isPostLiked) {
    disabledReason = "Ya enviaste una solicitud de canje";
  } else if (myUserId === anotherUserId) {
    disabledReason = "No puedes canjear tu propia publicación";
  } else if (isMatched) {
    disabledReason = "Este canje ya fue realizado";
  } else if (productsStatus === "ready" && userPosts.length === 0) {
    disabledReason = "";
  } else if (!hasAvailableProduct) {
    disabledReason = "Intentaste este canje con todos tus productos";
  }

  return (
    <>
      {showPostSelector && (
        <div className={style.modalOverlay}>
          <div className={style.modal}>
            <h2>Elegí una publicación para el canje</h2>

            <div className={style.postsContainer}>
              {userPosts.map((post) => {
                const requested = isPostAlreadyRequested(post.id, likedPostId);

                return (
                  <div
                    key={post.id}
                    className={`${style.postRow} 
        ${selectedPostId === post.id ? style.selected : ""}
        ${requested ? style.disabled : ""}`}
                    onClick={() => {
                      if (!requested) {
                        setSelectedPostId(post.id);
                      }
                    }}
                  >
                    {post.image && (
                      <img
                        src={post.image[0]}
                        className={style.rowImg}
                        alt="Publication"
                      />
                    )}

                    <div className={style.rowInfo}>
                      <h3>{post.title}</h3>
                    </div>

                    {requested ? (
                      <div className={style.requestedLabel}>
                        Ya enviaste una solicitud con este producto para este
                        artículo.
                      </div>
                    ) : (
                      <div className={style.rowSelect}>
                        {selectedPostId === post.id ? "✓" : ""}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className={style.modalButtons}>
              <button
                className={style.cancelButton}
                onClick={() => setShowPostSelector(false)}
              >
                Cancelar
              </button>

              <button
                className={style.confirmButton}
                onClick={() => {
                  if (!selectedPostId) return;

                  dispatch(likePost(likedPostId, selectedPostId));

                  dispatch(getMyLikes());

                  setSelectedPostId(null);
                  setShowPostSelector(false);

                  Swal.fire({
                    title: "Solicitud de canje enviada",
                    text: "Tu solicitud de canje ha sido enviada con éxito.",
                    icon: "success",
                  });
                }}
              >
                Confirmar canje
              </button>
            </div>
          </div>
        </div>
      )}
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.96,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        transition={{
          duration: 0.25,
        }}
        className={style.detail}
      >
        <div className={style.carousel}>
          {post && post.title && <h3>{post.title}</h3>}
          <Slider {...settings}>
            {post?.image?.map((image, index) => (
              <div key={`${post.id}-${index}`}>
                <img
                  src={image}
                  alt={`${post.title} - imagen ${index + 1}`}
                  className={style.img}
                />
              </div>
            ))}
          </Slider>
        </div>

        <div className={style.info}>
          <h5>Calificación:</h5>
          {post.User && post.User.averageRating ? (
            <div className={style.rating}>
              {Array.from({ length: post.User.averageRating }, (_, index) => (
                <p key={index}>⭐️</p>
              ))}
            </div>
          ) : (
            <h4>Todavía nadie te ha calificado.</h4>
          )}
          <span>Publicacion de:</span>
          {post.User && userName && <h4>{userName}</h4>}

          <span>Ubicación:</span>
          {post && post.ubication && <h4>{post.ubication}</h4>}
          <span>Descripción:</span>
          {post && post.description && <h4>{post.description}</h4>}
        </div>

        <div className={style.buttons}>
          <Link to="/">
            <button className={style.back}>Principal</button>
          </Link>
          <button type="button" className={style.back} onClick={handleReport}>
            Denunciar
          </button>

          <div className={style.exchangeAction}>
            {productsStatus === "ready" &&
              userPosts.length === 0 &&
              myUserId !== anotherUserId &&
              !isMatched && (
                <div className={style.emptyExchange}>
                  <strong>Tu primer canje empieza con un producto</strong>
                  <p>
                    Agregá un producto para ofrecer a cambio de este. ¡Dale una
                    nueva vida a eso que ya no usás!
                  </p>
                </div>
              )}
            {productsStatus === "error" && (
              <p role="alert">
                No pudimos cargar tus productos.{" "}
                <button
                  type="button"
                  onClick={() => setProductsAttempt((value) => value + 1)}
                >
                  Reintentar
                </button>
              </p>
            )}
            <button
              className={style.button}
              onClick={handleLikeClick}
              disabled={
                myUserId === anotherUserId ||
                isMatched ||
                productsStatus !== "ready" ||
                (userPosts.length > 0 && !hasAvailableProduct)
              }
            >
              {productsStatus === "loading"
                ? "Cargando tus productos…"
                : userPosts.length === 0
                  ? "Agregar un producto"
                  : "Canjear"}
            </button>

            {disabledReason && productsStatus === "ready" && (
              <span className={style.exchangeHint}>{disabledReason}</span>
            )}
          </div>
        </div>
      </motion.div>
      <div className={style.navigationButtons}>
        <button onClick={handleNextClick}>
          <img
            width="24"
            height="24"
            src="https://img.icons8.com/ios-filled/50/back.png"
            alt="back"
            className={style.arrow}
          />
        </button>
        <button onClick={handlePrevClick}>
          <img
            width="24"
            height="24"
            src="https://img.icons8.com/ios-filled/50/forward.png"
            alt="forward"
            className={style.arrow}
          />
        </button>
      </div>
    </>
  );
};

export default Detail;
