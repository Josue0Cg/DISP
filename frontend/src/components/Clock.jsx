import React, { useState, useEffect } from 'react';

const Clock = () => {
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        const timerID = setInterval(() => tick(), 1000);
        return () => clearInterval(timerID);
    }, []);

    function tick() {
        setDate(new Date());
    }

    return (
        <div className="clock" style={{ color: 'white', fontSize: '1rem', fontWeight: '500' }}>
            {date.toLocaleDateString()} {date.toLocaleTimeString()}
        </div>
    );
};

export default Clock;
