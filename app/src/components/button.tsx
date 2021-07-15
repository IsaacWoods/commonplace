import * as React from 'react';
import styled from 'styled-components';

const Button = styled.button`
    outline: none;
    border: none;
    border-radius: 3px;
    padding: 4px 8px;
    height: 28px;

    cursor: pointer;

    color: ${props => props.theme.text};
    background-color: ${props => props.theme.buttonBackground};

    &:hover {
        background-color: ${props => props.theme.buttonSelected};
        transition: background-color 100ms ease-in-out;
    }
`;

export default Button;
