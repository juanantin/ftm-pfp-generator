
import React, { useRef } from "react";

const ImageScroller = ({
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
}) => {
  const refs = useRef({});

  const scrollLeft = (category) => {
    if (refs.current[category]) {
      refs.current[category].scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = (category) => {
    if (refs.current[category]) {
      refs.current[category].scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  // Change "kimono" display name to "clothing"
  const getCategoryDisplayName = (category) => {
    if (category === "kimono") return "Clothing";
    return category;
  };

  const goToHomepage = () => {
    window.open("https://fantomsonic.com/", "_blank");
  };

  return (
    <div className="w-full mt-1">
      {Object.keys(categorizedImages).filter(category => category !== "paw accessories").map((category) => (
        <div key={category} className="mb-2">
          <h2 className="text-sm text-center text-white mb-1 capitalize" style={{ fontFamily: "'Finger Paint', cursive" }}>
            {getCategoryDisplayName(category)}
          </h2>
          <div className="relative flex items-center">
            <button
              className="absolute left-0 z-10 p-1 bg-[#0A1F3F] rounded-full hover:bg-blue-900"
              onClick={() => scrollLeft(category)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#FFFFFF"
                  d="m6.523 12.5l3.735 3.735q.146.146.153.344q.006.198-.153.363q-.166.166-.357.168t-.357-.162l-4.382-4.383q-.243-.242-.243-.565t.243-.566l4.382-4.382q.147-.146.347-.153q.201-.007.367.159q.16.165.162.353q.003.189-.162.354L6.523 11.5h12.38q.214 0 .358.143t.143.357t-.143.357t-.357.143z"
                />
              </svg>
            </button>
            <div
              className="flex overflow-x-auto no-scrollbar scroll-smooth px-4"
              ref={(scrollRef) => (refs.current[category] = scrollRef)}
            >
              <div className="flex-shrink-0 w-10"></div>
              <div
                className="flex items-center justify-center border-3 border-red-600 rounded-lg m-1 cursor-pointer transition-transform duration-0 ease-in-out transform hover:scale-125 bg-[#0A1F3F]"
                style={{ boxShadow: "0 0 8px #ff0000", animation: "pulse 1.5s infinite" }}
                onClick={() => {
                  if (canvas != null) {
                    // Create visual feedback for deletion button
                    const deleteBtn = document.getElementById(`delete-btn-${category}`);
                    if (deleteBtn) {
                      // Add click animation
                      deleteBtn.style.transform = "scale(0.9)";
                      setTimeout(() => {
                        deleteBtn.style.transform = "scale(1)";
                      }, 150);
                    }
                    
                    // Force raw rendering to ensure object detection
                    canvas.renderAll();
                    
                    console.log(`Attempting to remove ${category} sticker`);
                    let removed = false;
                    
                    // Reset the state variables when removing items
                    if (category === "headwear") {
                      if (hats) {
                        setHats(null);
                      }
                    } else if (category === "kimono") {
                      if (kimonos) {
                        setKimonos(null);
                      }
                    } else if (category === "accessories") {
                      if (weapons) {
                        setWeapons(null);
                      }
                    } else if (category === "eyewear") {
                      if (setEyewear) {
                        setEyewear(null);
                      }
                    } else if (category === "mouth") {
                      if (setMouth) {
                        setMouth(null);
                      }
                    }
                    
                    // First try: Remove using the stored state objects
                    if (category === "headwear" && hats) {
                      canvas.remove(hats);
                      removed = true;
                      console.log("Removed headwear using state variable");
                    } else if (category === "kimono" && kimonos) {
                      canvas.remove(kimonos);
                      removed = true;
                      console.log("Removed kimono using state variable");
                    } else if (category === "accessories" && weapons) {
                      canvas.remove(weapons);
                      removed = true;
                      console.log("Removed accessories using state variable");
                    } else if (category === "eyewear" && eyewear) {
                      canvas.remove(eyewear);
                      removed = true;
                      console.log("Removed eyewear using state variable");
                    } else if (category === "mouth" && mouth) {
                      canvas.remove(mouth);
                      removed = true;
                      console.log("Removed mouth using state variable");
                    }
                    
                    // Second try: Remove objects by category
                    const objects = canvas.getObjects();
                    
                    // Keep track of each object we're removing to avoid duplicates
                    const objectsToRemove = [];
                    
                    objects.forEach(obj => {
                      if (obj._element && obj._element.src && typeof obj._element.src === 'string') {
                        const src = obj._element.src.toLowerCase();
                        
                        // Check each category
                        if (category === "headwear" && (src.includes("headwear") || src.includes("/01 headwear/"))) {
                          objectsToRemove.push(obj);
                          removed = true;
                        } else if (category === "kimono" && (src.includes("kimono") || src.includes("/04 kimono/") || src.includes("clothing"))) {
                          objectsToRemove.push(obj);
                          removed = true;
                        } else if (category === "accessories" && (src.includes("accessories") || src.includes("/06 accessories/"))) {
                          objectsToRemove.push(obj);
                          removed = true;
                        } else if (category === "eyewear" && (src.includes("eyewear") || src.includes("/02 eyewear/"))) {
                          objectsToRemove.push(obj);
                          removed = true;
                        } else if (category === "mouth" && (src.includes("mouth") || src.includes("/03 mouth/"))) {
                          objectsToRemove.push(obj);
                          removed = true;
                        }
                      }
                    });
                    
                    // Remove all found objects
                    objectsToRemove.forEach(obj => {
                      canvas.remove(obj);
                      console.log(`Removed ${category} by src match`);
                    });
                    
                    // Third try: Position-based removal as a fallback
                    if (!removed) {
                      console.log(`Trying position-based removal for ${category}`);
                      
                      objects.forEach(obj => {
                        if (obj.selectable === false && obj.evented === false) {
                          // Skip the main character image
                          const isMainCharacter = obj === objects[0] || 
                            (obj._element && obj._element.src && 
                             obj._element.src.includes("main_cat"));
                          
                          if (!isMainCharacter) {
                            if (category === "headwear" && obj.top < canvas.height * 0.3) {
                              canvas.remove(obj);
                              removed = true;
                              console.log("Removed headwear by position");
                            } else if (category === "eyewear" && obj.top < canvas.height * 0.4) {
                              canvas.remove(obj);
                              removed = true;
                              console.log("Removed eyewear by position");
                            } else if (category === "mouth" && 
                                       obj.top > canvas.height * 0.3 && 
                                       obj.top < canvas.height * 0.6) {
                              canvas.remove(obj);
                              removed = true;
                              console.log("Removed mouth by position");
                            } else if (category === "kimono" && 
                                       obj.top > canvas.height * 0.4 && 
                                       obj.top < canvas.height * 0.7) {
                              canvas.remove(obj);
                              removed = true;
                              console.log("Removed kimono by position");
                            } else if (category === "accessories" && 
                                       obj.top > canvas.height * 0.5) {
                              canvas.remove(obj);
                              removed = true;
                              console.log("Removed accessories by position");
                            }
                          }
                        }
                      });
                    }
                    
                    // Handle background separately
                    if (category === "background") {
                      // Store any important objects before changing background
                      const mainCatImage = objects.find(obj => obj.selectable === false);
                      let mainCatProps = null;
                      
                      if (mainCatImage) {
                        mainCatProps = {
                          scaleX: mainCatImage.scaleX,
                          scaleY: mainCatImage.scaleY,
                          left: mainCatImage.left,
                          top: mainCatImage.top,
                          originX: mainCatImage.originX,
                          originY: mainCatImage.originY
                        };
                      }
                      
                      // Remove background
                      canvas.setBackgroundImage(null, canvas.renderAll.bind(canvas));
                      removed = true;
                      
                      // Restore main cat properties if needed
                      if (mainCatProps) {
                        setTimeout(() => {
                          const mainCat = canvas.getObjects().find(obj => obj.selectable === false);
                          if (mainCat) {
                            mainCat.set(mainCatProps);
                            canvas.renderAll();
                          }
                        }, 100);
                      }
                      
                      console.log("Removed background");
                    }
                    
                    // Final status report
                    if (removed) {
                      console.log(`Successfully removed ${category} sticker`);
                    } else {
                      console.log(`No ${category} sticker found to remove`);
                    }
                    
                    // Make sure canvas is properly updated
                    canvas.renderAll();
                    
                    // Update the preview after deletion with multiple attempts
                    setTimeout(() => {
                      if (canvas && typeof canvas.renderAll === 'function') {
                        canvas.renderAll();
                      }
                      
                      // Try to trigger any preview update functions the parent might have
                      if (canvas && canvas.fire) {
                        canvas.fire('object:modified');
                      }
                      
                      // One more attempt after longer delay
                      setTimeout(() => {
                        if (canvas && typeof canvas.renderAll === 'function') {
                          canvas.renderAll();
                        }
                      }, 500);
                    }, 100);
                  }
                }}
                id={`delete-btn-${category}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-[48px] h-[48px] p-3"
                  viewBox="0 0 256 256"
                >
                  <path
                    fill="#FFFFFF"
                    d="M195.51 62.66L212.44 44a6 6 0 1 0-8.88-8l-16.93 18.58A94 94 0 0 0 60.49 193.34L43.56 212a6 6 0 0 0 8.88 8l16.93-18.62A94 94 0 0 0 195.51 62.66M46 128a81.93 81.93 0 0 1 132.53-64.51L68.59 184.43A81.69 81.69 0 0 1 46 128m82 82a81.57 81.57 0 0 1-50.53-17.49L187.41 71.57A81.94 81.94 0 0 1 128 210"
                  />
                </svg>
              </div>
              {categorizedImages[category].map((img, i) => (
                <img
                  src={img}
                  key={i}
                  onClick={() => {
                    if (category === "headwear") {
                      handleAddImage(hats, setHats, img);
                    } else if (category === "kimono") {
                      handleAddImage(kimonos, setKimonos, img);
                    } else if (category === "accessories") {
                      handleAddImage(weapons, setWeapons, img);
                    } else if (category === "eyewear") {
                      // For eyewear, use state management like the other categories
                      handleAddImage(eyewear, setEyewear, img);
                    } else if (category === "mouth") {
                      // For mouth, use state management like the other categories
                      handleAddImage(mouth, setMouth, img);
                    } else if (category === "background") {
                      changeBackgroundImage(img, canvas);
                    }
                  }}
                  className="w-[60px] h-[60px] border border-[#0A1F3F] rounded-lg m-1 cursor-pointer transition-transform duration-0 ease-in-out transform hover:scale-125"
                  alt={`img-${i}`}
                />
              ))}
              <div className="flex-shrink-0 w-10"></div>
            </div>
            <button
              className="absolute right-0 z-10 p-1 bg-[#0A1F3F] rounded-full hover:bg-blue-900"
              onClick={() => scrollRight(category)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#FFFFFF"
                  d="M17.073 12.5H5.5q-.213 0-.357-.143T5 12t.143-.357t.357-.143h11.573l-3.735-3.734q-.146-.147-.152-.345t.152-.363q.166-.166.357-.168t.357.162l4.383 4.383q.13.13.183.267t.053.298t-.053.298t-.183.268l-4.383 4.382q-.146.146-.347.153t-.367-.159q-.16-.165-.162-.354t.162-.354z"
                />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageScroller;
