import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { GlobalStyle, theme } from './theme';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ZettelContextProvider } from './zettel';

import Home from './scenes/home';
import Zettel from './scenes/zettel';

const App = () => (
    <ThemeProvider theme={theme}>
        <GlobalStyle />
        <ZettelContextProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/zettel/:id" element={<Zettel />} />
                </Routes>
            </Router>
        </ZettelContextProvider>
    </ThemeProvider>
);

const root = createRoot(document.getElementById('root'));
root.render(<App />);
