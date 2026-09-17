import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { getAllLikes, getAllPosts } from "../../redux/actions";
import style from "./PostsLiked.module.css";

const DEFAULT_IMAGE =
  "https://img.icons8.com/fluency-systems-regular/96/image.png";

const getImageUrl = (post) => {
  if (Array.isArray(post?.image)) return post.image[0];
  return post?.image;
};

const PostsLiked = ({ userData }) => {
  const dispatch = useDispatch();
  const userId = userData?.id;

  // Usamos allPosts, no allPostsCopy, para evitar filtros externos.
  const allPosts = useSelector((state) => state.allPosts) || [];
  const allLikes = useSelector((state) => state.allLikes) || [];
  const matchedPairs = useSelector((state) => state.matchedPairs) || [];

  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(getAllLikes()),
          dispatch(getAllPosts()),
        ]);
      } catch (error) {
        console.error("Error al cargar los likes:", error);
      } finally {
        setDataLoaded(true);
      }
    };

    fetchData();
  }, [dispatch, userId]);

  const exchangeAttempts = useMemo(() => {
    const postsMap = new Map(allPosts.map((post) => [post.id, post]));

    const matchedPostIds = new Set(
      matchedPairs
        .map((pair) => pair.anotherUserPost?.id)
        .filter(Boolean),
    );

    return allLikes
      .filter(
        (like) =>
          Number(like.myUserId) === Number(userId) &&
          !matchedPostIds.has(like.likedPostId),
      )
      .map((like) => ({
        id: `${like.myPostId}-${like.likedPostId}`,
        myProduct: postsMap.get(like.myPostId),
        wantedProduct: postsMap.get(like.likedPostId),
      }))
      .filter((attempt) => attempt.myProduct && attempt.wantedProduct);
  }, [allLikes, allPosts, matchedPairs, userId]);

  if (!userId || !dataLoaded) {
    return <p className={style.loading}>Cargando likes...</p>;
  }

  if (exchangeAttempts.length === 0) {
    return (
      <p className={style.empty}>
        Todavía no tienes intercambios pendientes.
      </p>
    );
  }

  return (
    <section className={style.containerP}>
      {exchangeAttempts.map((attempt) => (
        <article className={style.likes} key={attempt.id}>
          <div className={style.like}>
            <img
              src={getImageUrl(attempt.myProduct) || DEFAULT_IMAGE}
              alt={attempt.myProduct.title || "Tu publicación"}
              className={style.myProduct}
            />

            <div className={style.names}>
              <h4>{attempt.myProduct.title || "Sin título"}</h4>
              <span>por</span>
              <h4>{attempt.wantedProduct.title || "Sin título"}</h4>
            </div>

            <img
              src={getImageUrl(attempt.wantedProduct) || DEFAULT_IMAGE}
              alt={attempt.wantedProduct.title || "Publicación deseada"}
              className={style.wantedProduct}
            />
          </div>
        </article>
      ))}
    </section>
  );
};

export default PostsLiked;