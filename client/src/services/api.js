import axios from "axios";

const PROD_URL = "https://geo-attendance-tracker.onrender.com";
const DEV_URL = "http://192.168.1.40:5000";

export const api = axios.create({
  baseURL: DEV_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
