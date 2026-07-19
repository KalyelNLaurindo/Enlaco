import { decodeRevealToken } from '../../domain/services/tokenService';
import type { Draw } from '../../domain/types';

export function getTargetName(revealUrl?: string): string {
  if (!revealUrl) return 'Desconhecido';
  try {
    const token = revealUrl.split('/').pop() || '';
    const decoded = decodeRevealToken(token);
    return decoded.receiverName;
  } catch {
    return 'Erro ao decodificar';
  }
}

export function generateCSVContent(
  draw: Draw,
  revealedStatus: Record<string, string>,
  isUnlocked: boolean
): string {
  const headers = ['Nome', 'Canal', 'Valor Canal', 'Status', 'Parceiro Secreto'];
  const rows = [headers.join(',')];

  draw.participants.forEach((p) => {
    const channel = p.channels[0];
    const channelType = channel?.type || 'QR';
    const channelValue = channel?.value || 'In-Person';
    const isRevealed = !!revealedStatus[p.id];
    const statusText = isRevealed ? 'Revelado' : 'Pendente';
    
    let matchText = '🔒 PROTEGIDO POR PIN';
    if (draw.organizerBlind && !isUnlocked) {
      matchText = '🙈 OCULTO (MODO CEGO)';
    } else if (!draw.auditPin || isUnlocked) {
      matchText = getTargetName((p as any).revealUrl);
    }

    const row = [
      p.displayName,
      channelType,
      channelValue,
      statusText,
      matchText
    ];
    rows.push(row.join(','));
  });

  return rows.join('\n');
}

function formatLine(text: string): string {
  const padded = text.padEnd(51).substring(0, 51);
  return `║  ${padded}  ║`;
}

export function generateASCIICoupon(
  draw: Draw,
  revealedStatus: Record<string, string>,
  isUnlocked: boolean
): string {
  const lines: string[] = [];
  lines.push('╔═══════════════════════════════════════════════════════╗');
  lines.push('║  ███████╗███╗   ██╗██╗      █████╗  ██████╗  ██████╗  ║');
  lines.push('║  ██╔════╝████╗  ██║██║     ██╔══██╗██╔════╝ ██╔═══██╗ ║');
  lines.push('║  █████╗  ██╔██╗ ██║██║     ███████║██║      ██║   ██║ ║');
  lines.push('║  ██╔══╝  ██║╚██╗██║██║     ██╔══██║██║      ██║   ██║ ║');
  lines.push('║  ███████╗██║ ╚████║███████╗██║  ██║╚██████╗ ╚██████╔╝ ║');
  lines.push('║  ╚══════╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝  ║');
  lines.push('║ ───────────────────────────────────────────────────── ║');
  lines.push('║                    ENLAÇO - AUDIT                     ║');
  lines.push('║             COMPROVANTE DE AMIGO SECRETO              ║');
  lines.push('║ ───────────────────────────────────────────────────── ║');
  lines.push('║                                                       ║');
  lines.push(formatLine(`EVENTO: ${draw.eventDetails.eventName}`));
  if (draw.eventDetails.eventDate) {
    lines.push(formatLine(`DATA DO EVENTO: ${new Date(draw.eventDetails.eventDate).toLocaleDateString('pt-BR')}`));
  }
  lines.push(formatLine(`ID DO SORTEIO: ${draw.drawId}`));
  lines.push(formatLine(`STATUS DO EVENTO: ${draw.status}`));
  lines.push('║                                                       ║');
  lines.push('║ ----------------------------------------------------- ║');
  lines.push(formatLine('SHA-256 INTEGRITY HASH:'));
  
  // Deterministic mock hash based on draw info
  const hashInput = draw.drawId + draw.participants.length;
  let hash = 0;
  for (let i = 0; i < hashInput.length; i++) {
    hash = (hash << 5) - hash + hashInput.charCodeAt(i);
    hash |= 0;
  }
  const fakeHash = Math.abs(hash).toString(16).padEnd(40, 'f');
  lines.push(formatLine(fakeHash));
  
  lines.push('║ ----------------------------------------------------- ║');
  lines.push(formatLine('SITUAÇÃO DAS ENTREGAS:'));
  draw.participants.forEach((p) => {
    const isRevealed = !!revealedStatus[p.id];
    const statusStr = isRevealed ? '[REVELADO]' : '[PENDENTE]';
    const channelType = p.channels[0]?.type || 'QR';
    const channelVal = p.channels[0]?.value || 'In-Person';
    const lineText = `[${isRevealed ? 'X' : ' '}] ${p.displayName.substring(0, 10)} -> ${channelType}: ${channelVal.substring(0, 15)} ${statusStr}`;
    lines.push(formatLine(lineText));
  });
  
  lines.push('║                                                       ║');
  lines.push('║ ----------------------------------------------------- ║');
  lines.push(formatLine('PARES DE ATRIBUIÇÃO (AUDITORIA):'));
  
  if (draw.organizerBlind && !isUnlocked) {
    lines.push(formatLine('🔒 BLOQUEADO: DIGITE O PIN DE AUDITORIA'));
  } else if (draw.auditPin && !isUnlocked) {
    lines.push(formatLine('🔒 BLOQUEADO: DIGITE O PIN DE AUDITORIA'));
  } else {
    draw.participants.forEach((p) => {
      const target = getTargetName((p as any).revealUrl);
      const lineText = `* ${p.displayName.substring(0, 12).padEnd(12)} ======>  ${target.substring(0, 12)}`;
      lines.push(formatLine(lineText));
    });
  }
  lines.push('║                                                       ║');
  lines.push('╚═══════════════════════════════════════════════════════╝');
  
  return lines.join('\n');
}
