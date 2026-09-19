import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useSelector,
  useDispatch,
} from "react-redux";

import {
  getAllExistingUsers,
  getAllExistingPosts,
  deleteUser,
  restoreUser,
  deletePost,
  restorePost,
  getAllMatches,
  sortUsersByID,
  sortUsersByPlan,
  sortUsersByStatus,
  resetUsersFilter,
  sortPostsByID,
  sortPostsByStatus,
  resetPostsFilter,
  disablePost,
} from "../../redux/actions";

import style from "./AdminDash.module.css";
import Swal from "sweetalert2";
import notpremium from "../../assets/not-premium.png";

const AdminDash = () => {
  const dispatch = useDispatch();

  const allUsers = useSelector(
    (state) => state.allExistingUsers
  );

  const allUsersCopy = useSelector(
    (state) => state.allExistingUsersCopy
  );

  const allPosts = useSelector(
    (state) => state.allExistingPosts
  );

  const allPostsCopy = useSelector(
    (state) => state.allExistingPostsCopy
  );

  const allMatches = useSelector(
    (state) => state.matches
  );

  const [
    selectedUserID,
    setSelectedUserID,
  ] = useState("");

  const [
    selectedUserPlan,
    setSelectedUserPlan,
  ] = useState("");

  const [
    selectedUserStatus,
    setSelectedUserStatus,
  ] = useState("");

  const [
    selectedPostsID,
    setSelectedPostID,
  ] = useState("");

  const [
    selectedPostStatus,
    setSelectedPostStatus,
  ] = useState("");

  /* =====================================================
     CARGA INICIAL
  ===================================================== */

  useEffect(() => {
    dispatch(getAllExistingUsers());
    dispatch(getAllExistingPosts());
    dispatch(getAllMatches());
  }, [dispatch]);

  /* =====================================================
     CONTADORES
  ===================================================== */

  const activeUsers = useMemo(() => {
    return allUsersCopy.reduce(
      (total, user) =>
        total + (!user.Deshabilitado ? 1 : 0),
      0
    );
  }, [allUsersCopy]);

  const disabledUsers = useMemo(() => {
    return allUsersCopy.reduce(
      (total, user) =>
        total + (user.Deshabilitado ? 1 : 0),
      0
    );
  }, [allUsersCopy]);

  const premiumUsers = useMemo(() => {
    return allUsersCopy.reduce(
      (total, user) =>
        total + (user.plan === "premium" ? 1 : 0),
      0
    );
  }, [allUsersCopy]);

  /* =====================================================
     TOAST
  ===================================================== */

  const showToast = async ({
    icon,
    title,
    timer = 1500,
  }) => {
    await Swal.fire({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer,
      timerProgressBar: true,
      icon,
      title,
    });
  };

  /* =====================================================
     USUARIOS
  ===================================================== */

  const handleDisableUser = async (id) => {
    try {
      await dispatch(deleteUser(id));

      await showToast({
        icon: "warning",
        title: "⛔ Usuario deshabilitado",
      });

      await dispatch(getAllExistingUsers());
    } catch (error) {
      console.error(
        "Hubo un problema al deshabilitar el usuario:",
        error
      );

      Swal.fire(
        "Error",
        "No se pudo deshabilitar el usuario.",
        "error"
      );
    }
  };

  const handleRestoreUser = async (id) => {
    try {
      await dispatch(restoreUser(id));

      await showToast({
        icon: "success",
        title: "✅ Usuario reactivado",
      });

      await dispatch(getAllExistingUsers());
    } catch (error) {
      console.error(
        "Hubo un problema al reactivar el usuario:",
        error
      );

      Swal.fire(
        "Error",
        "No se pudo reactivar el usuario.",
        "error"
      );
    }
  };

  /* =====================================================
     PUBLICACIONES
  ===================================================== */

  const handleDeletePost = async (id) => {
    try {
      await dispatch(deletePost(id));

      await showToast({
        icon: "warning",
        title: "⛔ Publicación eliminada",
        timer: 2000,
      });

      await dispatch(getAllExistingPosts());
    } catch (error) {
      console.error(
        "Hubo un problema al eliminar la publicación:",
        error
      );

      Swal.fire(
        "Error",
        "No se pudo eliminar la publicación.",
        "error"
      );
    }
  };

  const handleDisablePost = async (id) => {
    try {
      await dispatch(disablePost(id));

      await showToast({
        icon: "warning",
        title: "⛔ Publicación deshabilitada",
        timer: 2000,
      });

      await dispatch(getAllExistingPosts());
    } catch (error) {
      console.error(
        "Hubo un problema al deshabilitar la publicación:",
        error
      );

      Swal.fire(
        "Error",
        "No se pudo deshabilitar la publicación.",
        "error"
      );
    }
  };

  const handleRestorePost = async (id) => {
    try {
      await dispatch(restorePost(id));

      await showToast({
        icon: "success",
        title: "✅ Publicación reactivada",
      });

      await dispatch(getAllExistingPosts());
    } catch (error) {
      console.error(
        "Hubo un problema al reactivar la publicación:",
        error
      );

      Swal.fire(
        "Error",
        "No se pudo reactivar la publicación.",
        "error"
      );
    }
  };

  /* =====================================================
     FILTROS USUARIOS
  ===================================================== */

  const handleSortByID = (event) => {
    const value = event.target.value;

    setSelectedUserID(value);

    dispatch(sortUsersByID(value));
  };

  const handleSortByPlan = (event) => {
    const value = event.target.value;

    setSelectedUserPlan(value);

    dispatch(
      sortUsersByPlan(
        value === "Estándar"
          ? "notPremium"
          : "premium"
      )
    );
  };

  const handleSortByStatus = (event) => {
    const value = event.target.value;

    setSelectedUserStatus(value);

    dispatch(sortUsersByStatus(value));
  };

  const handleResetUsersFilters = () => {
    setSelectedUserID("");
    setSelectedUserPlan("");
    setSelectedUserStatus("");

    dispatch(resetUsersFilter());
  };

  /* =====================================================
     FILTROS PUBLICACIONES
  ===================================================== */

  const handleSortPostByID = (event) => {
    const value = event.target.value;

    setSelectedPostID(value);

    dispatch(sortPostsByID(value));
  };

  const handleSortPostByStatus = (event) => {
    const value = event.target.value;

    setSelectedPostStatus(value);

    dispatch(sortPostsByStatus(value));
  };

  const handleResetPostsFilters = () => {
    setSelectedPostID("");
    setSelectedPostStatus("");

    dispatch(resetPostsFilter());
  };

  return (
    <main className={style.dashboard}>
      <header className={style.pageHeader}>
        <h3>Panel de Administrador</h3>
      </header>

      {/* =================================================
          ESTADÍSTICAS
      ================================================= */}

      <section
        className={style.topContainer}
        aria-label="Estadísticas"
      >
        <article className={style.tile}>
          <p>Activos</p>
          <h4 className={style.newUsers}>
            {activeUsers}
          </h4>
        </article>

        <article className={style.tile}>
          <p>Deshabilitados</p>
          <h4 className={style.delUsers}>
            {disabledUsers}
          </h4>
        </article>

        <article className={style.tile}>
          <p>Publicaciones</p>
          <h4 className={style.publications}>
            {allPostsCopy.length}
          </h4>
        </article>

        <article className={style.tile}>
          <p>Matches</p>
          <h4 className={style.matchs}>
            {allMatches.length}
          </h4>
        </article>

        <article className={style.tile}>
          <p>Premium</p>
          <h4 className={style.premium}>
            {premiumUsers}
          </h4>
        </article>
      </section>

      {/* =================================================
          FILTROS
      ================================================= */}

      <section className={style.filters}>
        {/* USUARIOS */}
        <div className={style.filterPanel}>
          <h3>Filtros de Usuario</h3>

          <div className={style.selectGroup}>
            <select
              onChange={handleSortByID}
              value={selectedUserID}
              aria-label="Ordenar usuarios por ID"
            >
              <option value="">
                ID
              </option>

              <option value="Ascendente">
                Ascendente
              </option>

              <option value="Descendente">
                Descendente
              </option>
            </select>

            <select
              onChange={handleSortByPlan}
              value={selectedUserPlan}
              aria-label="Filtrar usuarios por plan"
            >
              <option value="">
                Plan
              </option>

              <option value="Estándar">
                Estándar
              </option>

              <option value="Premium">
                Premium
              </option>
            </select>

            <select
              onChange={handleSortByStatus}
              value={selectedUserStatus}
              aria-label="Filtrar usuarios por estado"
            >
              <option value="">
                Estado
              </option>

              <option value="Activos">
                Activos
              </option>

              <option value="Deshabilitados">
                Deshabilitados
              </option>
            </select>

            <button
              type="button"
              onClick={handleResetUsersFilters}
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* PUBLICACIONES */}
        <div className={style.filterPanel}>
          <h3>Filtros de Publicaciones</h3>

          <div className={style.selectGroup}>
            <select
              onChange={handleSortPostByID}
              value={selectedPostsID}
              aria-label="Ordenar publicaciones por ID"
            >
              <option value="">
                ID
              </option>

              <option value="Ascendente">
                Ascendente
              </option>

              <option value="Descendente">
                Descendente
              </option>
            </select>

            <select
              onChange={handleSortPostByStatus}
              value={selectedPostStatus}
              aria-label="Filtrar publicaciones por estado"
            >
              <option value="">
                Estado
              </option>

              <option value="Activas">
                Activas
              </option>

              <option value="Deshabilitadas">
                Deshabilitadas
              </option>
            </select>

            <button
              type="button"
              onClick={handleResetPostsFilters}
            >
              Limpiar
            </button>
          </div>
        </div>
      </section>

      {/* =================================================
          LISTAS
      ================================================= */}

      <section className={style.bottomContainer}>
        {/* USUARIOS */}
        <article className={style.column}>
          <h3 className={style.columnTitle}>
            Usuarios
          </h3>

          <div className={style.list}>
            {allUsers.map((user) => (
              <div
                key={user.id}
                className={style.element}
              >
                <h4>
                  ID: {user.id}
                </h4>

                <h4
                  className={style.userInfo}
                  title={`${user.username} ${user.email}`}
                >
                  <span className={style.username}>
                    {user.username}
                  </span>

                  <span className={style.email}>
                    {user.email}
                  </span>
                </h4>

                <span
                  className={
                    user.Deshabilitado
                      ? style.statusDisabled
                      : style.statusActive
                  }
                >
                  {user.Deshabilitado
                    ? "Deshabilitado"
                    : "Activo"}
                </span>

                {user.plan === "premium" ? (
                  <img
                    width="24"
                    height="24"
                    src="https://img.icons8.com/color/48/guarantee.png"
                    alt="Usuario premium"
                    className={style.planIcon}
                    loading="lazy"
                  />
                ) : (
                  <img
                    width="24"
                    height="24"
                    src={notpremium}
                    alt="Usuario estándar"
                    className={style.planIcon}
                    loading="lazy"
                  />
                )}

                <button
                  type="button"
                  onClick={() =>
                    handleDisableUser(user.id)
                  }
                  disabled={user.Deshabilitado}
                  aria-label={`Deshabilitar usuario ${user.username}`}
                >
                  <img
                    width="20"
                    height="20"
                    src="https://img.icons8.com/fluency/48/cancel-2.png"
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                  />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleRestoreUser(user.id)
                  }
                  disabled={!user.Deshabilitado}
                  aria-label={`Reactivar usuario ${user.username}`}
                >
                  <img
                    width="20"
                    height="20"
                    src="https://img.icons8.com/color/48/ok--v1.png"
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                  />
                </button>
              </div>
            ))}
          </div>
        </article>

        {/* PUBLICACIONES */}
        <article className={style.column}>
          <h3 className={style.columnTitle}>
            Publicaciones
          </h3>

          <div className={style.list}>
            {allPosts.map((post) => (
              <div
                key={post.id}
                className={style.element}
              >
                <h4>
                  ID: {post.id}
                </h4>

                <h4
                  className={style.postTitle}
                  title={post.title}
                >
                  {post.title}
                </h4>

                <span
                  className={
                    post.Deshabilitado
                      ? style.statusDisabled
                      : style.statusActive
                  }
                >
                  {post.Deshabilitado
                    ? "Deshabilitada"
                    : "Activa"}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    handleDeletePost(post.id)
                  }
                  aria-label={`Eliminar publicación ${post.id}`}
                >
                  <img
                    width="20"
                    height="20"
                    src="https://img.icons8.com/fluency/48/delete-forever.png"
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                  />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleDisablePost(post.id)
                  }
                  disabled={post.Deshabilitado}
                  aria-label={`Deshabilitar publicación ${post.id}`}
                >
                  <img
                    width="20"
                    height="20"
                    src="https://img.icons8.com/fluency/48/cancel-2.png"
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                  />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleRestorePost(post.id)
                  }
                  disabled={!post.Deshabilitado}
                  aria-label={`Reactivar publicación ${post.id}`}
                >
                  <img
                    width="20"
                    height="20"
                    src="https://img.icons8.com/color/48/ok--v1.png"
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                  />
                </button>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
};

export default AdminDash;