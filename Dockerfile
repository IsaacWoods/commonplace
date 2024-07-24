FROM docker.io/rustlang/rust:nightly as chef
    RUN cargo install cargo-chef

FROM chef as server_planner
    COPY . .
    RUN cargo chef prepare --recipe-path recipe.json

FROM chef as server_builder
    COPY --from=server_planner recipe.json recipe.json
    # Cache built dependencies in a separate layer
    RUN cargo chef cook --release --recipe-path recipe.json
    COPY . .
    ENV COMMONPLACE_DIST_DIR="/dist/"
    RUN cargo build --release

FROM --platform=$BUILDPLATFORM node as app_builder
    WORKDIR app
    COPY app/package.json package.json
    COPY app/package-lock.json package-lock.json
    COPY app/src/ ./src/
    COPY app/webpack.common.js app/webpack.production.js app/tsconfig.json ./
    ARG TIPTAP_PRO_TOKEN
    RUN npm config set "@tiptap-pro:registry" https://registry.tiptap.dev/ && npm config set "//registry.tiptap.dev/:_authToken" ${TIPTAP_PRO_TOKEN}
    RUN npm install -D webpack webpack-cli
    RUN npx webpack --config webpack.production.js

FROM debian:bookworm-slim
    COPY --from=server_builder /target/release/commonplace /usr/local/bin/commonplace
    COPY --from=app_builder app/dist/ /dist/
    EXPOSE 8000
    VOLUME /db
    VOLUME /index
    CMD ["commonplace"]
