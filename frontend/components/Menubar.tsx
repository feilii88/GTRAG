'use client';
import React from 'react';
import { signOut } from 'next-auth/react';
import { Button } from 'primereact/button';
import { Menubar } from 'primereact/menubar';

import 'primeicons/primeicons.css';

export default function MenuBar() {  
    const items = [
        {
            label: 'GTRAG',
            icon: 'pi pi-home'
        }
    ];

    const handleClick = () => {
        signOut();
    }

    const start = (
        <div className="flex align-items-center gap-2">
            <Button severity="success" rounded>GTRAG</Button>
        </div>
    );

    const end = (
        <div className="flex align-items-center gap-2">
            <Button onClick={handleClick}>Logout</Button>
        </div>
    );

    return (
        <>
            <Menubar start={start} end={end} />
        </>
    );
}