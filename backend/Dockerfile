# Start from the official Golang image
FROM golang:1.27-alpine

# Install Chromium (required for chromedp HTML-to-PDF)
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set environment variable so chromedp knows where to find Chromium
ENV CHROME_BIN=/usr/bin/chromium-browser

# Set the working directory inside the container
WORKDIR /app

# Copy the go mod files and download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the source code
COPY . .

# Build the Go application
RUN go build -o main .

# Expose the port Gin runs on
EXPOSE 8080

# Run the compiled binary
CMD ["./main"]
