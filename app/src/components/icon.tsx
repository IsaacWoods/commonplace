import * as React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

export default function Icon(props) {
    return (
        <IconLink to="/">
        <svg
           width="14.5mm"
           height="12.7mm"
           viewBox="0 0 14.5 12.7"
           version="1.1"
           xmlns="http://www.w3.org/2000/svg">
          <g>
            <circle
               fill="#6a6a6a"
               stroke="#6a6a6a"
               strokeWidth="0.4096"
               cx="8.854"
               cy="2.4864"
               r="2.048" />
            <path
               fill="none"
               stroke="#6a6a6a"
               strokeWidth="0.438636"
               d="m 11.085,6.506 c -0.249246,3.740963 1.490215,4.096162 2.255849,3.269979 0.76499,-0.825492 0.926648,-2.436611 0.113413,-3.363562 -1.306306,-1.488969 -3.682564,-0.777063 -6.211438,-0.06388 -2.528874,0.713179 -4.964389,1.437892 -6.270694,-0.05107 -0.813235,-0.926951 -0.651577,-2.53807 0.113413,-3.363562 0.765634,-0.826183 2.505094,-0.470984 2.255849,3.269979" />
            <circle
               fill="none"
               stroke="#6a6a6a"
               strokeWidth="0.4096"
               cx="5.578"
               cy="10.215"
               r="2.048" />
          </g>
        </svg>
        </IconLink>
    );
}

// We utilise the styled link to darken the SVG when it's hovered. This is a little messy to
// correctly alter the fill of one of the circles, and utilises/abuses the fact that it's the first
// element described by the SVG.
const IconLink = styled(Link)`
    border: none;

    &:hover {
        border: none;
    }

    > svg * {
        transition: all ease 0.1s;
    }

    > svg:hover *:first-child {
        fill: #303030;
    }

    > svg:hover * {
        transition: all ease 0.1s;
        stroke: #303030;
    }
`;
