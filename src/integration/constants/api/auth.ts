export const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://main-api.imetsedu.com";
export const AUTH = API_URL + "/auth";

// Auth
export const API_REGISTER = AUTH + "/register"; // POST
export const API_LOGIN = AUTH + "/login"; // POST
export const API_PROFILE = AUTH + "/profile"; // GET (authenticated)
export const API_FORGOT_PASSWORD = AUTH + "/forgot-password"; // POST
export const API_RESET_PASSWORD = AUTH + "/reset-password"; // POST
export const API_CHANGE_PASSWORD = AUTH + "/change-password"; // POST (authenticated)
export const API_REFRESH_TOKEN = AUTH + "/refresh"; // POST (send refresh token in body)

// Social Login
export const API_GOOGLE_LOGIN = AUTH + "/google"; // GET
export const API_GOOGLE_LOGIN_REDIRECT = AUTH + "/google/redirect"; // GET ?code&scope
export const API_FACEBOOK_LOGIN = AUTH + "/facebook"; // GET
export const API_FACEBOOK_LOGIN_REDIRECT = AUTH + "/facebook/redirect"; // GET
