
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
}) {
  const [selectedCategory, setSelectedCategory] = useState("headwear");

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
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
          } else if (selectedCategory === "Clothing") {
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
            {category === "kimono" ? "Clothing" : category.charAt(0).toUpperCase() + category.slice(1)}
          </div>
        ))}
      </div>

      {/* Display stickers for the selected category */}
      <div className="mt-3 pb-8">
        {renderStickers()}
      </div>
    </div>
  );
}

export default ImageScroller;
