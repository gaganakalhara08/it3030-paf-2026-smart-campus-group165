import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

export const signup = async (data) => {
  return axios.post(`${API_URL}/signup`, data);
};

export const login = async (data) => {
  return axios.post(`${API_URL}/login`, data);
};
