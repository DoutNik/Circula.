import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllLikes, getAllPosts, likedPosts } from "../../redux/actions";
import style from "./PostsLiked.module.css";

const PostsLiked = ({ userData }) => {
  const userId = userData.id;
  const dispatch = useDispatch();
  const allPosts = useSelector((state) => state.allPostsCopy);
  const allLikes = useSelector((state) => state.allLikes);
  const matchedPairs = useSelector((state) => state.matchedPairs);
  const likedPostss = useSelector((state) => state.likedPosts);
  const [userPosts, setUserPosts] = useState([]);


  // Agrega un estado local para controlar si los datos están cargados
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(getAllLikes());
      await dispatch(getAllPosts());
      await dispatch(likedPosts(userId));
      // Marca que los datos están cargados una vez que las acciones se completen
      setDataLoaded(true);
    };

    fetchData();
  }, [dispatch, userId]);

  useEffect(() => {
    // Filter user posts when userData or allPosts changes
    if (userData) {
      const filteredUserPosts = allPosts.filter(
        (post) => post.UserId === userData.id,
      );
      setUserPosts(filteredUserPosts);
    }
  }, [userData, allPosts]);

  // Si los datos aún no están cargados, muestra un mensaje de carga
  if (!dataLoaded) {
    return <div>Cargando...</div>;
  }

  const matchedPostIds = matchedPairs.map((pair) => pair.anotherUserPost?.id);

  const filteredLikedPosts = likedPostss.filter(
    (likedPost) => !matchedPostIds.includes(likedPost.id),
  );

  const postsMap = Object.fromEntries(allPosts.map((post) => [post.id, post]));

  const exchangeAttempts = allLikes
    .filter((like) => like.myUserId === userId)
    .map((like) => ({
      myProduct: postsMap[like.myPostId],
      wantedProduct: postsMap[like.likedPostId],
    }));

  return (
    <div className={style.containerP}>
      {exchangeAttempts.map((attempt, index) => (
        <div className={style.likes} key={index}>
          <div className={style.like}>
            <img
              src={attempt.myProduct?.image?.[0]}
              alt={attempt.myProduct?.title}
              className={style.myProduct}
            />

            <div className={style.names}>
              <h4>{attempt.myProduct?.title}</h4>
              <h4>{attempt.wantedProduct?.title}</h4>
            </div>

            <img
              src={attempt.wantedProduct?.image?.[0]}
              alt={attempt.wantedProduct?.title}
              className={style.wantedProduct}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostsLiked;
