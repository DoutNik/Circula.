import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllPosts } from "../../redux/actions";

import VideoModal from "../../components/videoModal/VideoModal";
import Cards from "../../components/cards/cards";
import Filters from "../../components/filters/filters";
import Header from "../../components/header/Header";
import AllCards from "../../components/allCards/AllCards";
import Footer from "../../components/footer/Footer";

import style from "./Home.module.css";

const POST_PER_PAGE = 12;

const BANNER_1 =
  "https://res.cloudinary.com/dsc4kqz3g/image/upload/v1774028276/Gemini_Generated_Image_xdf9d9xdf9d9xdf9_ofj0jc.png";

const BANNER_2 =
  "https://res.cloudinary.com/dsc4kqz3g/image/upload/v1774028269/Gemini_Generated_Image_v0bhrqv0bhrqv0bh_rcvuvc.png";

const BANNER_3 =
  "https://res.cloudinary.com/dsc4kqz3g/image/upload/v1774028258/bannerCircula1_dwhtft.jpg";

const Home = () => {
  const dispatch = useDispatch();

  const allPosts = useSelector((state) => state.allPosts);
  const posts = useSelector((state) => state.allPostsCopy);

  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    dispatch(getAllPosts());
  }, [dispatch]);

  /*
   * Calculamos las publicaciones de la página actual
   * en lugar de guardarlas en otro estado.
   */
  const items = useMemo(() => {
    const firstIndex = currentPage * POST_PER_PAGE;

    return allPosts.slice(firstIndex, firstIndex + POST_PER_PAGE);
  }, [allPosts, currentPage]);

  /*
   * Si cambia la cantidad de publicaciones y la página actual
   * deja de existir, volvemos automáticamente a la primera.
   */
  useEffect(() => {
    const totalPages = Math.ceil(allPosts.length / POST_PER_PAGE);

    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(0);
    }

    if (allPosts.length === 0 && currentPage !== 0) {
      setCurrentPage(0);
    }
  }, [allPosts.length, currentPage]);

  const toggleModal = () => {
    setShowModal((prev) => !prev);
  };

  const nextHandler = () => {
    const totalPages = Math.ceil(allPosts.length / POST_PER_PAGE);

    setCurrentPage((prevPage) => {
      if (prevPage >= totalPages - 1) {
        return prevPage;
      }

      return prevPage + 1;
    });
  };

  const prevHandler = () => {
    setCurrentPage((prevPage) => {
      if (prevPage <= 0) {
        return 0;
      }

      return prevPage - 1;
    });
  };

  return (
    <>
      <Header
        banner1={BANNER_1}
        banner2={BANNER_2}
        banner3={BANNER_3}
      />

      <main className={style.container}>
        {showModal && (
          <div className={style.button}>
            <VideoModal onClose={toggleModal} />
          </div>
        )}

        {!showModal && (
          <button
            type="button"
            onClick={toggleModal}
            className={style.open}
            aria-label="Abrir ayuda"
            aria-haspopup="dialog"
          >
            <img
              src="https://img.icons8.com/color/96/help--v1.png"
              alt=""
              aria-hidden="true"
            />
          </button>
        )}

        <section className={style.cardsSection}>
          <Cards allPosts={posts} />
        </section>

        <section className={style.filtersSection}>
          <Filters />
        </section>

        <section className={style.allCardsSection}>
          <AllCards
            posts={items}
            currentPage={currentPage}
            nextHandler={nextHandler}
            prevHandler={prevHandler}
          />
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Home;