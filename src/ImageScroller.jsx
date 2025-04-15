
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

  const getOrderedCategories = () => {
    // Make sure all categories are included in the correct order
    const order = ["headwear", "eyewear", "mouth", "kimono", "accessory", "background"];
    // Filter out categories that don't exist in categorizedImages
    return order.filter(cat => categorizedImages && Object.keys(categorizedImages).includes(cat));
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleRemoveSticker = (category) => {
    if (category === "headwear" && setHats) {
      canvas.remove(hats);
      setHats(null);
    } else if (category === "kimono" && setKimonos) {
      canvas.remove(kimonos);
      setKimonos(null);
    } else if (category === "accessory" && setWeapons) {
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
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-wrap justify-center gap-3 mb-4 mt-2">
        {getOrderedCategories().map((category) => (
          <div
            key={category}
            onClick={() => handleCategorySelect(category)}
            className={`py-2 px-3 rounded-xl text-base cursor-pointer transition-all duration-300 content-font font-[Finger Paint]
              ${selectedCategory === category
                ? "bg-white text-black transform scale-105" 
                : "bg-[#0A1F3F] text-white hover:bg-[#1A2F4F] hover:text-white transform hover:scale-105"
              }`}
          >
            {category === "kimono" ? "Clothing" : 
             category === "accessory" ? "Accessories" :
             category.charAt(0).toUpperCase() + category.slice(1)}
          </div>
        ))}
      </div>

      <div className="mt-3 pb-8 flex justify-center">
        <div className="flex flex-wrap gap-2 justify-center">
          {/* Delete card - reduced size */}
          <div
            className="w-[75px] h-[75px] bg-[#8B0000] rounded-md overflow-hidden cursor-pointer shadow-md transform hover:scale-110 transition-transform flex items-center justify-center"
            onClick={() => handleRemoveSticker(selectedCategory)}
          >
            <div className="text-white text-center font-[Finger Paint]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Delete
            </div>
          </div>
          
          {/* Sticker cards - reduced size */}
          {(categorizedImages[selectedCategory] || []).map((sticker, index) => (
            <div
              key={index}
              className={`${
                selectedCategory === "background" 
                  ? "w-[90px] h-[65px]" 
                  : "w-[75px] h-[75px]"
              } bg-[#F1F1F1] rounded-md overflow-hidden cursor-pointer shadow-md transform hover:scale-110 transition-transform`}
              onClick={() => 
                selectedCategory === "background"
                  ? changeBackgroundImage(sticker, canvas)
                  : handleAddImage(
                      selectedCategory === "headwear" ? hats :
                      selectedCategory === "kimono" ? kimonos :
                      selectedCategory === "accessory" ? weapons :
                      selectedCategory === "eyewear" ? eyewear :
                      selectedCategory === "mouth" ? mouth : null,
                      selectedCategory === "headwear" ? setHats :
                      selectedCategory === "kimono" ? setKimonos :
                      selectedCategory === "accessory" ? setWeapons :
                      selectedCategory === "eyewear" ? setEyewear :
                      selectedCategory === "mouth" ? setMouth : null,
                      sticker
                    )
              }
            >
              <img
                src={sticker}
                alt={`${selectedCategory}-${index}`}
                className="w-full h-full object-cover object-center"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ImageScroller;
