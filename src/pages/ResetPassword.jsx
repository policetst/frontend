    import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useParams, useNavigate } from "react-router-dom";
import { checkLoginStatus } from "../funcs/Users";
import { getTokenFromCookie } from "../funcs/Incidents";
const USERS_URL = import.meta.env.VITE_USERS_URL; 
import { Eye, EyeOff } from "lucide-react";

const ResetPassword = ({ onSuccess }) => {
  const navigate = useNavigate();
  const { code } = useParams(); // Obtiene el código del usuario desde la URL

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!email) {
      setMsg("Debes escribir tu correo electrónico.");
      return;
    }
  
    if (password !== confirmPassword) {
      setMsg("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.put(
        `${USERS_URL}/${code}/passwordd`,
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getTokenFromCookie()}`,
          },
        }
      );
      if (res.data.ok) {
        Swal.fire({
          title: "Éxito",
          text: "¡Contraseña actualizada correctamente!",
          icon: "success",
        });
        if (onSuccess) onSuccess();
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMsg("No se pudo cambiar la contraseña.");
      }
    } catch (err) {
      setMsg("Error al cambiar la contraseña.");
    } finally {
      setLoading(false);
    }
  };
  const changeVisivility = () => setShowPassword((prev) => !prev);
  const changeConfirmVisivility = () => setShowConfirmPassword((prev) => !prev);

  useEffect(() => {
    const checkUserStatus = async () => {
      const isLoggedIn = await checkLoginStatus(code);
      if (!isLoggedIn) {
        navigate("/login");
      }
    };
    checkUserStatus();
  }, [navigate, code]);

  return (
    <div style={{
      maxWidth: 400,
      margin: "0 auto",
      padding: 32,
      border: "1px solid #e3e3e3",
      borderRadius: 16,
      boxShadow: "0 2px 12px #0001"
    }}>
      <h2>Cambiar contraseña</h2>
      <hr  className="border border-gray-300 my-4"/>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Correo electrónico</label>
        <input
          className="border border-gray-300 rounded-md"
          type="email"
          id="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", margin: "12px 0", padding: 8 }}
        />
        <label htmlFor="password">Nueva contraseña</label>
        <div style={{ position: "relative", width: "100%" }}>
          <input
            className="border border-gray-300 rounded-md"
            type={showPassword ? "text" : "password"}
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            style={{ width: "100%", margin: "12px 0", padding: 8, paddingRight: 40 }}
          />
          <button
            type="button"
            onClick={changeVisivility}
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4
            }}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <label htmlFor="confirm">Confirmar contraseña</label>
        <div style={{ position: "relative", width: "100%" }}>
          <input
            className="border border-gray-300 rounded-md"
            type={showPassword ? "text" : "password"}
            id="confirm"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            style={{ width: "100%", marginBottom: 16, padding: 8, paddingRight: 40 }}
          />
          <button
            type="button"
            onClick={changeConfirmVisivility}
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4
            }}
          >
            {/* {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />} */}
          </button>
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 10,
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer"
          }}
        >
          {loading ? "Actualizando..." : "Cambiar contraseña"}
        </button>
      </form>
      {msg && <p style={{ color: msg.startsWith("¡") ? "green" : "red", marginTop: 12 }}>{msg}</p>}
    </div>
  );
};

export default ResetPassword;
