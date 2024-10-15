import axios from "feaxios";

const http = axios.create({
  timeout: 3 * 1000 * 60,
  baseURL: "/api",
});

export default http;
