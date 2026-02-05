import axios from "axios";

export const api = axios.create({
  // baseURL: "https://geo-attendance-tracker.onrender.com",
  baseURL: "http://192.168.1.40:5000",
  headers: {
    "Content-Type": "application/json",
  },
});
