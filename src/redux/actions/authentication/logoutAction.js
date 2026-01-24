import { GET_ERRORS } from "../../types/error";
import axios from "axios";
import { logoutTypes, coreTypes } from "../../types/authentication";
import { API_BASE_URL } from "../../../Costants";
import api from "../../../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../../Costants";


export const logout = (navigation) =>  (dispatch) => {
  const userType = localStorage.getItem("user_type");
  
  localStorage.removeItem(ACCESS_TOKEN);
  localStorage.removeItem(REFRESH_TOKEN);
  localStorage.removeItem("persist:root");
  localStorage.removeItem("user_type");
  
  dispatch({ type: logoutTypes.LOGOUT });
  dispatch({ type: coreTypes.RESET });
  dispatch({ type: coreTypes.RESET });
  dispatch({ type: coreTypes.RESET });
  
  // Redirect based on user type if navigation is provided
  if (navigation) {
    if (userType === 'external_counselor') {
      navigation("/unisync360/external-counselor-login");
    } else if (userType === 'lead_lancer') {
      navigation("/unisync360/lead-lancer-login");
    } else {
      navigation("/auth/login");
    }
  }
};
