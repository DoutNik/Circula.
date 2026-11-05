import test from "node:test";
import assert from "node:assert/strict";
import reducer from "../src/redux/reducer.js";
import { GET_ALL_POSTS, SELECT_PROVINCE, SELECT_LOCALITY, SELECT_CATEGORY, RESET_FILTERS } from "../src/redux/actionTypes.js";

test("Los filtros se combinan y cambiar de provincia descarta la localidad anterior", () => {
  const posts = [
    { id: 1, ubication: " Córdoba, Villa María ", category: "Libros" },
    { id: 2, ubication: "Córdoba, Capital", category: "Libros" },
    { id: 3, ubication: "Salta, Capital", category: "Libros" },
    { id: 4, category: "Juegos" },
  ];
  let state = reducer(undefined, { type: GET_ALL_POSTS, payload: posts });
  const select = (type, payload) => { state = reducer(state, { type, payload }); };
  select(SELECT_CATEGORY, "Libros");
  select(SELECT_PROVINCE, "Córdoba");
  select(SELECT_LOCALITY, "Villa María");
  assert.deepEqual(state.allPosts, [posts[0]]);
  select(SELECT_PROVINCE, "Salta");
  assert.equal(state.selectedLocality, "");
  assert.deepEqual(state.allPosts, [posts[2]]);
  select(SELECT_CATEGORY, "Juegos");
  assert.deepEqual(state.allPosts, []);
  select(RESET_FILTERS);
  assert.deepEqual(state.allPosts, posts);
});
