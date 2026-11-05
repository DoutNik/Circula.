import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectCategory, selectLocality, selectProvince, resetFilters } from "../../redux/actions";
import { locationOf, optionsFrom } from "../../utils/catalog";
import style from "./Filters.module.css";

function Sliders() {
  return <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 6h5m4 0h9M3 12h11m4 0h3M3 18h4m4 0h10"/><circle cx="10" cy="6" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="9" cy="18" r="2"/>
  </svg>;
}

export default function Filters() {
  const province = useSelector(s=>s.selectedProvince), locality = useSelector(s=>s.selectedLocality), category = useSelector(s=>s.selectedCategory);
  const posts = useSelector(s=>s.allPostsCopy);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const locations = posts.map(locationOf);
  const choices = [
    { id:"province", label:"Provincia", value:province, all:"Todas las provincias", options:optionsFrom(locations.map(l=>l.province)), action:selectProvince },
    { id:"locality", label:"Localidad", value:locality, all:province ? "Todas las localidades" : "Primero elegí provincia", disabled:!province, options:optionsFrom(locations.filter(l=>l.province===province).map(l=>l.locality)), action:selectLocality },
    { id:"category", label:"Categoría", value:category, all:"Todas las categorías", options:optionsFrom(posts.map(p=>p.category)), action:selectCategory },
  ];
  const count = choices.filter(c=>c.value).length;
  const heading = <><Sliders/> Filtros {count > 0 && <span className={style.count} aria-label={`${count} activos`}>{count}</span>}</>;
  return <aside className={style.filters} aria-label="Filtros del catálogo">
    <h2 className={style.heading}>{heading}</h2>
    <button className={style.toggle} type="button" aria-expanded={open} aria-controls="catalog-filters" onClick={()=>setOpen(!open)}>
      {heading}<span className={style.chevron} aria-hidden="true">{open ? "−" : "+"}</span>
    </button>
    <div id="catalog-filters" data-open={open} className={style.body}>
      {choices.map(choice=><div key={choice.id} className={style.field}>
        <label htmlFor={`filter-${choice.id}`}>{choice.label}</label>
        <select id={`filter-${choice.id}`} disabled={choice.disabled} value={choice.value} onChange={e=>dispatch(choice.action(e.target.value))}>
          <option value="">{choice.all}</option>
          {choice.options.map(option=><option key={option} value={option}>{option}</option>)}
        </select>
      </div>)}
      <button className={style.reset} type="button" onClick={()=>dispatch(resetFilters())} disabled={!count}>Limpiar filtros</button>
    </div>
  </aside>;
}
