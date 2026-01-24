import { jwtDecode } from "jwt-decode";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../../Costants";
import api from "../../api";
import LinearIndeterminate from "../../LinearIndeterminate";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        checkAuthStatus(); // Run auth check when app starts

        const interval = setInterval(() => {
            checkAuthStatus();
        }, 5 * 60 * 1000); // Check every 5 minutes

        return () => clearInterval(interval);
    }, []);

    const checkAuthStatus = async () => {
        const accessToken = localStorage.getItem(ACCESS_TOKEN);

        if (!accessToken) {
            logout();
            return;
        }

        try {
            const decoded = jwtDecode(accessToken);
            const tokenExpiration = decoded.exp;
            const now = Date.now() / 1000;

            if (tokenExpiration < now) {
                await refreshToken();
            } else {
                setUser(decoded);
            }
        } catch (error) {
            console.error("Invalid token:", error);
            logout();
        }
    };

    const refreshToken = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        if (!refreshToken) {
            logout();
            return;
        }

        try {
            const res = await api.post("/token/refresh/", { refresh: refreshToken });
            if (res.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                setUser(jwtDecode(res.data.access));
            } else {
                logout();
            }
        } catch (error) {
            console.log("Failed to refresh token:", error);
            logout();
        }
    };

    const logout = () => {
        console.log("Logging out user...");
        const userType = localStorage.getItem("user_type");
        
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
        localStorage.removeItem("user_type");
        setUser(null);
        
        // Redirect based on user type
        if (userType === 'external_counselor') {
            navigate("/unisync360/external-counselor-login");
        } else if (userType === 'lead_lancer') {
            navigate("/unisync360/lead-lancer-login");
        } else {
            navigate("/auth/login");
        }
    };

    return (
        <AuthContext.Provider value={{ user, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
