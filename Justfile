dist:
    cd app && npx webpack --config webpack.dev.js

distprod:
    cd app && npx webpack --config webpack.production.js
