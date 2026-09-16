import { useMemo } from "react";
import { motion } from "framer-motion";
import Slider from "react-slick";
import Card from "../card/card";
import fire from "../../assets/fire.gif";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import style from "./Cards.module.css";

const Cards = ({ allPosts = [] }) => {
  const premiumPosts = useMemo(() => {
    return [...allPosts]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20)
      .filter((post) => post.User?.plan === "premium");
  }, [allPosts]);

  const postCount = premiumPosts.length;

  const sliderSettings = (desiredSlides, dots = true) => {
    const slidesToShow = Math.min(desiredSlides, postCount);

    return {
      slidesToShow,
      slidesToScroll: 1,
      infinite: postCount > slidesToShow,
      dots,
      arrows: postCount > slidesToShow,
    };
  };

  const settings = {
    ...sliderSettings(7),
    autoplay: postCount > 1,
    autoplaySpeed: 3500,
    speed: 500,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 2560,
        settings: sliderSettings(6),
      },
      {
        breakpoint: 1920,
        settings: sliderSettings(5),
      },
      {
        breakpoint: 1440,
        settings: sliderSettings(4),
      },
      {
        breakpoint: 1100,
        settings: sliderSettings(3),
      },
      {
        breakpoint: 760,
        settings: sliderSettings(2, false),
      },
      {
        breakpoint: 500,
        settings: sliderSettings(1, false),
      },
    ],
  };

  if (postCount === 0) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className={style.cards}
    >
      <div className={style.masRec}>
        <span>Lo más destacado</span>
        <img src={fire} className={style.fire} alt="" />
      </div>

      <Slider {...settings}>
        {premiumPosts.map((post) => (
          <div key={post.id} className={style.slide}>
            <img
              src="https://img.icons8.com/color/48/guarantee.png"
              alt="Publicación premium"
              className={style.logo}
            />
            <Card post={post} />
          </div>
        ))}
      </Slider>
    </motion.section>
  );
};

export default Cards;