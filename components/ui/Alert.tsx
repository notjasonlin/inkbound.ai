import React from 'react';

interface AlertProps {
    message: string,
    type: string,
    onClose: () => void,
}

const Alert = ({ message, type = 'info', onClose }: AlertProps) => {
  const getAlertStyle = () => {
    switch (type) {
      case 'success':
        return { backgroundColor: '#dff0d8', color: '#3c763d' };
      case 'error':
        return { backgroundColor: '#f2dede', color: '#a94442' };
      case 'warning':
        return { backgroundColor: '#fcf8e3', color: '#8a6d3b' };
      default:
        return { backgroundColor: '#e7f3fe', color: '#31708f' };
    }
  };

  return (
    <div style={{ ...styles.alert, ...getAlertStyle() }}>
      <span>{message}</span>
      <button onClick={onClose} style={styles.closeButton}>
        &times;
      </button>
    </div>
  );
};

const styles = {
  alert: {
    padding: '15px',
    margin: '10px 0',
    borderRadius: '4px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: 'inherit',
  },
};

export default Alert;
