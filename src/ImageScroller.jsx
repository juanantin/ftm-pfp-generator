
import React, { useState } from "react";

function ImageScroller({
  canvas,
  categorizedImages,
  handleAddImage,
  changeBackgroundImage,
  hats,
  kimonos,
  weapons,
  eyewear,
  mouth,
  setHats,
  setKimonos,
  setWeapons,
  setEyewear,
  setMouth,
  removeSticker,
}) {
  const [selectedCategory, setSelectedCategory] = useState("headwear");

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };
  
  // Function to handle sticker removal
  const handleStickerRemoval = (category) => {
    if (typeof removeSticker === 'function') {
      removeSticker(category);
    } else {
      console.error('removeSticker function not properly provided to ImageScroller');
    }
  };

  const renderStickers = () => {
    const stickers = categorizedImages[selectedCategory] || [];
    
    return (
      <div className="flex flex-wrap gap-2 justify-center">
        {stickers.map((sticker, index) => {
          // Handle background images differently
          if (selectedCategory === "background") {
            return (
              <div
                key={index}
                className="w-[120px] h-[85px] bg-white rounded-md overflow-hidden cursor-pointer shadow-md transform hover:scale-105 transition-transform"
                onClick={() => changeBackgroundImage(sticker, canvas)}
              >
                <img
                  src={sticker}
                  alt={`${selectedCategory}-${index}`}
                  className="w-full h-full object-cover"
                />
              </div>
            );
          }

          // For non-background stickers
          let stateVarToUpdate, setStateVarToUpdate;
          
          if (selectedCategory === "headwear") {
            stateVarToUpdate = hats;
            setStateVarToUpdate = setHats;
          } else if (selectedCategory === "kimono") {
            stateVarToUpdate = kimonos;
            setStateVarToUpdate = setKimonos;
          } else if (selectedCategory === "accessories") {
            stateVarToUpdate = weapons;
            setStateVarToUpdate = setWeapons;
          } else if (selectedCategory === "eyewear") {
            stateVarToUpdate = eyewear;
            setStateVarToUpdate = setEyewear; 
          } else if (selectedCategory === "mouth") {
            stateVarToUpdate = mouth;
            setStateVarToUpdate = setMouth;
          }
          
          return (
            <div
              key={index}
              className="w-[100px] h-[100px] bg-white rounded-md overflow-hidden cursor-pointer shadow-md transform hover:scale-105 transition-transform"
              onClick={() => handleAddImage(stateVarToUpdate, setStateVarToUpdate, sticker)}
            >
              <img
                src={sticker}
                alt={`${selectedCategory}-${index}`}
                className="w-full h-full object-cover object-center"
              />
            </div>
          );
        })}
      </div>
    );
  };

  // Add delete buttons for sticker categories
  const renderDeleteButtons = () => {
    const isMobile = window.innerWidth <= 768;
    const buttonStyle = isMobile ? 
      "mb-3 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium" : 
      "mb-4 bg-red-500 text-white px-3 py-1 rounded-md text-sm font-medium";
      
    return (
      <div className="w-full flex flex-wrap justify-center gap-3 mb-4 mt-2">
        <button 
          className={buttonStyle}
          onClick={() => handleStickerRemoval("headwear")}
        >
          Remove Headwear
        </button>
        
        <button 
          className={buttonStyle}
          onClick={() => handleStickerRemoval("eyewear")}
        >
          Remove Eyewear
        </button>
        
        <button 
          className={buttonStyle}
          onClick={() => handleStickerRemoval("mouth")}
        >
          Remove Mouth
        </button>
        
        <button 
          className={buttonStyle}
          onClick={() => handleStickerRemoval("kimono")}
        >
          Remove Clothing
        </button>
        
        <button 
          className={buttonStyle}
          onClick={() => handleStickerRemoval("accessories")}
        >
          Remove Accessories
        </button>
      </div>
    );
  };

  return (
    <div>
      {/* Category selector */}
      <div className="flex flex-wrap justify-center gap-3 mb-4 mt-2">
        {Object.keys(categorizedImages || {}).map((category) => (
          <div
            key={category}
            onClick={() => handleCategorySelect(category)}
            className={`py-2 px-3 rounded-xl text-base cursor-pointer border-2 ${
              selectedCategory === category
                ? "bg-white text-black font-bold"
                : "bg-[#0A1F3F] text-white"
            } transition-colors`}
            style={{ fontFamily: "'Finger Paint', cursive" }}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </div>
        ))}
      </div>
      
      {/* Delete buttons for stickers */}
      {renderDeleteButtons()}

      {/* Display stickers for the selected category */}
      <div className="mt-3 pb-8">
        {renderStickers()}
      </div>
    </div>
  );
}

export default ImageScroller;
