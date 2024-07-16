import { createGlobalStyle } from 'styled-components';
import normalizeStyle from 'styled-normalize';
import { lighten } from 'polished';

export const theme = {
    background: "#ffffff",
    text: "rgb(55, 53, 48)",
    placeholder: "#a2b2b4",
    divider: "#e6e6eb",
    link: "rgb(80, 80, 80)",

    fontFamily: "-apple-system, sans-serif",
    fontFamilyMono: "monospace",

    sidebarWidth: 240,
    sidebarColor: "rgb(247, 246, 243)",

    insertMenuBackground: "#ffffff",
    insertMenuSelected: "rgb(220, 225, 230)",

    buttonBackground: "rgb(240, 240, 240)",
    buttonSelected: "rgb(220, 225, 230)",

    headerDepth: 500,
};

export const GlobalStyle = createGlobalStyle<{ theme: { text: string, link: string, fontFamily: string } }>`
    ${normalizeStyle}

    * {
        box-sizing: border-box;
    }

    body {
        font-family: ${props => props.theme.fontFamily};
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

    a {
        color: ${props => props.theme.link};
        text-decoration: none;
        border-bottom: 1px solid ${props => lighten(0.5, props.theme.link)};
        cursor: pointer;

        &:hover {
            border-bottom: 1px solid ${props => props.theme.link};
        }
    }
`;
