import { useState } from 'react'
import Layout from './components/layout/Layout'
import './App.css'

function App() {
  return (
    <Layout>
      <div className="card">
        <h3>Bienvenido al Sistema DISP</h3>
        <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>
          Seleccione una opción del menú para comenzar.
        </p>
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
          <button className="btn btn-primary">Nueva Dispersión</button>
          <button className="btn btn-secondary">Ver Reportes</button>
        </div>
      </div>
    </Layout>
  )
}

export default App
