
import { useState, useEffect, useRef } from "react";
// Import Fabric.js properly to prevent "Canvas is not a constructor" error
import { fabric } from "fabric";
import logo from "./assets/logo.png";
import ImageScroller from "./ImageScroller";
import bg from "./assets/bg.png";
// Instead of importing directly, we'll reference the image by its URL
const main_cat = "/lovable-uploads/b9485130-b21f-4a80-84a1-7fffa1f3e4fe.png";

function App() {
  console.log("App is running!"); // Add console log to verify app is running
  const [stickers, setStickers] = useState({});

  // Ensure the canvas ref is properly initialized and persists across renders
  const canvasRef = useRef(null);
  const bgImgInputRef = useRef(null);
  const stickerImgInputRef = useRef(null);
  const fabricInitialized = useRef(false);

  const [canvas, setCanvas] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [headwear, setHeadwear] = useState(null);
  const [eyewear, setEyewear] = useState(null);
  const [mouth, setMouth] = useState(null);
  const [kimono, setKimono] = useState(null);
  const [jewelry, setJewelry] = useState(null);
  const [accessories, setAccessories] = useState(null);
  // Removed pawAccessories state

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // You can adjust this threshold as needed
    };

    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);

    // Remove event listener on component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (selectedObject) {
      const updateImagePosition = () => {
        const imgElement = document.getElementById("selected-img");

        if (imgElement) {
          imgElement.style.top = `${selectedObject.top - 30}px`;
          imgElement.style.left = `${selectedObject.left}px`;
        }
      };

      // Update image position whenever selectedObject changes
      updateImagePosition();

      // Also, listen for object modification and update the image position accordingly
      const objectModifiedHandler = () => {
        updateImagePosition();
        
        // Update preview when object is modified
        setTimeout(() => {
          saveImageToDataURL();
        }, 100);
      };

      canvas.on("object:modified", objectModifiedHandler);

      return () => {
        canvas.off("object:modified", objectModifiedHandler);
      };
    }
  }, [canvas, selectedObject, isMobile]);

  const changeBackgroundImage = (backgroundImage, canvas) => {
    fabric.Image.fromURL(backgroundImage, (img) => {
      // Calculate the new dimensions respecting the maximum width of 550px
      let newWidth = img.width;
      let newHeight = img.height;

      let maxWidth = isMobile ? 400 : 400;

      if (img.width > maxWidth) {
        newWidth = maxWidth;
        newHeight = (maxWidth / img.width) * img.height;
      }

      canvas.setWidth(newWidth);
      canvas.setHeight(400);

      canvas.renderAll();

      canvas.setBackgroundImage(
        backgroundImage,
        canvas.renderAll.bind(canvas),
        {
          scaleX: canvas.width / img.width,
          scaleY: canvas.height / img.height,
        }
      );
      
      // Update preview after changing background
      setTimeout(() => {
        saveImageToDataURL();
      }, 300);
    });
  };

  useEffect(() => {
    if (!canvas) return;

    if (backgroundImage) {
      changeBackgroundImage(backgroundImage, canvas);
    } else {
      canvas.setBackgroundImage("", canvas.renderAll.bind(canvas));
    }
    
    // Update preview whenever canvas changes
    setTimeout(() => {
      console.log("Updating preview from background change effect");
      saveImageToDataURL();
    }, 500);
  }, [canvas, backgroundImage, isMobile]);

  // Initialize canvas function
  const initializeCanvas = () => {
    // Only initialize fabric once to prevent errors
    if (!fabricInitialized.current) {
      try {
        console.log("Starting canvas initialization");
        
        // Make sure we have a canvas element to work with
        if (!canvasRef.current) {
          console.error("Canvas reference element is not available!");
          // Try again after a short delay
          setTimeout(() => initializeCanvas(), 500);
          return;
        }
        
        console.log("Canvas element found:", canvasRef.current);
        
        // Create the Fabric.js canvas instance
        const newCanvas = new fabric.Canvas(canvasRef.current, {
          width: window.innerWidth <= 768 ? 400 : 400,
          height: window.innerWidth <= 768 ? 400 : 400,
          backgroundColor: "#000", // Black background
          preserveObjectStacking: true, // Maintain stacking order of objects
        });
        
        console.log("Canvas created successfully:", newCanvas);
        setCanvas(newCanvas);
        fabricInitialized.current = true;

        // Set up event listeners
        newCanvas.on("selection:created", (e) => {
          setSelectedObject(e.selected[0]);
        });

        newCanvas.on("object:modified", (e) => {
          setSelectedObject(e.target);
          // Update preview after modifying object
          setTimeout(() => {
            saveImageToDataURL();
          }, 500);
        });

        newCanvas.on("selection:cleared", () => {
          setSelectedObject(null);
        });

        // Add the main cat image and wait for it to fully load
        fabric.Image.fromURL(main_cat, (img) => {
          if (!img) {
            console.error("Failed to load main image");
            // Try loading a backup image or retry
            setTimeout(() => {
              fabric.Image.fromURL(main_cat, handleImageLoad);
            }, 1000);
            return;
          }
          
          handleImageLoad(img);
        });
        
        function handleImageLoad(img) {
          try {
            const canvasWidth = newCanvas.getWidth();
            img.scaleToWidth(canvasWidth);
            img.scaleToHeight(img.height * (canvasWidth / img.width));
            
            // Store the base model's scaling factors for reference
            newCanvas.baseModelScaleFactor = {
              scaleX: img.scaleX,
              scaleY: img.scaleY
            };
            
            img.set({ 
              selectable: false,
              evented: false,
              lockMovementX: true,
              lockMovementY: true,
              lockScalingX: true,
              lockScalingY: true,
              lockRotation: true,
              hasBorders: false,
              hasControls: false
            });
            
            newCanvas.add(img);
            newCanvas.renderAll();
            
            // Wait for image to be fully rendered before updating preview
            setTimeout(() => {
              console.log("Updating preview after adding main image");
              newCanvas.renderAll(); // Force another render
              
              // Multiple attempts to update preview with increasing delays
              setTimeout(() => {
                saveImageToDataURL();
                
                // Force an additional update attempt after a longer delay
                setTimeout(() => {
                  console.log("Final fallback preview update");
                  saveImageToDataURL();
                }, 2000);
              }, 1200);
            }, 1000);
          } catch (err) {
            console.error("Error handling main image:", err);
          }
        }
        
      } catch (error) {
        console.error("Error initializing Fabric.js canvas:", error);
        fabricInitialized.current = false;
        // Try again after a delay
        setTimeout(() => {
          fabricInitialized.current = false;
          initializeCanvas();
        }, 2000);
      }
    }
  };

  useEffect(() => {
    // Import stickers from asset folders
    const importStickers = async () => {
      // Import images from all subfolders in the 'assets/stickers' directory
      const imageContext = import.meta.glob(
        "./assets/stickers/*/*.(png|jpg|jpeg|svg)",
        { eager: true } // Using eager loading to avoid dynamic imports which can fail with spaces in filenames
      );

      // Object to store categorized images
      const categorizedImages = {};

      // Process each import (now using eager loading)
      Object.entries(imageContext).forEach(([path, module]) => {
        const imagePath = module.default;

        // Extract the category (subfolder name) from the path
        const pathParts = path.split("/");
        const folderName = pathParts[pathParts.length - 2];
        const category = folderName.split(" ").slice(1).join(" ");

        // Initialize the array for the category if it doesn't exist
        if (!categorizedImages[category]) {
          categorizedImages[category] = [];
        }

        // Add the image path to the appropriate category
        categorizedImages[category].push(imagePath);
      });

      // Use the categorized images as needed
      setStickers(categorizedImages);
      
      // After loading stickers, try to initialize the canvas
      setTimeout(() => {
        initializeCanvas();
        
        // Force an initial preview update after everything is loaded with longer delay
        setTimeout(() => {
          console.log("Initial preview update");
          saveImageToDataURL();
          
          // Ensure preview is visible by forcing another update
          setTimeout(() => {
            const resultPreview = document.getElementById('result-preview');
            if (resultPreview && (!resultPreview.src || resultPreview.src === '')) {
              console.log("Forcing additional preview update");
              saveImageToDataURL();
            }
          }, 1500);
        }, 2000);
      }, 500);
    };

    // Start importing stickers
    importStickers();

    console.log("Fabric object:", fabric);
    
    // Clean up function
    return () => {
      if (canvas) {
        console.log("Disposing canvas");
        canvas.dispose();
        fabricInitialized.current = false;
      }
    };
  }, []);

  const addMainImg = (canvas, image) => {
    if (!canvas) {
      console.error("Canvas is not available for adding main image");
      return;
    }
    
    // Clear any existing objects first
    if (canvas.getObjects().length > 0) {
      const mainImages = canvas.getObjects().filter(obj => !obj.selectable);
      mainImages.forEach(obj => canvas.remove(obj));
    }
    
    // Load the new image
    fabric.Image.fromURL(image, (img) => {
      if (!img) {
        console.error("Failed to load main image in addMainImg");
        return;
      }
      
      try {
        const canvasWidth = canvas.getWidth();

        // Scale base image to fit the canvas width
        img.scaleToWidth(canvasWidth);
        img.scaleToHeight(img.height * (canvasWidth / img.width));
        
        // Store the base model's scaling factors for reference
        canvas.baseModelScaleFactor = {
          scaleX: img.scaleX,
          scaleY: img.scaleY
        };
        
        img.set({
          selectable: false,     // Disable selection
          evented: false,        // Prevent events
          lockMovementX: true,
          lockMovementY: true,
          lockScalingX: true,
          lockScalingY: true,
          lockRotation: true,
          hasBorders: false,
          hasControls: false,
          zIndex: -1            // Put it at the bottom layer
        });

        // Insert at index 0 to ensure it's at the bottom
        canvas.insertAt(img, 0);
        canvas.renderAll();
        
        console.log("Main image added successfully");
        
        // Update preview after adding main image with multiple attempts
        setTimeout(() => {
          saveImageToDataURL();
          
          // One more attempt after a longer delay
          setTimeout(() => {
            saveImageToDataURL();
          }, 1200);
        }, 800);
      } catch (error) {
        console.error("Error setting up main image:", error);
      }
    }, { crossOrigin: 'anonymous' });
  };

  const handleAddImage = (state, setState, image) => {
    if (state != null) {
      canvas.remove(state);
    }
    
    fabric.Image.fromURL(image, (img) => {
      if (!img) {
        console.error("Failed to load sticker image:", image);
        return;
      }
      
      try {
        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();
        
        // Make stickers larger - use a standard scale factor 
        const scaleFactor = 3.0; // Increased scale factor to make stickers larger
        
        // Apply the scaling to make stickers larger
        img.scale(scaleFactor);
        
        // Determine which type of sticker this is and apply vertical offset
        let yOffset = 0;
        
        // Check the image path to determine the category
        const imagePath = image.toLowerCase();
        
        if (imagePath.includes("kimono") || imagePath.includes("clothing")) {
          // Move clothing down
          yOffset = 30; 
        } else if (imagePath.includes("accessories")) {
          // Move accessories down slightly
          yOffset = 20;
        } else if (imagePath.includes("mouth")) {
          // Move mouth items down slightly
          yOffset = 10;
        } else if (imagePath.includes("eyewear")) {
          // Keep eyewear centered but slightly up
          yOffset = -5;
        }
        
        // Center the sticker on the canvas with offset
        img.set({
          left: canvasWidth / 2,
          top: (canvasHeight / 2) + yOffset,
          originX: 'center',
          originY: 'center',
          selectable: false,
          evented: false,
          lockMovementX: true,
          lockMovementY: true,
          lockScalingX: true,
          lockScalingY: true,
          lockRotation: true,
          hasBorders: false,
          hasControls: false
        });
        
        // If the sticker is now too large for the canvas after scaling, reduce it
        if (img.getScaledWidth() > canvasWidth * 0.95) {
          const adjustedScale = (canvasWidth * 0.95) / img.getScaledWidth();
          img.scale(img.scaleX * adjustedScale);
        }

        // Make sure to set state if setState is provided
        if (setState) {
          setState(img);
        }
        
        canvas.add(img);
        canvas.renderAll();
        
        console.log("Added sticker image with larger size (3x scale), centered");
        
        // Update the preview after adding the image
        setTimeout(() => {
          saveImageToDataURL();
        }, 300);
      } catch (error) {
        console.error("Error adding sticker image:", error);
      }
    }, { crossOrigin: 'anonymous' });
  };

  const getRandomImage = (category) => {
    const categoryItems = stickers[category];
    if (!categoryItems || categoryItems.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * categoryItems.length);
    return categoryItems[randomIndex];
  };

  const generateRandom = () => {
    const randomHeadwear = getRandomImage("headwear");
    if (randomHeadwear) handleAddImage(headwear, setHeadwear, randomHeadwear);

    const randomKimono = getRandomImage("kimono");
    if (randomKimono) handleAddImage(kimono, setKimono, randomKimono);

    const randomAccessories = getRandomImage("accessories");
    if (randomAccessories)
      handleAddImage(accessories, setAccessories, randomAccessories);

    const randomBackground = getRandomImage("background");
    if (randomBackground) changeBackgroundImage(randomBackground, canvas);
    
    // Update the preview after a longer delay to ensure canvas renders completely
    setTimeout(() => {
      saveImageToDataURL();
    }, 1000);
  };

  const handleBackgroundImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBackgroundImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSticker = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        fabric.Image.fromURL(event.target.result, (img) => {
          const canvasWidth = canvas.getWidth();
          const canvasHeight = canvas.getHeight();
          
          // Make stickers larger - use a standard scale factor 
          const scaleFactor = 3.0; // Increased scale factor to make stickers larger
          
          // Apply the scaling to make stickers larger
          img.scale(scaleFactor);
          
          // Center the sticker on the canvas
          img.set({
            left: canvasWidth / 2,
            top: canvasHeight / 2,
            originX: 'center',
            originY: 'center',
            selectable: false,
            evented: false,
            lockMovementX: true,
            lockMovementY: true,
            lockScalingX: true,
            lockScalingY: true,
            lockRotation: true,
            hasBorders: false,
            hasControls: false
          });
          
          // If the sticker is now too large for the canvas after scaling, reduce it
          if (img.getScaledWidth() > canvasWidth * 0.95) {
            const adjustedScale = (canvasWidth * 0.95) / img.getScaledWidth();
            img.scale(img.scaleX * adjustedScale);
          }
          
          canvas.add(img);
          
          // Update preview after adding sticker
          setTimeout(() => {
            saveImageToDataURL();
          }, 100);
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveImageToLocal = () => {
    if (canvas) {
      const dataURL = saveImageToDataURL();
      if (!dataURL) {
        console.error("No image data available");
        return;
      }
      
      const blob = dataURLToBlob(dataURL);
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.download = "ftm_pfp.png";
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Release the object URL to free memory
      URL.revokeObjectURL(url);
    }
  };

  // Utility function to convert a data URL to a Blob
  const dataURLToBlob = (dataURL) => {
    const [header, data] = dataURL.split(",");
    const mimeString = header.match(/:(.*?);/)[1];
    const byteString = atob(data);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }

    return new Blob([uint8Array], { type: mimeString });
  };

  const saveImageToDataURL = () => {
    if (!canvas) {
      console.error("Canvas not available for preview");
      return '';
    }
    
    try {
      // Ensure the canvas has content before exporting
      if (canvas.getObjects().length === 0) {
        console.log("Canvas has no objects, adding main cat image");
        addMainImg(canvas, main_cat);
        
        // Give it more time to render before exporting
        setTimeout(() => {
          updatePreviewImage();
        }, 1200);
        return '';
      } else {
        return updatePreviewImage();
      }
    } catch (error) {
      console.error("Error saving image to data URL:", error);
      return '';
    }
  };
  
  const updatePreviewImage = () => {
    try {
      if (!canvas || !canvas.lowerCanvasEl) {
        console.error("Canvas element not fully initialized");
        // Retry after a delay
        setTimeout(() => {
          if (canvas && canvas.lowerCanvasEl) {
            console.log("Retrying preview update");
            updatePreviewImage();
          }
        }, 1000);
        return '';
      }
      
      // Make sure canvas has the main image
      if (canvas.getObjects().length === 0) {
        console.log("Canvas is empty during preview update, adding base image");
        addMainImg(canvas, main_cat);
        
        // Try again after image is added
        setTimeout(() => {
          updatePreviewImage();
        }, 1000);
        return '';
      }
      
      // Use a try/catch for toDataURL to handle potential errors
      let dataURL;
      try {
        // Force a render before generating the data URL
        canvas.renderAll();
        
        dataURL = canvas.toDataURL({
          format: "png",
          multiplier: 3, // Lower multiplier for better performance
          quality: 1,
        });
      } catch (e) {
        console.error("Error generating dataURL:", e);
        return '';
      }
      
      // Display the image preview to the user
      const resultPreview = document.getElementById('result-preview');
      if (resultPreview) {
        // Create a new Image object to verify the data URL is valid
        const img = new Image();
        img.onload = () => {
          // Image loaded successfully, update the preview
          resultPreview.src = dataURL;
          resultPreview.style.display = 'block';
          console.log("Preview updated successfully");
        };
        
        img.onerror = () => {
          console.error("Generated image data is invalid");
          // Try again with a fallback with simpler options
          setTimeout(() => {
            if (canvas && canvas.lowerCanvasEl) {
              try {
                canvas.renderAll();
                const fallbackURL = canvas.toDataURL({
                  format: "png",
                  multiplier: 1
                });
                resultPreview.src = fallbackURL;
                console.log("Used fallback preview generation");
              } catch (e) {
                console.error("Fallback preview generation failed:", e);
              }
            }
          }, 800);
        };
        
        // Set source to load the image
        img.src = dataURL;
      } else {
        console.error("Cannot find preview element with ID 'result-preview'");
      }
      return dataURL;
    } catch (error) {
      console.error("Error in updatePreviewImage:", error);
      return '';
    }
  };

  const handleCanvasClear = () => {
    try {
      // First clear all objects on the current canvas
      if (canvas) {
        // Save the canvas dimensions before clearing
        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();
        
        // Clear all objects
        canvas.clear();
        
        // Reset the background color
        canvas.setBackgroundColor("#000", canvas.renderAll.bind(canvas));
        
        // Reset all state variables for stickers
        setHeadwear(null);
        setEyewear(null);
        setMouth(null);
        setKimono(null);
        setJewelry(null);
        setAccessories(null);
        setBackgroundImage(null);
        
        // Add main cat image with proper callback
        fabric.Image.fromURL(main_cat, (img) => {
          if (!img) {
            console.error("Failed to load main image in reset");
            return;
          }
          
          img.scaleToWidth(canvasWidth);
          img.scaleToHeight(img.height * (canvasWidth / img.width));
          img.set({
            selectable: false,
            evented: false,
            lockMovementX: true,
            lockMovementY: true,
            lockScalingX: true,
            lockScalingY: true,
            lockRotation: true,
            hasBorders: false,
            hasControls: false
          });
          
          canvas.add(img);
          canvas.renderAll();
          
          console.log("Canvas reset completed successfully");
          
          // Update the preview after a delay to ensure canvas renders
          setTimeout(() => {
            console.log("Updating preview after reset");
            saveImageToDataURL();
          }, 1000);
        }, { crossOrigin: 'anonymous' });
      } else {
        // If canvas doesn't exist, initialize it
        console.log("Canvas not available during reset, initializing new canvas");
        initializeCanvas();
      }
    } catch (error) {
      console.error("Error during canvas clear:", error);
      // Try to recover by reinitializing
      fabricInitialized.current = false;
      setTimeout(() => initializeCanvas(), 1000);
    }
  };

  const handleDelete = () => {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects && activeObjects.length > 0) {
      activeObjects.forEach((object) => {
        if (object.selectable) {
          canvas.remove(object);
        }
      });
      canvas.discardActiveObject().renderAll();
      
      // Update the preview after deletion
      setTimeout(() => {
        saveImageToDataURL();
      }, 100);
    }
  };

  const handleAddText = () => {
    const text = prompt("Input text to add:");

    if (text) {
      const newText = new fabric.Text(text, {
        fontFamily: "'Finger Paint', cursive",
        fontSize: 20,
        fill: "#fff",
        stroke: "#0A1F3F", // Updated to darker blue
        fontWeight: "bold",
        left: 100,
        top: 100,
        charSpacing: 1,
      });

      canvas.add(newText);
      
      // Update the preview
      setTimeout(() => {
        saveImageToDataURL();
      }, 100);
    }
  };

  return (
    <div className="min-h-screen overflow-y-auto night-sky-bg" style={{ 
      backgroundImage: `url('/lovable-uploads/be971682-1466-471f-96a4-78b21fb504ff.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Top Logo */}
      <div
        onClick={() => window.open("https://fantomsonic.com/", "_blank")}
        className="flex cursor-pointer absolute top-5 left-10 mb-16"
      >
        <img 
          src="/lovable-uploads/d3db5656-828a-47f4-b0b4-888cde78af09.png" 
          alt="Logo" 
          className="h-10 w-10" 
        />
      </div>

      <div className="w-full flex py-10 pt-20 flex-col lg:flex-row justify-center">
        <input
          type="file"
          accept="image/*"
          hidden
          ref={bgImgInputRef}
          onChange={handleBackgroundImageChange}
        />

        <input
          type="file"
          accept="image/*"
          hidden
          ref={stickerImgInputRef}
          onChange={handleAddSticker}
        />
        <div className="flex-1 px-5">
          <div className="flex item-center justify-center gap-5 md:gap-10 mb-10">
            <img
              src="/lovable-uploads/13dd479a-7c88-43de-94c7-701c74fae6c8.png"
              className="w-full max-w-[400px] h-auto mx-auto lg:mt-0"
              alt="FANTOM PFP GENERATOR"
              style={{ margin: '0 auto' }}
            />
          </div>

          {/* Mobile layout - Preview first, then stickers */}
          {isMobile && (
            <>
              {/* Canvas Preview */}
              <div
                className="mx-auto mb-7 bg-transparent rounded-xl relative canvas-mobile"
              >
                <canvas ref={canvasRef} />
                {selectedObject && (
                  <img
                    onClick={handleDelete}
                    id="selected-img"
                    style={{
                      position: "absolute",
                      top: selectedObject.top - 30,
                      left: selectedObject.left,
                      cursor: "pointer",
                    }}
                    src="https://cdn-icons-png.flaticon.com/512/5610/5610967.png"
                    width={20}
                    height={20}
                    alt=""
                  />
                )}
              </div>
              
              {/* Stickers */}
              <div className="mb-8">
                <ImageScroller
                  canvas={canvas}
                  categorizedImages={stickers}
                  handleAddImage={handleAddImage}
                  changeBackgroundImage={changeBackgroundImage}
                  hats={headwear}
                  kimonos={kimono}
                  weapons={accessories}
                  setHats={setHeadwear}
                  setKimonos={setKimono}
                  setWeapons={setAccessories}
                />
              </div>
            </>
          )}

          {/* Desktop layout - Canvas Preview */}
          {!isMobile && (
            <div
              className="mx-auto mb-7 bg-transparent rounded-xl relative w-[400px]"
            >
              <canvas ref={canvasRef} />
              {selectedObject && (
                <img
                  onClick={handleDelete}
                  id="selected-img"
                  style={{
                    position: "absolute",
                    top: selectedObject.top - 30,
                    left: selectedObject.left,
                    cursor: "pointer",
                  }}
                  src="https://cdn-icons-png.flaticon.com/512/5610/5610967.png"
                  width={20}
                  height={20}
                  alt=""
                />
              )}
            </div>
          )}
          
          {/* Control buttons - displayed after stickers on mobile */}
          <div className="flex flex-wrap w-full gap-5 justify-center">
            <div
              onClick={() => stickerImgInputRef.current.click()}
              className="border-2 cursor-pointer border-white bg-[#0A1F3F] text-white px-5 py-2 rounded-lg flex justify-center items-center overflow-hidden relative group transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-full md:w-1/3 lg:w-1/3"
            >
              <p className="text-white text-center text-lg tracking-wider relative" style={{ fontFamily: "'Finger Paint', cursive" }}>
                UPLOAD
              </p>
              <div className="absolute top-0 left-0 w-full h-full bg-black opacity-0 z-0 transition duration-300 ease-in-out group-hover:opacity-50"></div>
            </div>
            <div
              onClick={() => bgImgInputRef.current.click()}
              className="border-2 cursor-pointer border-white bg-[#0A1F3F] text-white px-5 py-2 rounded-lg flex justify-center items-center overflow-hidden relative group transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-full md:w-1/3 lg:w-1/3"
            >
              <p className="text-white text-center text-lg tracking-wider relative" style={{ fontFamily: "'Finger Paint', cursive" }}>
                BG
              </p>
              <div className="absolute top-0 left-0 w-full h-full bg-black opacity-0 z-0 transition duration-300 ease-in-out group-hover:opacity-50"></div>
            </div>
            <div
              onClick={handleAddText}
              className="border-2 cursor-pointer border-white bg-[#0A1F3F] text-white px-5 py-2 rounded-lg flex justify-center items-center overflow-hidden relative group transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-full md:w-1/3 lg:w-1/3"
            >
              <p className="text-white text-center text-lg tracking-wider relative" style={{ fontFamily: "'Finger Paint', cursive" }}>
                TEXT
              </p>
              <div className="absolute top-0 left-0 w-full h-full bg-black opacity-0 z-0 transition duration-300 ease-in-out group-hover:opacity-50"></div>
            </div>
            <div
              onClick={handleCanvasClear}
              className="border-2 cursor-pointer border-white bg-[#0A1F3F] text-white px-5 py-2 rounded-lg flex justify-center items-center overflow-hidden relative group transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-full md:w-1/3 lg:w-1/3"
            >
              <p className="text-white text-center text-lg tracking-wider relative" style={{ fontFamily: "'Finger Paint', cursive" }}>
                RESET
              </p>
              <div className="absolute top-0 left-0 w-full h-full bg-black opacity-0 z-0 transition duration-300 ease-in-out group-hover:opacity-50"></div>
            </div>
            <div
              onClick={generateRandom}
              className="border-2 cursor-pointer border-white bg-[#0c46af] text-white px-5 py-2 rounded-lg flex justify-center items-center overflow-hidden relative group transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-full md:w-1/3 lg:w-1/3"
            >
              <p className="text-white text-center text-lg tracking-wider relative" style={{ fontFamily: "'Finger Paint', cursive" }}>
                RANDOM
              </p>
              <div className="absolute top-0 left-0 w-full h-full bg-black opacity-0 z-0 transition duration-300 ease-in-out group-hover:opacity-50"></div>
            </div>
            <div
              onClick={saveImageToLocal}
              className="border-2 cursor-pointer border-white bg-[#0c46af] text-white px-5 py-2 rounded-lg flex justify-center items-center overflow-hidden relative group transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-full md:w-1/3 lg:w-1/3"
            >
              <p className="text-white text-center text-lg tracking-wider relative" style={{ fontFamily: "'Finger Paint', cursive" }}>
                SAVE
              </p>
              <div className="absolute top-0 left-0 w-full h-full bg-black opacity-0 z-0 transition duration-300 ease-in-out group-hover:opacity-50"></div>
            </div>
          </div>
          
          {/* Result Preview Container - After upload buttons on mobile */}
          <div className="mt-10 flex flex-col items-center justify-center">
            <div className="border-4 border-[#0c46af] p-2 rounded-lg bg-black/50">
              <div className="preview-container relative" style={{ width: '300px', height: '300px', backgroundColor: 'rgba(1, 10, 30, 0.4)' }}>
                {/* Fallback message if preview fails */}
                <div className="absolute inset-0 flex items-center justify-center text-white opacity-50 z-0">
                  <p className="text-center" style={{ fontFamily: "'Finger Paint', cursive" }}>
                    Preview will appear here
                  </p>
                </div>
                
                {/* The actual preview image */}
                <img 
                  id="result-preview" 
                  alt="Result Preview" 
                  className="z-10 max-w-[300px] max-h-[300px] object-contain w-full h-full"
                  style={{
                    display: 'block', 
                    margin: '0 auto',
                    backgroundColor: 'transparent'
                  }}
                  onError={(e) => {
                    console.log("Preview image loading error:", e);
                    e.target.style.display = 'none'; // Hide broken image
                    // Try updating the preview again after a delay
                    setTimeout(() => saveImageToDataURL(), 1000);
                  }}
                  onLoad={(e) => {
                    console.log("Preview image loaded successfully");
                    e.target.style.display = 'block';
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Desktop layout - Show stickers on side aligned with preview */}
        {!isMobile && (
          <div className="w-full lg:w-[60%] px-5 lg:pl-0">
            <div className="flex-1">
              <ImageScroller
                canvas={canvas}
                categorizedImages={stickers}
                handleAddImage={handleAddImage}
                changeBackgroundImage={changeBackgroundImage}
                hats={headwear}
                kimonos={kimono}
                weapons={accessories}
                setHats={setHeadwear}
                setKimonos={setKimono}
                setWeapons={setAccessories}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Footer logo for navigation */}
      <div className="w-full flex justify-center py-6 mt-8">
        <img 
          onClick={() => window.open("https://fantomsonic.com/", "_blank")}
          src="/lovable-uploads/d3db5656-828a-47f4-b0b4-888cde78af09.png" 
          alt="Logo" 
          className="h-12 w-12 cursor-pointer" 
        />
      </div>
    </div>
  );
}

export default App;
