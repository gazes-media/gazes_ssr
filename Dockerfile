# syntax=docker/dockerfile:1

ARG GO_VERSION=1.21.4

# Create a stage for building the application.
FROM golang:${GO_VERSION} AS build
WORKDIR /src

RUN --mount=type=cache,target=/go/pkg/mod/ \
    --mount=type=bind,source=go.sum,target=go.sum \
    --mount=type=bind,source=go.mod,target=go.mod \
    go mod download -x

RUN --mount=type=cache,target=/go/pkg/mod/ \
    --mount=type=bind,target=. \
    CGO_ENABLED=0 go build -o /bin/server .

# Copy the 'public' folder from the local directory into the container.
FROM build AS copy-public
WORKDIR /app

COPY public /app/public

################################################################################
# Create a new stage for running the application that contains the minimal
# runtime dependencies for the application.
FROM alpine:latest AS final

RUN --mount=type=cache,target=/var/cache/apk \
    apk --update add \
        ca-certificates \
        tzdata \
        && \
        update-ca-certificates

ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser
USER appuser

# Create a directory for the application and set it as the working directory.
WORKDIR /app

# Copy the executable from the "build" stage into the current directory.
COPY --from=build /bin/server .

# Copy the 'public' folder from the "copy-public" stage into the current directory.
COPY --from=copy-public /app/public ./public

# Expose the port that the application listens on.
EXPOSE 5454

# What the container should run when it is started.
ENTRYPOINT [ "/app/server" ]
