import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { GlobalStyle, theme } from './theme';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ZettelContextProvider } from './zettel';

import Home from './scenes/home';
import Search from './scenes/search';
import Zettel from './scenes/zettel';

const App = () => (
    <ThemeProvider theme={theme}>
        <GlobalStyle />
        <ZettelContextProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/zettel/:id" element={<Zettel />} />
                </Routes>
            </Router>
        </ZettelContextProvider>
    </ThemeProvider>
);

ReactDOM.render(<App />, document.getElementById('root'));
