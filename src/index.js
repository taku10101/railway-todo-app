import React from "react";
import ReactDOM from "react-dom";
import "./index.scss";
import App from "./App";

import { CookiesProvider } from "react-cookie";
import { Provider } from "react-redux";
import { store } from "./store";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <Provider store={store}>
        <CookiesProvider>
            <App />
        </CookiesProvider>
    </Provider>,
    document.getElementById("root")
);
