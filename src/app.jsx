import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import {
    HashRouter,
    Route,
    Routes
} from "react-router-dom";
import Login from './login';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <HashRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                {/* <Route path="/firstPage" component={FirstPage} />
                <Route path="/secondPage" component={SecondPage} /> */}
            </Routes>
        </HashRouter>
    </React.StrictMode>
);
