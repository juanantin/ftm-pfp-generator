
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

  // Handle sticker removal for the selected category
  const handleRemoveSticker = (category) => {
    if (!canvas) return; // Guard against null canvas
    
    console.log("Removing sticker for category:", category);
    
    if (category === "headwear" && setHats) {
      canvas.remove(hats);
      setHats(null);
    } else if (category === "kimono" && setKimonos) {
      canvas.remove(kimonos);
      setKimonos(null);
    } else if (category === "accessories" && setWeapons) {
      canvas.remove(weapons);
      setWeapons(null);
    } else if (category === "eyewear" && setEyewear) {
      canvas.remove(eyewear);
      setEyewear(null);
    } else if (category === "mouth" && setMouth) {
      canvas.remove(mouth);
      setMouth(null);
    } else if (category === "background") {
      // Add background removal functionality
      if (canvas) {
        canvas.setBackgroundImage(null, canvas.renderAll.bind(canvas));
        canvas.setBackgroundColor("#fff", canvas.renderAll.bind(canvas));
      }
    }
    
    // Ensure the canvas is re-rendered
    if (canvas) {
      canvas.renderAll();
    }
  };

  const renderStickers = () => {
    // Guard against null categorizedImages
    if (!categorizedImages) {
      console.log("No categorized images available");
      return <div>Loading stickers...</div>;
    }
    
    const stickers = categorizedImages[selectedCategory] || [];
    console.log(`Rendering ${stickers.length} stickers for category ${selectedCategory}`);
    
    return (
      <div className="flex flex-wrap gap-2 justify-center">
        {/* Delete card at the beginning of each category - dark red */}
        <div
          className="w-[100px] h-[100px] bg-[#8B0000] rounded-md overflow-hidden cursor-pointer shadow-md transform hover:scale-105 transition-transform flex items-center justify-center"
          onClick={() => handleRemoveSticker(selectedCategory)}
        >
          <div className="text-white text-center font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Delete
          </div>
        </div>
        
        {stickers.map((sticker, index) => {
          // Handle background images differently
          if (selectedCategory === "background") {
            return (
              <div
                key={index}
                className="w-[120px] h-[85px] bg-[#F1F1F1] rounded-md overflow-hidden cursor-pointer shadow-md transform hover:scale-105 transition-transform"
                onClick={() => changeBackgroundImage(sticker, canvas)}
              >
                <img
                  src={sticker}
                  alt={`${selectedCategory}-${index}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error("Failed to load image:", sticker);
                    e.target.src = "https://via.placeholder.com/120x85?text=Error";
                  }}
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
              className="w-[100px] h-[100px] bg-[#F1F1F1] rounded-md overflow-hidden cursor-pointer shadow-md transform hover:scale-105 transition-transform"
              onClick={() => handleAddImage(stateVarToUpdate, setStateVarToUpdate, sticker)}
            >
              <img
                src={sticker}
                alt={`${selectedCategory}-${index}`}
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  console.error("Failed to load image:", sticker);
                  e.target.src = "https://via.placeholder.com/100x100?text=Error";
                }}
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
