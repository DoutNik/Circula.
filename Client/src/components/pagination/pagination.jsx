import React, { useEffect, useState } from "react";
import styles from "./Pagination.module.css";
export default function Paginado({
  allCard,
  cardPerPage,
  paginado,
  currentPage,
}) {
  const [displayPages, setDisplayPages] = useState([]);
  const [inputPage, setInputPage] = useState("");
  const [errorInput, setErrorInput] = useState("");
  const totalPages = Math.max(1, Math.ceil(allCard / cardPerPage));
  useEffect(() => {
    /* Cantidad de páginas visibles según el ancho de pantalla. No dependemos únicamente del CSS porque también queremos evitar generar demasiados botones. */ const getMaxDisplayPages =
      () => {
        if (typeof window === "undefined") return 7;
        if (window.innerWidth <= 360) return 3;
        if (window.innerWidth <= 480) return 5;
        if (window.innerWidth <= 768) return 5;
        if (window.innerWidth <= 1200) return 7;
        return 9;
      };
    const updatePages = () => {
      const maxDisplayPages = Math.min(getMaxDisplayPages(), totalPages);
      let startPage = Math.max(
        currentPage - Math.floor(maxDisplayPages / 2),
        1,
      );
      let endPage = Math.min(startPage + maxDisplayPages - 1, totalPages);
      /* Ajustamos nuevamente el inicio cuando llegamos cerca de la última página. */ if (
        endPage - startPage + 1 <
        maxDisplayPages
      ) {
        startPage = Math.max(endPage - maxDisplayPages + 1, 1);
      }
      const pages = [];
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      setDisplayPages(pages);
    };
    updatePages();
    window.addEventListener("resize", updatePages);
    return () => {
      window.removeEventListener("resize", updatePages);
    };
  }, [currentPage, totalPages]);
  const handleInputChange = (event) => {
    const value = event.target.value;
    /* Permitimos solamente números. */ if (/^\d*$/.test(value)) {
      setInputPage(value);
      setErrorInput("");
    }
  };
  const handleGoToPage = () => {
    const pageNumber = Number(inputPage);
    if (
      Number.isInteger(pageNumber) &&
      pageNumber >= 1 &&
      pageNumber <= totalPages
    ) {
      paginado(pageNumber);
      setInputPage("");
      setErrorInput("");
    } else {
      setErrorInput(`Ingresá un número entre 1 y ${totalPages}`);
    }
  };
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleGoToPage();
    }
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      paginado(currentPage + 1);
    }
  };
  const handlePrevPage = () => {
    if (currentPage > 1) {
      paginado(currentPage - 1);
    }
  };
  return (
    <nav className={styles.paginationContainer} aria-label="Paginación">
      {" "}
      <div className={styles.paginationWrapper}>
        {" "}
        {/* PAGINACIÓN */}{" "}
        <ul className={styles.paginationList}>
          {" "}
          {/* ANTERIOR */}{" "}
          <li className={styles.paginationListItem}>
            {" "}
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`${styles.paginationButton} ${styles.arrowButton}`}
              aria-label="Página anterior"
            >
              {" "}
              ‹{" "}
            </button>{" "}
          </li>{" "}
          {/* PÁGINAS */}{" "}
          {displayPages.map((number) => (
            <li key={number} className={styles.paginationListItem}>
              {" "}
              <button
                type="button"
                onClick={() => paginado(number)}
                className={`${styles.paginationButton} ${currentPage === number ? styles.activePage : ""}`}
                aria-current={currentPage === number ? "page" : undefined}
              >
                {" "}
                {number}{" "}
              </button>{" "}
            </li>
          ))}{" "}
          {/* SIGUIENTE */}{" "}
          <li className={styles.paginationListItem}>
            {" "}
            <button
              type="button"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`${styles.paginationButton} ${styles.arrowButton}`}
              aria-label="Página siguiente"
            >
              {" "}
              ›{" "}
            </button>{" "}
          </li>{" "}
        </ul>{" "}
        {/* INFORMACIÓN DE PÁGINA */}{" "}
        <div className={styles.pageInfo}>
          {" "}
          <span className={styles.currentPage}> {currentPage} </span>{" "}
          <span className={styles.separator}>/</span>{" "}
          <span>{totalPages}</span>{" "}
        </div>{" "}
        {/* IR A PÁGINA */}{" "}
        <div className={styles.goToPage}>
          {" "}
          <label htmlFor="pagination-page-input" className={styles.inputLabel}>
            {" "}
            Ir a{" "}
          </label>{" "}
          <input
            id="pagination-page-input"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={inputPage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="#"
            className={styles.paginationInput}
            aria-label="Número de página"
          />{" "}
          <button
            type="button"
            onClick={handleGoToPage}
            className={styles.goButton}
          >
            {" "}
            Ir{" "}
          </button>{" "}
        </div>{" "}
        {/* ERROR */}{" "}
        {errorInput && (
          <p className={styles.paginationError}> {errorInput} </p>
        )}{" "}
      </div>{" "}
    </nav>
  );
}
