import Card from "../card/card";
import style from "./AllCards.module.css";

export default function AllCards({ posts, currentPage, pageCount, nextHandler, prevHandler }) {
  return <>
    <div className={style.allCards}>{posts.map(post=><Card key={post.id} post={post}/>)}</div>
    {pageCount > 1 && <nav className={style.buttons} aria-label="Páginas del catálogo">
      <button type="button" onClick={prevHandler} disabled={currentPage===0} aria-label="Página anterior">←</button>
      <span>Página {currentPage + 1} de {pageCount}</span>
      <button type="button" onClick={nextHandler} disabled={currentPage+1===pageCount} aria-label="Página siguiente">→</button>
    </nav>}
  </>;
}
