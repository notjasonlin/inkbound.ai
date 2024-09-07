"use client";

import { useState } from 'react';

interface PlayerStats {
  height: number;
  weight: number;
  position: string;
  clubTeam: string;
  clubLevel: string;
  teamRole: string;
  satAct: string;
  gpaScale: string;
  intendedMajor: string;
}

export default function BackgroundPage() {
  const [formData, setFormData] = useState<PlayerStats>({
    height: 0,
    weight: 0,
    position: '',
    clubTeam: '',
    clubLevel: '',
    teamRole: '',
    satAct: '',
    gpaScale: '',
    intendedMajor: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = JSON.stringify(formData);
    console.log('Form Data:', data);



    // Add further form submission logic here (e.g., API calls)
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Background Information</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        {renderInput('Height: ', 'height', String(formData.height), handleChange)}
        {renderInput('Weight: ', 'weight', String(formData.weight), handleChange)}
        {renderInput('Position:', 'position', formData.position, handleChange)}
        {renderInput('Club Team:', 'clubTeam', formData.clubTeam, handleChange)}
        {renderInput('Club Level:', 'clubLevel', formData.clubLevel, handleChange)}
        {renderInput('Role on the Team:', 'teamRole', formData.teamRole, handleChange)}
        {renderInput('SAT/ACT:', 'satAct', formData.satAct, handleChange)}
        {renderInput('GPA / Scale:', 'gpaScale', formData.gpaScale, handleChange)}
        {renderInput('Intended Major:', 'intendedMajor', formData.intendedMajor, handleChange)}
        <button type="submit" style={styles.button}>Submit</button>
      </form>
    </div>
  );
}

function renderInput(
  label: string,
  name: string,
  value: string,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
) {
  return (
    <div style={styles.formGroup}>
      <label style={styles.label}>{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        style={styles.input}
      />
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  label: {
    marginBottom: '5px',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    alignSelf: 'center',
  },
};
