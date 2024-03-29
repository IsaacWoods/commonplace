FROM --platform=$BUILDPLATFORM rustlang/rust:nightly as chef
    RUN cargo install cargo-chef
    # Move source dependencies over
    COPY commonplace commonplace
    WORKDIR server

FROM --platform=$BUILDPLATFORM chef as server_planner
    COPY server/ .
    COPY server/.cargo ./.cargo
    RUN cargo chef prepare --recipe-path recipe.json

FROM --platform=$BUILDPLATFORM chef as server_builder
    COPY --from=server_planner /server/recipe.json recipe.json
    COPY server/.cargo ./.cargo
    # Install the target
    ARG TARGETPLATFORM
    RUN case "${TARGETPLATFORM}" in \
            "linux/amd64")  TARGET=x86_64-unknown-linux-musl ;; \
            "linux/arm64")  TARGET=aarch64-unknown-linux-musl ;; \
            *) exit 69 ;; \
        esac; \
        rustup target add $TARGET
    RUN apt-get update -y
    RUN apt-get install -y lld
    # Cache the dependencies
    RUN case "${TARGETPLATFORM}" in \
            "linux/amd64")  TARGET=x86_64-unknown-linux-musl ;; \
            "linux/arm64")  TARGET=aarch64-unknown-linux-musl ;; \
            *) exit 69 ;; \
        esac; \
        cargo chef cook --release --target $TARGET --recipe-path recipe.json
    # Actually build
    COPY server/ .
    RUN case "${TARGETPLATFORM}" in \
            "linux/amd64")  TARGET=x86_64-unknown-linux-musl ;; \
            "linux/arm64")  TARGET=aarch64-unknown-linux-musl ;; \
            *) exit 69 ;; \
        esac; \
        cargo build --release --target $TARGET --bin server
    # Install to avoid needing to specify the target in the runtime container
    RUN case "${TARGETPLATFORM}" in \
            "linux/amd64")  TARGET=x86_64-unknown-linux-musl ;; \
            "linux/arm64")  TARGET=aarch64-unknown-linux-musl ;; \
            *) exit 69 ;; \
        esac; \
        cargo install --target $TARGET --path .

FROM --platform=$BUILDPLATFORM node as app_builder
    WORKDIR app
    COPY app/package.json package.json
    COPY app/package-lock.json package-lock.json
    COPY app/src/ ./src/
    COPY app/webpack.common.js app/webpack.production.js app/tsconfig.json ./
    RUN npm install -D webpack webpack-cli
    RUN npx webpack --config webpack.production.js

FROM alpine:latest
    COPY --from=server_builder /usr/local/cargo/bin/server /usr/local/bin/server
    COPY --from=app_builder app/dist/ /dist/
    ENV ROCKET_ADDRESS="0.0.0.0"
    ENV ROCKET_DIST_DIR="/dist/"
    EXPOSE 8000
    VOLUME /db
    VOLUME /index
    CMD ["server"]
