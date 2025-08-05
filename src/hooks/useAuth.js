import { useEffect } from "react";
import { useNavigate } from "react-router";

export const useAuth = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        const currentPath = window.location.pathname;
        if (!token && currentPath !== "/login") {
            navigate("/login", { replace: true });
            return;
        }
        // If token exists, validate it
        if (token && currentPath !== "/login") {
            fetch("http://localhost:8000/me", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then((res) => {
                    if (res.status === 401) {
                        window.alert(
                            "Session expired or invalid token. Please login again.",
                        );
                        localStorage.removeItem("access_token");
                        navigate("/login", { replace: true });
                    }
                })
                .catch(() => {
                    window.alert(
                        "Session expired or invalid token. Please login again.",
                    );
                    localStorage.removeItem("access_token");
                    navigate("/login", { replace: true });
                });
        }
    }, [navigate]);
};
