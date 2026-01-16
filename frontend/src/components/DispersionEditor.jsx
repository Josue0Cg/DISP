import React, { useState, useEffect } from 'react';
import './DispersionEditor.css';

const PAYMENT_METHODS = [
    { value: '001', label: '001 - Banamex' },
    { value: '002', label: '002 - Interbancario' },
    { value: '003', label: '003 - Orden de Pago' },
];

const PAYMENT_TYPES = [
    { value: '01', label: '01 - Nómina' },
    { value: '51', label: '51 - Aguinaldo' },
    { value: '52', label: '52 - Bono' },
    // Add more as needed
];

const formatBeneficiaryName = (fullName) => {
    if (!fullName) return '';
    const parts = fullName.toString().trim().toUpperCase().split(/\s+/);
    if (parts.length === 0) return '';

    if (parts.length === 1) {
        return `${parts[0]},/`;
    }
    if (parts.length === 2) {
        // Assume First, Paternal
        return `${parts[0]},${parts[1]}/`;
    }
    if (parts.length === 3) {
        // First, Paternal, Maternal
        return `${parts[0]},${parts[1]}/${parts[2]}`;
    }

    // > 3 parts: Heuristic - Last is Maternal, 2nd Last is Paternal, Rest is Name
    // Exception handling for common compound names could go here, but keeping it simple for now.
    const maternal = parts.pop();
    const paternal = parts.pop();
    const names = parts.join(' ');
    return `${names},${paternal}/${maternal}`;
};

const DispersionEditor = ({ data, mapping, initialHeader, onBack, onGenerate }) => {
    const [headerInfo, setHeaderInfo] = useState(initialHeader);
    const [rows, setRows] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 50;

    // Initialize rows based on data and mapping
    useEffect(() => {
        if (data && mapping) {
            const initialRows = data.map((row, index) => {
                const accountNum = row[mapping.account_number] ? String(row[mapping.account_number]) : '';

                // Heuristic for Payment Method and Account Type
                let payMethod = '001'; // Default Banamex
                let accType = '01';    // Default Cheques
                let bankKey = '0000';  // Default Same Bank

                if (accountNum.length === 18) {
                    payMethod = '002'; // Interbancario
                    accType = '40';    // CLABE
                    bankKey = accountNum.substring(1, 5);
                } else if (accountNum.length === 16) {
                    accType = '03'; // Tarjeta?
                }

                return {
                    id: index,
                    operation: '0',
                    payment_method: payMethod,
                    payment_type: '01', // Default Nomina
                    currency: '001',
                    amount: row[mapping.amount],
                    account_type: accType,
                    account_number: accountNum,
                    payment_reference: headerInfo.payment_reference || '1',
                    reference_1: row[mapping.reference_1] || '',
                    beneficiary: formatBeneficiaryName(row[mapping.beneficiary]),
                    bank_key: bankKey,
                    term: '00', // Default Mismo Dia
                };
            });
            setRows(initialRows);
        }
    }, [data, mapping]);

    // Update header info (Total Movements, Total Amount) when rows change
    useEffect(() => {
        const totalAmount = rows.reduce((sum, row) => {
            const val = parseFloat(row.amount);
            return sum + (isNaN(val) ? 0 : val);
        }, 0);

        setHeaderInfo(prev => ({
            ...prev,
            total_movements: rows.length.toString(),
            charge_amount_total: totalAmount.toFixed(2)
        }));
    }, [rows]);

    const handleHeaderChange = (e) => {
        const { name, value } = e.target;
        setHeaderInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleRowChange = (index, field, value) => {
        // index here is relative to the current page
        const globalIndex = (currentPage - 1) * rowsPerPage + index;

        const newRows = [...rows];
        newRows[globalIndex] = { ...newRows[globalIndex], [field]: value };

        // Auto-update logic if Account Number changes
        if (field === 'account_number') {
            const accountNum = String(value);
            if (accountNum.length === 18) {
                newRows[globalIndex].payment_method = '002';
                newRows[globalIndex].account_type = '40';
                newRows[globalIndex].bank_key = accountNum.substring(1, 5);
            }
        }

        setRows(newRows);
    };

    // Pagination Logic
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = rows.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(rows.length / rowsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="dispersion-editor">
            <h3>Editor de Dispersión</h3>

            {/* Header Section */}
            <div className="editor-section header-form">
                <h4>Encabezado</h4>
                <div className="form-grid">
                    <div className="form-group">
                        <label>No. Cliente</label>
                        <input name="client_number" value={headerInfo.client_number} onChange={handleHeaderChange} maxLength="12" />
                    </div>
                    <div className="form-group">
                        <label>Fecha Pago</label>
                        <input type="date" name="payment_date" value={headerInfo.payment_date} onChange={handleHeaderChange} />
                    </div>
                    <div className="form-group">
                        <label>Secuencial</label>
                        <input name="sequential" value={headerInfo.sequential} onChange={handleHeaderChange} maxLength="4" />
                    </div>
                    <div className="form-group">
                        <label>Empresa</label>
                        <input name="company_name" value={headerInfo.company_name} onChange={handleHeaderChange} maxLength="36" />
                    </div>
                    <div className="form-group">
                        <label>Descripción</label>
                        <input name="description" value={headerInfo.description} onChange={handleHeaderChange} maxLength="20" />
                    </div>
                    <div className="form-group">
                        <label>Tipo Op. (Cargo)</label>
                        <input name="operation_type" value={headerInfo.operation_type} onChange={handleHeaderChange} maxLength="1" />
                    </div>
                    <div className="form-group">
                        <label>Cuenta Cargo</label>
                        <input name="charge_account_number" value={headerInfo.charge_account_number} onChange={handleHeaderChange} maxLength="11" />
                    </div>
                    <div className="form-group">
                        <label>Tipo Cta Cargo</label>
                        <input name="charge_account_type" value={headerInfo.charge_account_type} onChange={handleHeaderChange} maxLength="2" />
                    </div>
                    <div className="form-group">
                        <label>Importe Total</label>
                        <input value={headerInfo.charge_amount_total} readOnly style={{ backgroundColor: '#f3f4f6' }} />
                    </div>
                    <div className="form-group">
                        <label>Movimientos</label>
                        <input value={headerInfo.total_movements} readOnly style={{ backgroundColor: '#f3f4f6' }} />
                    </div>
                </div>
            </div>

            {/* Grid Section */}
            <div className="editor-section grid-container">
                <h4>Detalle de Movimientos (Página {currentPage} de {totalPages})</h4>
                <div className="table-wrapper">
                    <table className="editor-table">
                        <thead>
                            <tr>
                                <th>Op</th>
                                <th>Método Pago</th>
                                <th>Tipo Pago</th>
                                <th>Moneda</th>
                                <th>Importe</th>
                                <th>Tipo Cta</th>
                                <th>Cuenta Abono</th>
                                <th>Ref. Pago</th>
                                <th>Ref. 1</th>
                                <th>Beneficiario</th>
                                <th>Clave Banco</th>
                                <th>Plazo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentRows.map((row, index) => (
                                <tr key={row.id}>
                                    <td>
                                        <input
                                            value={row.operation}
                                            onChange={(e) => handleRowChange(index, 'operation', e.target.value)}
                                            className="w-10"
                                        />
                                    </td>
                                    <td>
                                        <select
                                            value={row.payment_method}
                                            onChange={(e) => handleRowChange(index, 'payment_method', e.target.value)}
                                        >
                                            {PAYMENT_METHODS.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <select
                                            value={row.payment_type}
                                            onChange={(e) => handleRowChange(index, 'payment_type', e.target.value)}
                                        >
                                            {PAYMENT_TYPES.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>{row.currency}</td>
                                    <td>
                                        <input
                                            value={row.amount}
                                            onChange={(e) => handleRowChange(index, 'amount', e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            value={row.account_type}
                                            onChange={(e) => handleRowChange(index, 'account_type', e.target.value)}
                                            className="w-10"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            value={row.account_number}
                                            onChange={(e) => handleRowChange(index, 'account_number', e.target.value)}
                                            className="w-40"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            value={row.payment_reference}
                                            onChange={(e) => handleRowChange(index, 'payment_reference', e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            value={row.reference_1}
                                            onChange={(e) => handleRowChange(index, 'reference_1', e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            value={row.beneficiary}
                                            onChange={(e) => handleRowChange(index, 'beneficiary', e.target.value)}
                                            className="w-60"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            value={row.bank_key}
                                            onChange={(e) => handleRowChange(index, 'bank_key', e.target.value)}
                                            className="w-16"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            value={row.term}
                                            onChange={(e) => handleRowChange(index, 'term', e.target.value)}
                                            className="w-10"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="pagination-controls">
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="btn-pagination"
                    >
                        Anterior
                    </button>
                    <span>Página {currentPage} de {totalPages}</span>
                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="btn-pagination"
                    >
                        Siguiente
                    </button>
                </div>
            </div>

            <div className="actions">
                <button className="btn btn-secondary" onClick={onBack}>Atrás</button>
                <button className="btn btn-primary" onClick={() => onGenerate({ headerInfo, rows })}>Generar Archivo</button>
            </div>
        </div>
    );
};

export default DispersionEditor;
