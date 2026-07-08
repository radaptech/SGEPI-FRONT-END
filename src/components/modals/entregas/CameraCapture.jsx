import { useRef } from 'react';

function CameraCapture({ fecharCamera, onFotoCapturada }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      onFotoCapturada(previewUrl);
      fecharCamera();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center">
        <h3 className="text-lg font-bold text-slate-800 mb-2">Capturar Foto</h3>
        <p className="text-sm text-slate-500 mb-6">
          Posicione  e tire uma foto para confirmar a entrega.
        </p>

        <div className="flex flex-col gap-3">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current.click()}
            className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition"
          >
            📸 Abrir Câmera
          </button>

          <button
            onClick={fecharCamera}
            className="w-full py-3 text-slate-500 font-medium hover:bg-slate-100 rounded-xl transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default CameraCapture;