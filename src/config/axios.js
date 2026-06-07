const axios = require("axios");

function createClient({
                          baseURL,
                          timeout = 30000,
                          headers = {},
                          auth = null
                      }) {
    const client = axios.create({
        baseURL,
        timeout,
        headers: {
            "Content-Type": "application/json",
            ...headers
        }
    });

    client.interceptors.request.use(
        config => {

            // CASE 1: static API key header (X-KEY etc.)
            if (auth?.type === "header") {
                config.headers[auth.headerName] = auth.value;
            }

            // CASE 2: bearer token (static)
            if (auth?.type === "bearer") {
                config.headers.Authorization = `Bearer ${auth.value}`;
            }

            // CASE 3: dynamic auth injection (per request override)
            if (config.meta?.authHeader) {
                config.headers[config.meta.authHeader.name] =
                    config.meta.authHeader.value;
            }

            return config;
        },
        error => Promise.reject(error)
    );

    client.interceptors.response.use(
        response => response,
        error => {
            if (error.response) {
                const status = error.response.status;

                const message =
                    error.response.data?.message ||
                    error.response.statusText;

                const apiError = new Error(
                    `API Error ${status}: ${message}`
                );

                apiError.status = status;
                apiError.data = error.response.data;

                throw apiError;
            }

            if (error.request) {
                throw new Error("No response received from API");
            }

            throw error;
        }
    );

    return client;
}

module.exports = createClient;