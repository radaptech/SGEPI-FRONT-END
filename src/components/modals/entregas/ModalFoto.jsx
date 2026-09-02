import { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff, X, Aperture } from 'lucide-react';

function ModalFoto({ aberto, fecharFoto, onFotoCapturada }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [erroCamera, setErroCamera] = useState('');

  useEffect(() => {
    if (aberto) {
      iniciarCamera();
    } else {
      pararCamera();
    }
    return () => pararCamera();
  }, [aberto]);

  const iniciarCamera = async () => {
    setErroCamera('');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Erro ao acessar a câmera:", err);
      setErroCamera('Não foi possível acessar a câmera. Verifique as permissões do navegador.');
    }
  };

  const pararCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const tirarFoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const fotoBase64 = canvas.toDataURL('image/jpeg', 0.8);
      
      onFotoCapturada(fotoBase64);
      pararCamera();
      fecharFoto();
    }
  };

  const handleFechar = () => {
    pararCamera();
    fecharFoto();
  };

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in text-slate-700 dark:text-slate-300">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden flex flex-col transition-colors duration-300">
        <div className="px-6 sm:px-8 py-6 border-b border-slate-100 dark:border-slate-800/60 flex justify-between items-start shrink-0 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 transition-colors">
              <Camera className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">
                Capturar Foto
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">
                Fotografia de perfil do funcionário.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleFechar}
            className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:px-8 bg-slate-50/50 dark:bg-slate-900/50 transition-colors">
          <div className="relative bg-black rounded-2xl overflow-hidden aspect-video flex items-center justify-center shadow-inner border border-slate-200/60 dark:border-slate-800">
            {erroCamera ? (
              <div className="text-red-500 dark:text-red-400 flex flex-col items-center text-center p-6 animate-fade-in">
                <CameraOff className="w-10 h-10 mb-3 opacity-80" />
                <p className="text-sm font-medium">{erroCamera}</p>
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              ></video>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden"></canvas>
        </div>

        <div className="px-6 sm:px-8 py-5 border-t border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row sm:justify-end gap-3 bg-white dark:bg-slate-900 shrink-0 rounded-b-3xl transition-colors duration-300">
          <button
            type="button"
            onClick={handleFechar}
            className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors w-full sm:w-auto order-2 sm:order-1"
          >
            Cancelar
          </button>
          
          <button
            type="button"
            onClick={tirarFoto}
            disabled={!!erroCamera || !stream}
            className="px-6 py-2.5 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold rounded-xl text-sm transition-all shadow-sm shadow-emerald-600/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto order-1 sm:order-2"
          >
            <Aperture className="w-4 h-4" /> Tirar Foto
          </button>
        </div>

      </div>
    </div>
  );
}

export default ModalFoto;