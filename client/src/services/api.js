import axios from "axios";

const PROD_URL = "https://geo-attendance-tracker.onrender.com";
const DEV_URL = "http://192.168.1.53:5000";

export const api = axios.create({
  baseURL: PROD_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
