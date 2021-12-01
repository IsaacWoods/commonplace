import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { GlobalStyle, theme } from './theme';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ZettelCacheProvider } from './zettel';

import Home from './scenes/home';
import Search from './scenes/search';
import Zettel from './scenes/zettel';

const App = () => (
    <ThemeProvider theme={theme}>
        <GlobalStyle />
        <ZettelCacheProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/zettel/:id" element={<Zettel />} />
                </Routes>
            </Router>
        </ZettelCacheProvider>
    </ThemeProvider>
);

ReactDOM.render(<App />, document.getElementById('root'));
