
import React from 'react';
import roundLogo from "../public/lovable-uploads/be6d606d-e20d-47a4-a906-4f6f02bd8668.png";
import fantomLogo from "../public/lovable-uploads/e562fef2-b876-4191-9dd8-82c2e04581ec.png";

const Header = () => {
  return (
    <>
      <div className="pt-5 pb-10 mt-12">
        <img 
          src={fantomLogo} 
          alt="Fantom PFP Generator" 
          className="w-[200px] md:w-[260px] h-auto mx-auto"
        />
      </div>

      <div className="fixed top-5 left-5 z-50">
        <img
          src={roundLogo}
          alt="Home"
          onClick={() => window.location.href = "https://fantomsonic.com"}
          className="w-16 h-16 md:w-14 md:h-14 cursor-pointer hover:opacity-80 transition-opacity"
        />
      </div>
    </>
  );
};

export default Header;
