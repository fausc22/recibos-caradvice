'use client';

import { useState } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function Home() {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleActualizar = async () => {
    setLoading(true);
    setResponse('');
    try {
      const res = await fetch('https://distri-api.duckdns.org/ima/generar-reporte');
      const json = await res.json();

      const { success, message, data } = json;
      const output = data?.output || '';
      const linkDrive = output.match(/https:\/\/docs\.google\.com\/spreadsheets\/[^\s]+/g) || [];

      const legible = `
✅ ${message}

📝 ${data?.message || ''}

📄 Resultados:
------------------------------
${output.trim()}

🔗 Links útiles:
${linkDrive.join('\n') || 'No se encontraron links.'}
      `;

      setResponse(legible.trim());
    } catch (error) {
      setResponse('❌ Error al hacer la llamada a la API.');
    } finally {
      setLoading(false);
    }
  };

  const handleLimpiar = () => {
    // Recargar la página para resetear todo
    window.location.reload();
  };

  return (
    <div
      className={`${geistSans.className} ${geistMono.className} bg-black text-white flex flex-col items-center justify-center min-h-screen p-6 gap-6 text-center`}
    >
      <h1 className="text-2xl sm:text-3xl font-bold">Actualizar archivo Excel</h1>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={handleActualizar}
          disabled={loading}
          className="bg-white text-black hover:bg-gray-200 disabled:bg-gray-500 font-semibold text-lg py-4 px-8 rounded-lg w-full sm:w-auto transition duration-300"
        >
          {loading ? 'Actualizando...' : 'ACTUALIZAR EXCEL'}
        </button>

        {response && (
          <button
            onClick={handleLimpiar}
            className="bg-red-600 text-white hover:bg-red-700 font-semibold text-lg py-4 px-8 rounded-lg w-full sm:w-auto transition duration-300"
          >
            LIMPIAR
          </button>
        )}
      </div>

      {response && (
        <textarea
          readOnly
          value={response}
          className="w-full max-w-2xl h-[500px] p-4 text-sm font-mono bg-gray-900 text-white border border-gray-700 rounded-lg shadow-sm whitespace-pre-wrap"
        />
      )}
    </div>
  );
}
