import { useEffect, useMemo, useState } from "react";
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
  const province = useSelector(s => s.selectedProvince), locality = useSelector(s => s.selectedLocality), category = useSelector(s => s.selectedCategory);
  const filtered = Boolean(province || locality || category);
  const [showModal, setShowModal] = useState(false);
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(0);
  const [request, setRequest] = useState("loading");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setRequest("loading");
    dispatch(getAllPosts()).then(() => active && setRequest("ready")).catch(() => active && setRequest("error"));
    return () => { active = false; };
  }, [dispatch, attempt]);
  useEffect(() => { setPage(0); }, [province, locality, category, sort]);
  const ordered = useMemo(() => [...allPosts].sort((a,b) => sort === "name"
    ? String(a.title || "").localeCompare(String(b.title || ""), "es")
    : (new Date(b.createdAt) - new Date(a.createdAt)) * (sort === "old" ? -1 : 1)), [allPosts, sort]);
  const pageCount = Math.ceil(ordered.length / POST_PER_PAGE);
  const currentPage = Math.max(0, Math.min(page, pageCount - 1));
  const items = ordered.slice(currentPage * POST_PER_PAGE, (currentPage + 1) * POST_PER_PAGE);

  return (
    <>
      <Header
        banner1={BANNER_1}
        banner2={BANNER_2}
        banner3={BANNER_3}
      />

      <main className={style.container}>
        <Filters />
        <section className={style.results} aria-labelledby="catalog-title">
          <div className={style.topline}>
            <div><h2 id="catalog-title">Productos para canjear</h2></div>
            <label className={style.sort}>Ordenar por
              <select value={sort} onChange={e=>setSort(e.target.value)}><option value="recent">Más recientes</option><option value="old">Más antiguos</option><option value="name">Nombre: A a Z</option></select>
            </label>
          </div>
          <p className={style.meta} role="status">{request === "loading" && !items.length ? "Buscando publicaciones…" : request === "error" && !items.length ? "Catálogo no disponible" : `${ordered.length} ${ordered.length === 1 ? "publicación" : "publicaciones"}${filtered ? " · Con tus filtros" : ""}`}</p>
          {!filtered && <Cards allPosts={ordered} />}
          {request === "error" && <div className={style.notice} role="alert">No pudimos actualizar el catálogo. <button onClick={()=>setAttempt(a=>a+1)}>Volver a intentar</button></div>}
          {request === "ready" && !items.length && <div className={style.empty}><h3>{filtered ? "No hay productos con esos filtros" : "Todavía no hay publicaciones"}</h3><p>{filtered ? "Cambiá una opción o limpiá los filtros para ver más productos." : "Los productos que publique la comunidad van a aparecer acá."}</p></div>}
          <AllCards posts={items} pageCount={pageCount} currentPage={currentPage} prevHandler={()=>setPage(currentPage-1)} nextHandler={()=>setPage(currentPage+1)} />
        </section>
      </main>
      {showModal ? <VideoModal onClose={()=>setShowModal(false)} /> : <button type="button" className={style.help} aria-label="Cómo funciona Circula" aria-haspopup="dialog" onClick={()=>setShowModal(true)}>?</button>}
      <Footer />
    </>
  );
};

export default Home;
