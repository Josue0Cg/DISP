import React, { useState, useEffect } from 'react';
import './ColumnMapper.css';

const REQUIRED_FIELDS = [
    { key: 'beneficiary', label: 'Beneficiario (Nombre, Apellidos)', required: true },
    { key: 'amount', label: 'Importe del Pago', required: true },
    { key: 'account_number', label: 'Cuenta Abono (CLABE/Tarjeta)', required: true },
    { key: 'reference_1', label: 'Referencia 1', required: false },
    // payment_reference moved to manual input
    // payment_method, payment_type, etc are now handled in Editor or have defaults
];

const ColumnMapper = ({ columns, data, onConfirm, onCancel }) => {
    const [mapping, setMapping] = useState({});
    const [headerInfo, setHeaderInfo] = useState({
        client_number: '',
        payment_date: '',
        sequential: '',
        company_name: '',
        description: '',
        charge_account_number: '',
        charge_account_type: '',
        charge_amount_total: '', // Optional override
        operation_type: '1', // Default to 1
        total_movements: '', // Calculated
        payment_reference: '1', // Default to 1
    });

    const handleMappingChange = (fieldKey, column) => {
        setMapping(prev => ({ ...prev, [fieldKey]: column }));
    };

    // Calculate total amount when 'amount' mapping changes
    useEffect(() => {
        if (mapping.amount && data) {
            const total = data.reduce((sum, row) => {
                const val = parseFloat(row[mapping.amount]);
                return sum + (isNaN(val) ? 0 : val);
            }, 0);
            // Format to 2 decimal places
            setHeaderInfo(prev => ({ ...prev, charge_amount_total: total.toFixed(2) }));
        }
    }, [mapping.amount, data]);

    // Calculate total movements (rows)
    useEffect(() => {
        if (data) {
            setHeaderInfo(prev => ({ ...prev, total_movements: data.length.toString() }));
        }
    }, [data]);

    // We keep the state logic for headerInfo calculation, but we won't render the inputs here anymore.
    // Instead, we pass the initial headerInfo to the Editor.

    const handleSubmit = () => {
        // Validate required mappings
        const missing = REQUIRED_FIELDS.filter(f => f.required && !mapping[f.key]);
        if (missing.length > 0) {
            alert(`Por favor asigna las columnas para: ${missing.map(f => f.label).join(', ')}`);
            return;
        }
        onConfirm({ mapping, headerInfo });
    };

    return (
        <div className="column-mapper">
            <h3>Configuración de Mapeo</h3>

            <div className="section">
                <p>Selecciona qué columna del Excel corresponde a cada campo requerido.</p>
                <div className="mapping-grid">
                    {REQUIRED_FIELDS.map(field => (
                        <div key={field.key} className="mapping-row">
                            <label>{field.label} {field.required && '*'}</label>
                            <select
                                value={mapping[field.key] || ''}
                                onChange={(e) => handleMappingChange(field.key, e.target.value)}
                            >
                                <option value="">-- Seleccionar Columna --</option>
                                {columns.map(col => (
                                    <option key={col} value={col}>{col}</option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            </div>

            <div className="actions">
                <button className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
                <button className="btn btn-primary" onClick={handleSubmit}>Continuar al Editor</button>
            </div>
        </div>
    );
};

export default ColumnMapper;
