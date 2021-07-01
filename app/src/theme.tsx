import { createGlobalStyle } from 'styled-components';

export const theme = {
    sidebarWidth: 240,
};

export const GlobalStyle = createGlobalStyle`
    * {
        box-sizing: border-box;
    }

    html, body {
        margin: 0;
        padding: 0;
    }
`;
