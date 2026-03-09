import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllPosts, deletePost } from "../../redux/actions";

import style from "./Publication.module.css";

const Publication = ({ userData }) => {
  const dispatch = useDispatch();
  const allPosts = useSelector((state) => state.allPostsCopy);
  const matches = useSelector((state) => state.matches);
  const [userPosts, setUserPosts] = useState([]);

  useEffect(() => {
    dispatch(getAllPosts());
  }, [dispatch]);

  useEffect(() => {
    // Filter user posts when userData or allPosts changes
    if (userData) {
      const filteredUserPosts = allPosts.filter((post) => post.UserId === userData.id);
      setUserPosts(filteredUserPosts);
    }
  }, [userData, allPosts]);

  const handlePostDelete = async (postId) => {
    try {
      await dispatch(deletePost(postId));
      const updatedPosts = userPosts.filter((post) => post.id !== postId);
      setUserPosts(updatedPosts);
      const matchesToDelete = matches.filter((match) =>
      match.match.some((m) => m.myPostId == postId || m.likedPostId == postId)
    );
    matchesToDelete.forEach((match) => {
      match.match.forEach((m) => {
        if (m.myPostId === postId || m.likedPostId === postId) {
          dispatch(deleteMatch(match.id, m.id)); // Utiliza la acción deleteMatch con los IDs correspondientes
        }
      });
    });
    dispatch(getAllPosts());
  } catch (error) {
    console.error("Error al eliminar la publicación", error);
  }
};

return (
  <>
    {userPosts.map((post) => (
      <div key={post.id} className={style.publication}>
        {post.image && (
          <img
            src={post.image[0]}
            className={style.img}
            alt="Publication Image"
          />
        )}
        {post.title && <h3>{post.title}</h3>}

        <button
          className={style.trash}
          onClick={() => handlePostDelete(post.id)}
        >
          <img
            width="24"
            height="24"
            src="https://img.icons8.com/color/48/delete-forever.png"
            alt="delete-forever"
          />
        </button>
      </div>
    ))}
  </>
);
};

export default Publication;