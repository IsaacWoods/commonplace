FROM --platform=$BUILDPLATFORM rustlang/rust:nightly as server_builder
    COPY commonplace commonplace
    WORKDIR server
    ARG TARGETPLATFORM
    # Use a fake project to build the dependencies into a layer. This allows the layer to be cached.
    COPY server/.cargo/config .cargo/config
    COPY server/Cargo.toml Cargo.toml
    RUN mkdir src/
    RUN echo "fn main() { panic!(\"If you see this, the Docker build has not worked correctly :(\"); }" >src/main.rs
    RUN apt-get update -y
    RUN apt-get install -y lld
    RUN case "${TARGETPLATFORM}" in \
            "linux/amd64")  TARGET=x86_64-unknown-linux-musl ;; \
            "linux/arm64")  TARGET=aarch64-unknown-linux-musl ;; \
            *) exit 69 ;; \
        esac; \
        rustup target add $TARGET
    RUN case "${TARGETPLATFORM}" in \
            "linux/amd64")  TARGET=x86_64-unknown-linux-musl ;; \
            "linux/arm64")  TARGET=aarch64-unknown-linux-musl ;; \
            *) exit 69 ;; \
        esac; \
        cargo build --release --target $TARGET
    RUN rm -f target/release/deps/server*
    # Copy the real code over and build it
    COPY server/ .
    RUN case "${TARGETPLATFORM}" in \
            "linux/amd64")  TARGET=x86_64-unknown-linux-musl ;; \
            "linux/arm64")  TARGET=aarch64-unknown-linux-musl ;; \
            *) exit 1 ;; \
        esac; \
        cargo build --release --target $TARGET
    RUN case "${TARGETPLATFORM}" in \
            "linux/amd64")  TARGET=x86_64-unknown-linux-musl ;; \
            "linux/arm64")  TARGET=aarch64-unknown-linux-musl ;; \
            *) exit 1 ;; \
        esac; \
        cargo install --path . --target $TARGET

FROM --platform=$BUILDPLATFORM node as app_builder
    WORKDIR app
    COPY app/package.json package.json
    COPY app/yarn.lock yarn.lock
    RUN yarn set version berry
    RUN yarn install
    COPY app/src/ ./src/
    COPY app/webpack.common.js app/webpack.production.js app/tsconfig.json ./
    # COPY app/ .
    RUN yarn webpack --config webpack.production.js

# TODO: use a lighter image? Alpine would require us to build against musl
FROM ubuntu:latest
    COPY --from=server_builder /usr/local/cargo/bin/server /usr/local/bin/server
    COPY --from=app_builder app/dist/ /dist/
    ENV ROCKET_ADDRESS="0.0.0.0"
    ENV ROCKER_DIST_DIR="/dist/"
    CMD ["server"]
