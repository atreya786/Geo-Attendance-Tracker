import axios from "axios";

// 1. Define your environments
const PROD_URL = "https://geo-attendance-tracker.onrender.com";
const DEV_URL = "http://192.168.1.40:5000";

// 2. Automatically pick the right one
// If you are running 'npx expo start', this uses DEV_URL.
// If you run 'eas build --profile preview', this uses PROD_URL.
const baseURL = __DEV__ ? DEV_URL : PROD_URL;

export const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});
