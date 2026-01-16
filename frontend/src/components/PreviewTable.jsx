import React from 'react';
import './PreviewTable.css';

const PreviewTable = ({ columns, data }) => {
    if (!data || data.length === 0) return null;

    return (
        <div className="table-container">
            <table className="preview-table">
                <thead>
                    <tr>
                        {columns.map((col, index) => (
                            <th key={index}>{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {columns.map((col, colIndex) => (
                                <td key={colIndex}>{row[col]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PreviewTable;
