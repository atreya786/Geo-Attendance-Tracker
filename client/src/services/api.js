import axios from "axios";

export const api = axios.create({
  baseURL: "http://192.168.1.43:5000", // Own Laptop IP, changes periodically
  headers: {
    "Content-Type": "application/json",
  },
});
