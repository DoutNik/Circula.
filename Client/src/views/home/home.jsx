/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllPosts } from "../../redux/actions";
import VideoModal from "../../components/videoModal/VideoModal";
import Cards from "../../components/cards/cards";
import Filters from "../../components/filters/filters";
import Header from "../../components/header/Header";
import AllCards from "../../components/allCards/AllCards";
import Footer from "../../components/footer/Footer";

import style from "./Home.module.css";

const Home = ({}) => {
  const dispatch = useDispatch();
  const allPosts = useSelector((state) => state.allPosts);
  const Posts = useSelector((state) => state.allPostsCopy);
  const [showModal, setShowModal] = useState(false);
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const postPerPage = 12;

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  useEffect(() => {
    dispatch(getAllPosts());
  }, [dispatch]);

  /* const sortedPosts = allPosts
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .slice(0, allPosts.length); */

  useEffect(() => {
    if (allPosts.length > 0) {
      const initialItems = allPosts.slice(0, postPerPage);
      setItems(initialItems);
      setCurrentPage(0);
    }
  }, [allPosts]);

  const nextHandler = () => {
    const totalElemento = allPosts.length;
    const nextPage = currentPage + 1;
    const firstIndex = nextPage * postPerPage;
    if (firstIndex >= totalElemento) return;
    setItems(allPosts.slice(firstIndex, firstIndex + postPerPage));
    setCurrentPage(nextPage);
  };

  const prevHandler = () => {
    const preventPage = currentPage - 1;
    if (preventPage < 0) return;
    const firstIndex = preventPage * postPerPage;
    setItems(allPosts.slice(firstIndex, firstIndex + postPerPage));
    setCurrentPage(preventPage);
  };

  const Banner =
    "https://res.cloudinary.com/dsc4kqz3g/image/upload/v1774028276/Gemini_Generated_Image_xdf9d9xdf9d9xdf9_ofj0jc.png";
  const Banner2 =
    "https://res.cloudinary.com/dsc4kqz3g/image/upload/v1774028269/Gemini_Generated_Image_v0bhrqv0bhrqv0bh_rcvuvc.png";

    const Banner3 =
    "https://res.cloudinary.com/dsc4kqz3g/image/upload/v1774028258/bannerCircula1_dwhtft.jpg";

 return (
  <>
    <Header banner1={Banner} banner2={Banner2} banner3={Banner3} />

    <main className={style.container}>
      <div className={style.button}>
        {showModal && <VideoModal onClose={toggleModal} />}
      </div>

      {!showModal && (
        <button
          type="button"
          onClick={toggleModal}
          className={style.open}
          aria-label="Abrir ayuda"
        >
          <img
            src="https://img.icons8.com/color/96/help--v1.png"
            alt=""
          />
        </button>
      )}

      <Cards allPosts={Posts} />
      <Filters />
      <AllCards
        posts={items}
        currentPage={currentPage}
        nextHandler={nextHandler}
        prevHandler={prevHandler}
      />
    </main>

    <Footer />
  </>
);
};

export default Home;
