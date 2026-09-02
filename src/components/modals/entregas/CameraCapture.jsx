import { useRef } from 'react';
import { Camera, X } from 'lucide-react';

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
    <div className="fixed inset-0 z-[120] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in text-slate-700 dark:text-slate-300">
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden flex flex-col transition-colors duration-300">
        <button
          type="button"
          onClick={fecharCamera}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors z-10"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 flex flex-col items-center text-center mt-2">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-5 transition-colors">
            <Camera className="w-8 h-8" strokeWidth={2} />
          </div>
          
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors mb-2">
            Capturar Foto
          </h3>
          
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed transition-colors">
            Posicione e tire uma foto para confirmar a entrega.
          </p>

          <div className="w-full flex flex-col gap-3">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="w-full py-3.5 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold rounded-xl text-sm transition-all shadow-sm shadow-emerald-600/20 active:scale-[0.98]"
            >
              <Camera className="w-4 h-4" /> Abrir Câmera
            </button>

            <button
              type="button"
              onClick={fecharCamera}
              className="w-full py-3.5 text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CameraCapture;