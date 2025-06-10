import { useNavigate, useRouteError } from "react-router-dom";
import { ShieldAlert } from 'lucide-react'; // Lucide o puedes usar un SVG propio

export default function Error() {
  const navigate = useNavigate();
  const error = useRouteError && useRouteError();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#e6f0f8]">
      <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center max-w-md">
        <ShieldAlert size={64} className="text-[#002856] mb-2" />
        <h1 className="text-4xl font-bold text-[#002856] mb-2">Error en la aplicación</h1>
        <p className="text-lg text-gray-600 mb-3">
          {error?.status === 404
            ? "La página que buscas no existe."
            : "Ha ocurrido un error inesperado en la gestión policial."}
        </p>
        {error?.statusText && (
          <p className="text-sm text-gray-400 mb-2">{error.statusText}</p>
        )}
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-6 py-2 rounded-xl bg-[#002856] text-white font-semibold shadow hover:bg-[#0092CA] transition"
        >
          Volver al panel principal
        </button>
        <div className="mt-6 text-xs text-gray-400">
          {error?.status && <span>Código de error: {error.status}</span>}
        </div>
      </div>
    </div>
  );
}
