
import { useState } from 'react';
import { Trash2 } from "lucide-react";

const AssetTabs = ({
  categorizedImages,
  canvas,
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
}) => {
  const [activeTab, setActiveTab] = useState(Object.keys(categorizedImages)[0]);

  const handleDeleteCategory = (category) => {
    if (!canvas) return;

    // Create visual feedback for deletion button
    const deleteBtn = document.getElementById(`delete-btn-${category}`);
    if (deleteBtn) {
      deleteBtn.style.transform = "scale(0.9)";
      setTimeout(() => {
        deleteBtn.style.transform = "scale(1)";
      }, 150);
    }

    // Reset state variables when removing items
    switch (category) {
      case "headwear":
        if (hats) setHats(null);
        break;
      case "kimono":
        if (kimonos) setKimonos(null);
        break;
      case "accessories":
        if (weapons) setWeapons(null);
        break;
      case "eyewear":
        if (eyewear) setEyewear(null);
        break;
      case "mouth":
        if (mouth) setMouth(null);
        break;
    }

    // Remove objects by category
    const objects = canvas.getObjects();
    objects.forEach(obj => {
      if (obj._element && obj._element.src && typeof obj._element.src === 'string') {
        const src = obj._element.src.toLowerCase();
        if (
          (category === "headwear" && (src.includes("headwear") || src.includes("/01 headwear/"))) ||
          (category === "kimono" && (src.includes("kimono") || src.includes("/04 kimono/") || src.includes("clothing"))) ||
          (category === "accessories" && (src.includes("accessories") || src.includes("/06 accessories/"))) ||
          (category === "eyewear" && (src.includes("eyewear") || src.includes("/02 eyewear/"))) ||
          (category === "mouth" && (src.includes("mouth") || src.includes("/03 mouth/")))
        ) {
          canvas.remove(obj);
        }
      }
    });

    // Handle background separately
    if (category === "background") {
      canvas.setBackgroundImage(null, canvas.renderAll.bind(canvas));
    }

    canvas.renderAll();
  };

  // Change "kimono" display name to "clothing"
  const getCategoryDisplayName = (category) => {
    if (category === "kimono") return "Clothing";
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className="w-full px-4">
      <div className="flex overflow-x-auto no-scrollbar mb-4 bg-[#0A1F3F] rounded-lg p-2">
        {Object.keys(categorizedImages)
          .filter(category => category !== "paw accessories")
          .map((category) => (
            <button
              key={category}
              onClick={() => setActiveTab(category)}
              className={`px-4 py-2 rounded-lg mr-2 min-w-max transition-all ${
                activeTab === category
                  ? "bg-white text-black"
                  : "text-white hover:bg-white/10"
              }`}
            >
              {getCategoryDisplayName(category)}
            </button>
          ))}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
        <button
          onClick={() => handleDeleteCategory(activeTab)}
          className="aspect-square flex items-center justify-center bg-red-600 hover:bg-red-700 rounded-lg transition-transform duration-200 hover:scale-105"
          id={`delete-btn-${activeTab}`}
        >
          <Trash2 className="w-8 h-8 text-white" />
        </button>

        {categorizedImages[activeTab]?.map((img, i) => (
          <button
            key={i}
            onClick={() => {
              if (activeTab === "headwear") {
                handleAddImage(hats, setHats, img);
              } else if (activeTab === "kimono") {
                handleAddImage(kimonos, setKimonos, img);
              } else if (activeTab === "accessories") {
                handleAddImage(weapons, setWeapons, img);
              } else if (activeTab === "eyewear") {
                handleAddImage(eyewear, setEyewear, img);
              } else if (activeTab === "mouth") {
                handleAddImage(mouth, setMouth, img);
              } else if (activeTab === "background") {
                changeBackgroundImage(img, canvas);
              }
            }}
            className="aspect-square bg-[#0A1F3F] rounded-lg p-2 transition-transform duration-200 hover:scale-105"
          >
            <img
              src={img}
              className="w-full h-full object-contain"
              alt={`${activeTab} item ${i + 1}`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default AssetTabs;
