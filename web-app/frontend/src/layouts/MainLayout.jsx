import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const MainLayout = () => {
    return (
        <div className="min-h-screen bg-[#151320] text-white">
            <div className="container mx-auto px-4">
                <Navbar />
                <Outlet />
            </div>
        </div>
    );
};

export default MainLayout; 