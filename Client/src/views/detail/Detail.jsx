import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  getMatches,
  getPostById,
  likePost,
  clearDetail,
  getAllLikes,
  getAllPosts,
} from "../../redux/actions";
import { motion } from "framer-motion";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Swal from "sweetalert2";
import style from "./Detail.module.css";

const Detail = ({ userData }) => {
  const myUserId = userData.id;
  const { id } = useParams();
  const likedPostId = id;
  const dispatch = useDispatch();
  const post = useSelector((state) => state.selectedPost);
  const anotherUserId = post.User?.id;
  const userName = post.User?.username;
  const myPostId = useSelector((state) => state.selectedPostToInteract);
  const allPosts2 = useSelector((state) => state.allPostsCopy);

  const allLikes = useSelector((state) => state.allLikes);
  const [liked, setLiked] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [showPostSelector, setShowPostSelector] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Filter user posts when userData or allPosts changes
    if (userData) {
      const filteredUserPosts = allPosts2.filter(
        (post) => post.UserId === userData.id
      );
      setUserPosts(filteredUserPosts);
    }
  }, [userData, allPosts2]);
  console.log("User Posts:", userPosts);
  console.log("allLikes", allLikes);
  

  const filteredMatches = useSelector((state) => state.matches).filter(
    (match) => {
      return match.match.some(
        (m) => m.myPostId == myPostId && m.likedPostId == id
      );
    }
  );

  // Comprueba si likedPostId está en la lista de likedPosts
  const isPostLiked = allLikes.some(
    (like) => like.myPostId == myPostId && like.likedPostId == id
  );

  const isMatched = filteredMatches.length > 0;

  useEffect(() => {
    dispatch(getPostById(id));
  }, [id]);

  useEffect(() => {
    dispatch(getMatches());
    dispatch(getAllLikes());
    dispatch(getAllPosts());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getPostById(`${id}`));
    return () => {
      dispatch(clearDetail());
    }; //limpia el detail
  }, []);

const handleLikeClick = () => {
  if (myPostId) {
    if (!liked && !isMatched) {
      dispatch(likePost(myUserId, likedPostId, myPostId, anotherUserId));
      dispatch(getAllLikes());

      setLiked(true);

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
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: true,
          variableWidth: true,
          className: "slider variable-width",
          dots: true,
          arrows: false,
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
        "No hay publicaciones disponibles o ya estás en la primera publicación"
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
        "No hay publicaciones disponibles o ya estás en la última publicación"
      );
    }
  };

  const isPostAlreadyRequested = (postId) => {
    return allLikes.some((like) => like.myPostId == postId);
  };

  return (
    <>
      {showPostSelector && (
        <div className={style.modalOverlay}>
          <div className={style.modal}>
            <h2>Elegí una publicación para el canje</h2>

            <div className={style.postsContainer}>
              {userPosts.map((post) => {
                const requested = isPostAlreadyRequested(post.id);

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
                        Solicitud de canje enviada
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

                  dispatch(
                    likePost(
                      myUserId,
                      likedPostId,
                      selectedPostId,
                      anotherUserId
                    )
                  );

                  dispatch(getAllLikes()); // ← actualizar estado

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
          scale: 0.9,
        }}
        animate={{
          opacity: 1,
          scale: 1.1,
        }}
        className={style.detail}
      >
        <div className={style.carousel}>
          {post && post.title && <h3>{post.title}</h3>}
          <Slider {...settings}>
            {post && post.image && post.image[0] && (
              <div>
                <img src={post.image[0]} alt="Image 1" className={style.img} />
              </div>
            )}
            {post && post.image && post.image[1] && (
              <div>
                <img src={post.image[1]} alt="Image 2" className={style.img} />
              </div>
            )}
            {post && post.image && post.image[2] && (
              <div>
                <img src={post.image[2]} alt="Image 3" className={style.img} />
              </div>
            )}
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
          <button
            className={style.button}
            onClick={handleLikeClick}
            disabled={
              liked || myUserId === anotherUserId || isMatched || isPostLiked
            }
          >
            Canjear
          </button>
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
