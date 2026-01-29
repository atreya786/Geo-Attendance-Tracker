import axios from "axios";

export const api = axios.create({
  baseURL: "http://192.168.1.41:5000", // Own Laptop IP
  headers: {
    "Content-Type": "application/json",
  },
});
