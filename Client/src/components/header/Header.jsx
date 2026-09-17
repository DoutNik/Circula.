import Slider from "react-slick";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import style from "./Header.module.css";

function Header({ banner1, banner2, banner3 }) {
  const banners = [banner1, banner2, banner3].filter(Boolean);

  if (banners.length === 0) {
    return null;
  }

  const settings = {
    dots: false,
    arrows: false,
    infinite: banners.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: banners.length > 1,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    pauseOnFocus: true,
  };

  return (
    <header className={style.header}>
      <Slider {...settings}>
        {banners.map((banner, index) => (
          <div key={banner} className={style.slide}>
            <img
              src={banner}
              alt={`Banner promocional ${index + 1}`}
              className={style.image}
            />
          </div>
        ))}
      </Slider>
    </header>
  );
}

export default Header;