import React, { useRef, useState } from 'react';
import './FileUploader.css';

const FileUploader = ({ onFileSelect }) => {
    const fileInputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };

    const onButtonClick = () => {
        fileInputRef.current.click();
    };

    return (
        <div
            className={`file-uploader ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
        >
            <input
                ref={fileInputRef}
                type="file"
                className="file-input"
                onChange={handleChange}
                accept=".xlsx, .xls"
            />
            <div className="upload-content">
                <div className="upload-icon">📁</div>
                <p className="upload-text">Arrastra y suelta tu archivo Excel aquí o</p>
                <button className="upload-btn" onClick={onButtonClick}>Seleccionar Archivo</button>
            </div>
        </div>
    );
};

export default FileUploader;
