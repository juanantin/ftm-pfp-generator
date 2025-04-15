
import React from 'react';
import roundLogo from "../public/lovable-uploads/be6d606d-e20d-47a4-a906-4f6f02bd8668.png";

const Footer = () => {
  return (
    <div className="flex justify-center pb-16 mt-10">
      <img
        src={roundLogo}
        alt="Logo"
        onClick={() => window.location.href = "https://fantomsonic.com"}
        className="w-14 h-14 cursor-pointer hover:opacity-80 transition-opacity"
      />
    </div>
  );
};

export default Footer;
