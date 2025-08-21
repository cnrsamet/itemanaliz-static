import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const [open, setOpen] = React.useState(false);
    return (
        <div className="w-full h-16 md:h-20 flex items-center justify-between">
            {/* LOGO */}
            <Link to="/" className="flex items-center gap-4 text-2xl font-bold text-[#fdb377] hover:text-[#fdb377]/80 transition-colors">
                <img src="/logo.png" className="w-8 h-8" alt="" />
                <span>ITEM ANALİZ</span>
            </Link>
            {/* MOBILE MENU */}
            <div className="md:hidden">
                {/*MOBILE BUTTON*/}
                <div
                    className="cursor-pointer text-2xl font-bold text-[#fdb377] hover:text-[#fdb377]/80 transition-colors"
                    onClick={() => setOpen((prev) => !prev)}
                >
                    {open ? 'X' : '='}
                </div>
                {/*MOBILE LINK LIST*/}
                <div
                    className={`w-full h-screen flex flex-col items-center gap-8 font-medium text-lg justify-center absolute top-16 bg-[#151320] transition-all ease-in-out ${
                        open ? '-right-0' : '-right-[100%]'
                    }`}
                    style={{ zIndex: 50 }}
                >
                    <Link to="https://www.sametcaner.com" target="_blank" className="text-[#fdb377] hover:text-[#fdb377]/80 transition-colors">Created by Samet CANER 🤙🏻</Link>
                </div>
            </div>

            {/* DESKTOP MENU */}
            <div className="hidden md:flex items-center gap-8 xl:gap-12 font-medium">
                <Link to="https://www.sametcaner.com" target="_blank" className="text-[#fdb377] hover:text-[#fdb377]/80 transition-colors">Created by Samet CANER 🤙🏻</Link>
            </div>
        </div>
    );
};

export default Navbar;
