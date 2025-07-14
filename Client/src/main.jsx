/* eslint-disable no-unused-vars */
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { Provider } from "react-redux";
import "./index.css";
import store from "./redux/store";


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <Provider store={store}>
      <HashRouter>
        <App />
      </HashRouter>
    </Provider>
);
