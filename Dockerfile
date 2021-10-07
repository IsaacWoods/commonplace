FROM rustlang/rust:nightly as server_builder
COPY commonplace commonplace
WORKDIR server
# Use a fake project to build the dependencies into a layer. This allows the layer to be cached.
COPY server/Cargo.toml Cargo.toml
RUN mkdir src/
RUN echo "fn main() { panic!(\"If you see this, the Docker build has not worked correctly :(\"); }" >src/main.rs
RUN cargo build --release
RUN rm -f target/release/deps/server*
# Copy the real code over and build it
COPY server/ .
RUN cargo build --release
RUN cargo install --path .

FROM node as app_builder
WORKDIR app
COPY app/package.json package.json
COPY app/yarn.lock yarn.lock
RUN npm install -g yarn
RUN yarn set version berry
RUN yarn install
COPY app/src/ ./src/
COPY app/webpack.common.js app/webpack.production.js app/tsconfig.json ./
# COPY app/ .
RUN yarn webpack --config webpack.production.js

# TODO: use a lighter image? Alpine would require us to build against musl
FROM ubuntu:latest
COPY --from=server_builder /usr/local/cargo/bin/server /usr/local/bin/server
COPY --from=app_builder app/dist/ /app/dist/
# XXX: this is a hack to make the relative path to /dist work properly from Rocket. There is probably a better way...
RUN mkdir /server
ENV ROCKET_ADDRESS="0.0.0.0"
CMD ["server"]
