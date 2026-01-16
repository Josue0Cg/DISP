import React, { useState } from 'react';
import FileUploader from '../components/FileUploader';
import PreviewTable from '../components/PreviewTable';

import ColumnMapper from '../components/ColumnMapper';
import DispersionEditor from '../components/DispersionEditor';


const NewDispersion = () => {
    const [step, setStep] = useState(1); // 1: Upload, 2: Preview, 3: Map, 4: Editor
    const [tableData, setTableData] = useState(null);
    const [mappingData, setMappingData] = useState(null); // { mapping, headerInfo }
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


    const handleFileSelect = async (file) => {
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8000/api/upload-excel/', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Error uploading file');
            }

            const result = await response.json();
            setTableData(result);
            setStep(2);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="new-dispersion-page">
            <div className="page-header">
                <h1>Nueva Dispersión</h1>
                <p>Carga el archivo de Excel para comenzar el proceso.</p>
            </div>

            <div className="card" style={{ marginTop: '2rem' }}>
                <FileUploader onFileSelect={handleFileSelect} />

                {loading && <p style={{ marginTop: '1rem', textAlign: 'center' }}>Procesando archivo...</p>}
                {error && <p style={{ marginTop: '1rem', color: 'red', textAlign: 'center' }}>{error}</p>}
            </div>

            {step === 2 && tableData && (
                <div style={{ marginTop: '2rem' }}>
                    <h3>Vista Previa</h3>
                    <PreviewTable columns={tableData.columns} data={tableData.data} />
                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="btn btn-primary" onClick={() => setStep(3)}>Continuar a Configuración</button>
                    </div>
                </div>
            )}

            {step === 3 && tableData && (
                <div style={{ marginTop: '2rem' }}>
                    <ColumnMapper
                        columns={tableData.columns}
                        data={tableData.data}
                        onCancel={() => setStep(2)}
                        onConfirm={({ mapping, headerInfo }) => {
                            setMappingData({ mapping, headerInfo });
                            setStep(4);
                        }}
                    />
                </div>
            )}

            {step === 4 && tableData && mappingData && (
                <div style={{ marginTop: '2rem' }}>
                    <DispersionEditor
                        data={tableData.data}
                        mapping={mappingData.mapping}
                        initialHeader={mappingData.headerInfo}
                        onBack={() => setStep(3)}
                        onGenerate={async ({ headerInfo, rows }) => {
                            setLoading(true);
                            try {
                                // Prepare payload from Editor rows
                                const details = rows.map(row => ({
                                    beneficiary: row.beneficiary,
                                    amount: row.amount,
                                    account_number: row.account_number,
                                    payment_reference: row.payment_reference,
                                    reference_1: row.reference_1,
                                    payment_method: row.payment_method,
                                    payment_type: row.payment_type,
                                    account_type: row.account_type,
                                    bank_key: row.bank_key,
                                    term: row.term,
                                }));

                                const payload = {
                                    header: headerInfo,
                                    charge: {
                                        amount: headerInfo.charge_amount_total,
                                        account_type: headerInfo.charge_account_type,
                                        account_number: headerInfo.charge_account_number,
                                    },
                                    details: details
                                };

                                const response = await fetch('http://localhost:8000/api/generate-dispersion/', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify(payload),
                                });

                                if (!response.ok) throw new Error('Error generating file');

                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `dispersion_${headerInfo.sequential}.txt`;
                                document.body.appendChild(a);
                                a.click();
                                a.remove();

                                alert('Archivo generado exitosamente!');
                                setStep(1);
                                setTableData(null);
                                setMappingData(null);

                            } catch (err) {
                                setError(err.message);
                            } finally {
                                setLoading(false);
                            }
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default NewDispersion;
