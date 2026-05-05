//блокирующая анимация во время запросов

import type { FC } from 'react';
import { Spinner } from 'react-bootstrap';

interface LoadingOverlayProps {
  show: boolean;
  text?: string;
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(255,255,255,0.65)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2000,
};

const boxStyle: React.CSSProperties = {
  minWidth: 220,
  padding: '20px 24px',
  borderRadius: 12,
  background: '#fff',
  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 12,
};

const LoadingOverlay: FC<LoadingOverlayProps> = ({
  show,
  text = 'Выполняется запрос...',
}) => {
  if (!show) return null;

  return (
    <div style={overlayStyle}>
      <div style={boxStyle}>
        <Spinner animation="border" />
        <div>{text}</div>
      </div>
    </div>
  );
};

export default LoadingOverlay;