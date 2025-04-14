import React, { useState } from "react";
import { Trash2 } from 'lucide-react';

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
  handleRemoveCategory,
  activeCategories
}) {
  const [selectedCategory, setSelectedCategory] = useState("headwear");

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  // Handle removing sticker based on category
  const handleRemoveSticker = (category) => {
    switch(category) {
      case "headwear":
        if (hats) {
          canvas.remove(hats);
          setHats(null);
        }
        break;
      case "kimono":
        if (kimonos) {
          canvas.remove(kimonos);
          setKimonos(null);
        }
        break;
      case "accessories":
        if (weapons) {
          canvas.remove(weapons);
          setWeapons(null);
        }
        break;
      case "eyewear":
        if (eyewear) {
          canvas.remove(eyewear);
          setEyewear(null);
        }
        break;
      case "mouth":
        if (mouth) {
          canvas.remove(mouth);
          setMouth(null);
        }
        break;
    }
  };

  const renderStickers = () => {
    const stickers = categorizedImages[selectedCategory] || [];
    
    return (
      <div className="flex flex-col w-full">
        {/* Category header */}
        <div className="flex items-center mb-6 px-2">
          <h3 className="text-4xl text-white font-bold">
            {selectedCategory === "kimono" ? "Clothing" : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
          </h3>
        </div>

        {/* Stickers grid with delete button as first item */}
        <div className="flex flex-wrap gap-2 justify-center">
          <div
            className="w-[100px] h-[100px] bg-red-500 rounded-md overflow-hidden cursor-pointer shadow-md transform hover:scale-105 transition-transform flex items-center justify-center"
            onClick={() => handleRemoveSticker(selectedCategory)}
          >
            <Trash2 size={48} color="white" />
          </div>
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
                onClick={() => handleAddImage(stateVarToUpdate, setStateVarToUpdate, sticker, selectedCategory)}
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
