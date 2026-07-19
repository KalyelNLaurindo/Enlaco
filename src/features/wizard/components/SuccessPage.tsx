import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import logoImg from '../../../assets/logo.png';
import { useTranslation } from '../../../domain/services/i18nService';
import type { Draw } from '../../../domain/types';
import './SuccessPage.css';

export function SuccessPage() {
  const { t } = useTranslation();
  const { drawId } = useParams<{ drawId: string }>();
  const navigate = useNavigate();
  const [draw, setDraw] = useState<Draw | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!drawId) return;
    const stored = localStorage.getItem(`enlaco-draw-${drawId}`);
    if (stored) {
      try {
        setDraw(JSON.parse(stored) as Draw);
      } catch (e) {
        console.error('Erro ao ler sorteio para página de sucesso', e);
      }
    }
  }, [drawId]);

  if (!draw) {
    return (
      <div className="success-page-error">
        <h2>Sorteio não encontrado</h2>
        <button className="btn-primary" onClick={() => navigate('/')}>
          Voltar para Início
        </button>
      </div>
    );
  }

  // Draw coupon on canvas and download as PNG
  const handleDownloadCoupon = async (participantName: string, revealUrl: string) => {
    const fullUrl = `${window.location.origin}${window.location.pathname}${revealUrl}`;
    
    // Create an offscreen canvas
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 550;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw dark background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 550);
    gradient.addColorStop(0, '#0D0F14');
    gradient.addColorStop(1, '#1A1E25');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 550);

    // Draw border
    ctx.strokeStyle = '#6C63FF';
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, 384, 534);

    // Draw Logo representation or text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px Poppins, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ENLAÇO', 200, 50);

    ctx.fillStyle = '#A3A3AE';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('AMIGO SECRETO CONSTRITO', 200, 72);

    // Draw Divider Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, 95);
    ctx.lineTo(370, 95);
    ctx.stroke();

    // Event Info
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '600 16px Poppins, sans-serif';
    ctx.fillText(draw.eventDetails.eventName.toUpperCase(), 200, 130);

    // Participant Name
    ctx.fillStyle = '#FF6FB5';
    ctx.font = 'bold 22px Poppins, sans-serif';
    ctx.fillText(`Para: ${participantName}`, 200, 175);

    // Instruction Text
    ctx.fillStyle = '#A3A3AE';
    ctx.font = '12px Inter, sans-serif';
    
    const lines = [
      'Escaneie o QR Code abaixo com seu celular',
      'para revelar quem você tirou neste sorteio.',
      'Mantenha este resultado em segredo!'
    ];
    lines.forEach((line, index) => {
      ctx.fillText(line, 200, 215 + index * 18);
    });

    // Generate QR Code as image and draw on Canvas
    try {
      const qrDataUrl = await QRCode.toDataURL(fullUrl, {
        margin: 1,
        width: 180,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      const qrImg = new Image();
      qrImg.src = qrDataUrl;
      
      await new Promise<void>((resolve) => {
        qrImg.onload = () => {
          // Draw white card behind QR code
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.roundRect(100, 280, 200, 200, 16);
          ctx.fill();

          ctx.drawImage(qrImg, 110, 290, 180, 180);
          resolve();
        };
      });

    } catch (err) {
      console.error('Falha ao gerar QR Code para canvas', err);
    }

    // Footer
    ctx.fillStyle = '#5C5C66';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('ENLAÇO - FUNCIONA OFFLINE', 200, 515);

    // Trigger download
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `enlaco-${participantName.toLowerCase()}-qrcode.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="success-page-container">
      <div className="success-card glass-card">
        {/* Animated Checkmark */}
        <div className="success-checkmark-wrapper">
          <div className="success-checkmark-circle">
            <div className="success-checkmark-kick"></div>
            <div className="success-checkmark-stem"></div>
          </div>
        </div>

        <h1 className="success-title">{t('successTitle')}</h1>
        <p className="success-subtitle">
          {t('successSub')}
        </p>

        <div className="success-actions">
          <button className="btn-primary full-width" onClick={() => navigate(`/sorteio/${drawId}`)}>
            {t('viewSummaryBtn')}
          </button>
          <button className="btn-secondary full-width" onClick={() => setShowShareModal(true)}>
            {t('shareQrBtn')}
          </button>
        </div>
      </div>

      {/* Share QR Code Modal */}
      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal-content share-modal glass-card" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h3>{t('shareModalTitle')}</h3>
              <button className="close-btn" onClick={() => setShowShareModal(false)}>×</button>
            </header>

            <div className="modal-body share-modal-body">
              <p className="share-intro-text">
                {t('shareModalSub')}
              </p>

              <div className="participants-share-list">
                {draw.participants.map((p) => {
                  const channel = p.channels[0];
                  const hasWhatsApp = channel?.type === 'WHATSAPP_LINK';
                  const labelValue = channel?.value || 'QR / Presencial';
                  
                  return (
                    <div key={p.id} className="share-list-item">
                      <div className="share-participant-info">
                        <span className="share-participant-name">{p.displayName}</span>
                        <span className="share-participant-channel">{labelValue}</span>
                      </div>
                      <div className="share-participant-actions">
                        <button
                          className="btn-secondary share-small-btn"
                          onClick={() => handleDownloadCoupon(p.displayName, p.revealUrl!)}
                        >
                          📥 Baixar PNG
                        </button>
                        {hasWhatsApp && (
                          <a
                            href={`https://wa.me/${channel.value.replace(/\D/g, '')}?text=${encodeURIComponent(
                              `Olá, ${p.displayName}! O sorteio do amigo secreto "${draw.eventDetails.eventName}" foi gerado. Escaneie seu QR Code ou use o link para revelar quem você tirou: ${window.location.origin}${window.location.pathname}${p.revealUrl}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary share-small-btn whatsapp-btn-share"
                            style={{ textDecoration: 'none' }}
                          >
                            💬 WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
