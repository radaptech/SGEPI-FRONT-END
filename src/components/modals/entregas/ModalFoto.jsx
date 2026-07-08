import { useRef, useEffect, useState } from 'react';

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
    <div className="fixed inset-0 z-[100] bg-slate-900/80 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg p-5 shadow-2xl flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800">Capturar foto do Funcionario</h3>
          <button onClick={handleFechar} className="text-slate-400 hover:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="relative bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center mb-4">
          {erroCamera ? (
            <div className="text-red-500 text-sm text-center p-4">
              <span className="text-3xl mb-2 block">📷❌</span>
              {erroCamera}
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

        <div className="flex gap-3 mt-auto">
          <button
            type="button"
            onClick={handleFechar}
            className="flex-1 py-3 text-slate-600 font-medium bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            Cancelar
          </button>
          
          <button
            type="button"
            onClick={tirarFoto}
            disabled={!!erroCamera || !stream}
            className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            📸 Tirar Foto
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalFoto;