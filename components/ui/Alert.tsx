import React from 'react';

interface AlertProps {
  header?: string,
  message: string,
  type: string,
  onClose: () => void,
  onConfirm?: () => void,
}

const Alert = ({ header, message, type = 'info', onClose, onConfirm }: AlertProps) => {
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
      {header && <span style={styles.header}>{header}</span>}
      <span style={styles.message}>{message}</span>
      <div style={onConfirm ? styles.buttonContainer : styles.singleButtonContainer}>
        <button onClick={onClose} style={styles.button}>
          Close
        </button>
        {onConfirm && (
          <button onClick={onConfirm} style={styles.button}>
            OK
          </button>
        )}
      </div>
    </div>
  );
};

const styles = {
  alert: {
    padding: '20px',
    margin: '10px 0',
    borderRadius: '4px',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center' as const, // Center text alignment
    width: '300px',
  },
  header: {
    fontSize: '20px',
    fontWeight: 'bold' as const, // Bold header
    marginBottom: '10px',
  },
  message: {
    fontSize: '16px',
    marginBottom: '10px',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'center', // Center the buttons when there are two
    gap: '10px',
  },
  singleButtonContainer: {
    display: 'flex',
    justifyContent: 'center', // Center the single button
  },
  button: {
    padding: '5px 10px',
    fontSize: '12px',
    borderRadius: '4px',
    cursor: 'pointer',
    border: '1px solid #ccc',
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
};

export default Alert;
