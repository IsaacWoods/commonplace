import { createGlobalStyle } from 'styled-components';
import normalizeStyle from 'styled-normalize';

export const theme = {
    background: "#ffffff",
    text: "#141419",
    placeholder: "#a2b2b4",

    sidebarWidth: 240,
    sidebarColor: "rgba(247, 246, 243)",

    headerDepth: 500,
};

export const GlobalStyle = createGlobalStyle<{ theme: { text: string } }>`
    ${normalizeStyle}

    * {
        box-sizing: border-box;
    }

    body {
        font-family: -apply-system, sans-serif;
        text-rendering: optimizeLegibility;
        color: ${props => props.theme.text};
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
        font-weight: 500;
        line-height: 1.25;
        margin-top: 1em;
        margin-bottom: 0.5em;
    }
    h1 { font-size: 2.25em; }
    h2 { font-size: 1.5em; }
    h3 { font-size: 1.25em; }
    h4 { font-size: 1em; }
    h5 { font-size: 0.875em; }
    h6 { font-size: 0.75em; }
`;
