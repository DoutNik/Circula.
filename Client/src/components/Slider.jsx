import ReactSlick from "react-slick";

// react-slick publishes CommonJS; Vite 8 may preserve its default wrapper.
const Slider = ReactSlick.default ?? ReactSlick;

export default Slider;
