import { useState } from "react";
import scene from "../../assets/vuelta.svg";
import style from "./Header.module.css";

const copy = {
  catalog: ["COMUNIDAD DE CANJE", "Dale otra", "vuelta.", "Intercambiá lo que ya no usás por algo que necesitás."],
  profile: ["TU ESPACIO", "Tu rincón de", "Circula.", "Tus publicaciones, tu perfil y los objetos que ponés en circulación."],
  exchanges: ["ENTRE PERSONAS", "Tus", "canjes.", "Seguí tus propuestas y encontrá el próximo intercambio."],
};

export default function Header({ variant = "catalog", banner1, banner2, banner3 }) {
  const banners = [banner1, banner2, banner3].filter(Boolean);
  const [slide, setSlide] = useState(0);
  const [eyebrow, title, emphasis, description] = copy[variant];
  const count = banners.length + 1;
  return <header className={style.header} aria-label="Novedades de Circula">
    {slide === 0 ? <div className={style.intro}>
      <div className={style.copy}>
        <p className={style.eyebrow}><span aria-hidden="true"/> {eyebrow}</p>
        <h1>{title} <em>{emphasis}</em></h1>
        <p className={style.description}>{description}</p>
      </div>
      <img className={style.illustration} src={scene} alt="" />
    </div> : <div className={style.promo}><img src={banners[slide - 1]} alt={`Banner promocional ${slide} de Circula`} /></div>}
    {count > 1 && <div className={style.controls}>
      <button type="button" aria-label="Banner anterior" onClick={()=>setSlide((slide + count - 1) % count)}>‹</button>
      <span aria-live="polite">{String(slide + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}</span>
      <button type="button" aria-label="Banner siguiente" onClick={()=>setSlide((slide + 1) % count)}>›</button>
    </div>}
  </header>;
}
