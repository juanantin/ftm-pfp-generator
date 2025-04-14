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
  // Track which categories have active stickers for deletion
  const [activeCategories, setActiveCategories] = useState({
    headwear: false,
    eyewear: false,
    mouth: false,
    kimono: false,
    jewelry: false,
    accessories: false
  });

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
    // Store current objects
    const currentObjects = canvas.getObjects();
    
    // Find the main cat image specifically (the base character)
    const mainCatImage = currentObjects.find(obj => 
      obj.selectable === false && 
      (!obj._element || !obj._element.src || !obj._element.src.includes("stickers"))
    );
    
    // Store main cat position and scale if it exists
    let mainCatProps = null;
    const isMobileView = window.innerWidth <= 768;
    
    if (mainCatImage) {
      mainCatProps = {
        scaleX: mainCatImage.scaleX,
        scaleY: mainCatImage.scaleY,
        left: mainCatImage.left,
        top: mainCatImage.top,
        originX: mainCatImage.originX || 'center',
        originY: mainCatImage.originY || 'bottom'
      };
      
      // On mobile, ensure we're using consistent scaling and positioning
      if (isMobileView) {
        // Save reference to initial canvas dimensions
        mainCatProps.originalCanvasWidth = canvas.width;
        mainCatProps.originalCanvasHeight = canvas.height;
      }
      
      console.log("Stored main cat properties before background change", mainCatProps);
    }
    
    fabric.Image.fromURL(backgroundImage, (img) => {
      // Calculate the new dimensions respecting the maximum width
      let newWidth = img.width;
      let newHeight = img.height;

      let maxWidth = isMobile ? 470 : 400;

      if (img.width > maxWidth) {
        newWidth = maxWidth;
        newHeight = (maxWidth / img.width) * img.height;
      }

      // Store current canvas width and height
      const oldWidth = canvas.width;
      const oldHeight = canvas.height;

      // Keep canvas dimensions consistent to avoid scaling issues on mobile
      const canvasWidth = isMobile ? 290 : 400;
      const canvasHeight = isMobile ? 290 : 400;
      
      // Update canvas dimensions - use consistent dimensions
      canvas.setWidth(canvasWidth);
      canvas.setHeight(canvasHeight);

      // Set the background image
      canvas.setBackgroundImage(
        backgroundImage,
        canvas.renderAll.bind(canvas),
        {
          scaleX: canvas.width / img.width,
          scaleY: canvas.height / img.height,
        }
      );
      
      // If main character was found, restore its properties
      if (mainCatProps) {
        // Wait for background to load, then restore main cat position and scale
        setTimeout(() => {
          const objects = canvas.getObjects();
          // Find the main cat by checking if it's non-selectable and not a sticker
          const mainCat = objects.find(obj => 
            obj.selectable === false && 
            (!obj._element || !obj._element.src || !obj._element.src.includes("stickers"))
          );
          
          if (mainCat) {
            console.log("Restoring main cat properties after background change");
            
            const isMobileView = window.innerWidth <= 768;
            
            // On mobile, we need to be more careful with the restoration
            if (isMobileView) {
              // If canvas dimensions changed, adjust accordingly
              const scaleRatioX = canvas.width / (mainCatProps.originalCanvasWidth || canvas.width);
              const scaleRatioY = canvas.height / (mainCatProps.originalCanvasHeight || canvas.height);
              
              // Apply stored properties but maintain consistent scaling for mobile
              // Use a lower scale factor to make the character smaller
              const mobileScaleFactor = 0.8; // Reduced from 1.2 to 0.8 for smaller character
              
              mainCat.set({
                scaleX: mainCatProps.originalCanvasWidth ? (canvas.width / mainCatProps.originalCanvasWidth) * mainCatProps.scaleX * mobileScaleFactor : mainCatProps.scaleX * mobileScaleFactor,
                scaleY: mainCatProps.originalCanvasHeight ? (canvas.height / mainCatProps.originalCanvasHeight) * mainCatProps.scaleY * mobileScaleFactor : mainCatProps.scaleY * mobileScaleFactor,
                left: canvas.width / 2, // Center horizontally
                // Ensure it stays aligned with bottom with consistent positioning
                top: canvas.height - (mainCat.height * mainCat.scaleY * 0.65), // Match positioning from addMainImg
                originX: 'center',
                originY: 'bottom'
              });
            } else {
              // For desktop, also apply the smaller scale
              const desktopScaleFactor = 0.8; // Reduced for smaller character on desktop too
              mainCat.set({
                scaleX: mainCatProps.scaleX * desktopScaleFactor,
                scaleY: mainCatProps.scaleY * desktopScaleFactor,
                left: mainCatProps.left,
                top: mainCatProps.top,
                originX: mainCatProps.originX,
                originY: mainCatProps.originY
              });
            }
            
            canvas.renderAll();
            console.log("Main cat properties restored successfully");
          } else {
            console.log("Main cat not found after background change, re-adding it");
            addMainImg(canvas, main_cat);
          }
          
          // Update preview after adjustments
          setTimeout(() => {
            saveImageToDataURL();
          }, 300);
        }, 200);
      } else {
        // If main cat wasn't found, make sure to add it
        addMainImg(canvas, main_cat);
        
        // Update preview after adding main cat
        setTimeout(() => {
          saveImageToDataURL();
        }, 500);
      }
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
          width: window.innerWidth <= 768 ? 290 : 400,
          height: window.innerWidth <= 768 ? 290 : 400, // Reduced for a 1:1 aspect ratio on mobile
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
            const canvasHeight = newCanvas.getHeight();
            const isMobileView = window.innerWidth <= 768;
            
            if (isMobileView) {
              // For mobile: Make image more appropriately sized for smaller canvas
              // Reduced scale factor to make character smaller
              const mobileScaleFactor = 0.8; // Further reduced from 1.2 to 0.8 for smaller character
              img.scaleToWidth(canvasWidth * mobileScaleFactor);
              
              // Position the image to be fully aligned with the bottom of the canvas
              img.set({
                top: canvasHeight, // Align completely with bottom
                left: canvasWidth / 2,
                originX: 'center',
                originY: 'bottom',
              });
            } else {
              // Desktop scaling - also make character smaller
              const desktopScaleFactor = 0.8; // Added scale factor for desktop too
              img.scaleToWidth(canvasWidth * desktopScaleFactor);
              img.scaleToHeight(img.height * (canvasWidth / img.width) * desktopScaleFactor);
            }
            
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
        const canvasHeight = canvas.getHeight();
        const isMobileView = window.innerWidth <= 768;

        // Scale base image differently on mobile vs desktop
        if (isMobileView) {
          // For mobile: Make image smaller for better visibility
          // Reduced scale factor
          const mobileScaleFactor = 0.8; // Reduced from 1.2 to 0.8 for smaller character
          img.scaleToWidth(canvasWidth * mobileScaleFactor);
          
          // Position the image at bottom of canvas
          img.set({
            top: canvasHeight - (img.height * img.scaleY * 0.65), // Adjusted to show more of character
            left: canvasWidth / 2,
            originX: 'center',
            originY: 'bottom',
          });
        } else {
          // Desktop scaling - also make character smaller
          const desktopScaleFactor = 0.8; // Added scale factor for desktop
          img.scaleToWidth(canvasWidth * desktopScaleFactor);
          img.scaleToHeight(img.height * (canvasWidth / img.width) * desktopScaleFactor);
        }
        
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

  const handleAddImage = (state, setState, image, category) => {
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
        const scaleFactor = 3.2; // Increased scale factor to make stickers slightly bigger
        
        // Scale stickers based on category for better alignment with reference image
        let updatedScaleFactor = 3.0; // Base scale factor
        const imagePath = image.toLowerCase();
        
        // Adjust scale factor based on sticker type
        if (imagePath.includes("headwear")) {
          updatedScaleFactor = 2.8; // Slightly smaller for headwear
        } else if (imagePath.includes("mouth")) {
          updatedScaleFactor = 2.0; // Smaller for mouth elements
        } else if (imagePath.includes("eyewear")) {
          updatedScaleFactor = 2.5; // Adjusted for eyewear
        } else if (imagePath.includes("accessories")) {
          updatedScaleFactor = 3.2; // Larger for accessories
        } else {
          updatedScaleFactor = 3.0; // Default size
        }
        
        img.scale(updatedScaleFactor);
        
        // Determine which type of sticker this is and apply precise offsets
        let yOffset = 0;
        let xOffset = 0;
        
        // Check if we're in mobile view
        const isMobileView = window.innerWidth <= 768;
        
        if (imagePath.includes("headwear")) {
          // Position headwear based on reference image
          yOffset = isMobileView ? -15 : -10; // Higher on mobile
          xOffset = isMobileView ? -7 : 0; // Moved 7 pixels left on mobile, centered on desktop
        } else if (imagePath.includes("kimono") || imagePath.includes("clothing")) {
          // Position clothing based on reference image
          yOffset = isMobileView ? 15 : 20; // Adjusted for pixel art alignment
        } else if (imagePath.includes("accessories")) {
          // Position accessories based on reference image
          yOffset = isMobileView ? 40 : 25; // Lower on mobile to match reference
          xOffset = isMobileView ? 30 : 0; // Offset to right on mobile (like microphone in reference)
        } else if (imagePath.includes("mouth")) {
          // Position mouth based on reference image - adjusted as requested
          yOffset = isMobileView ? -1 : 4; // Moved 4 pixels down from previous position
          xOffset = 0; // Centered horizontally
        } else if (imagePath.includes("eyewear")) {
          // Position eyewear based on reference image
          yOffset = isMobileView ? 0 : 5; // Aligned with eyes in pixel art
          xOffset = 0; // Centered horizontally
        }
        
        // Center the sticker on the canvas with offset
        img.set({
          left: (canvasWidth / 2) + xOffset,
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
          // Update active categories for deletion
          if (category) {
            setActiveCategories(prev => ({
              ...prev,
              [category]: true
            }));
          }
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

  const handleRemoveCategory = (category) => {
    // Remove the sticker from the specific category
    switch(category) {
      case 'headwear':
        if (headwear) {
          canvas.remove(headwear);
          setHeadwear(null);
        }
        break;
      case 'eyewear':
        if (eyewear) {
          canvas.remove(eyewear);
          setEyewear(null);
        }
        break;
      case 'mouth':
        if (mouth) {
          canvas.remove(mouth);
          setMouth(null);
        }
        break;
      case 'kimono':
        if (kimono) {
          canvas.remove(kimono);
          setKimono(null);
        }
        break;
      case 'jewelry':
        if (jewelry) {
          canvas.remove(jewelry);
          setJewelry(null);
        }
        break;
      case 'accessories':
        if (accessories) {
          canvas.remove(accessories);
          setAccessories(null);
        }
        break;
      default:
        return;
    }
    
    // Update active categories
    setActiveCategories(prev => ({
      ...prev,
      [category]: false
    }));
    
    canvas.renderAll();
    
    // Update the preview after removing the sticker
    setTimeout(() => {
      saveImageToDataURL();
    }, 300);
  };

  const getRandomImage = (category) => {
    const categoryItems = stickers[category];
    if (!categoryItems || categoryItems.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * categoryItems.length);
    return categoryItems[randomIndex];
  };

  const generateRandom = () => {
    const randomHeadwear = getRandomImage("headwear");
    if (randomHeadwear) handleAddImage(headwear, setHeadwear, randomHeadwear, "headwear");

    const randomKimono = getRandomImage("kimono");
    if (randomKimono) handleAddImage(kimono, setKimono, randomKimono, "kimono");

    const randomAccessories = getRandomImage("accessories");
    if (randomAccessories)
      handleAddImage(accessories, setAccessories, randomAccessories, "accessories");

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
      
      // Force immediate rendering to ensure all elements are in the correct position
      canvas.renderAll();
      
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
      
      // Update the preview element (mobile only)
      const updatePreviewElement = (elementId) => {
        const previewElement = document.getElementById(elementId);
        if (previewElement) {
          // Create a new Image object to verify the data URL is valid
          const img = new Image();
          img.onload = () => {
            // Image loaded successfully, update the preview
            previewElement.src = dataURL;
            previewElement.style.display = 'block';
            console.log(`${elementId} updated successfully`);
          };
          
          img.onerror = () => {
            console.error(`Generated image data is invalid for ${elementId}`);
            // Try again with a fallback with simpler options
            setTimeout(() => {
              if (canvas && canvas.lowerCanvasEl) {
                try {
                  canvas.renderAll();
                  const fallbackURL = canvas.toDataURL({
                    format: "png",
                    multiplier: 1
                  });
                  previewElement.src = fallbackURL;
                  console.log(`Used fallback preview generation for ${elementId}`);
                } catch (e) {
                  console.error(`Fallback preview generation failed for ${elementId}:`, e);
                }
              }
            }, 800);
          };
          
          // Set source to load the image
          img.src = dataURL;
        } else {
          console.error(`Cannot find preview element with ID '${elementId}'`);
        }
      };
      
      // Update only the main mobile preview (removed duplicates)
      updatePreviewElement('mobile-preview');
      
      // Hidden element for compatibility with existing code
      const resultPreview = document.getElementById('result-preview');
      if (resultPreview) resultPreview.src = dataURL;
      
      return dataURL;
    } catch (error) {
      console.error("Error in updatePreviewImage:", error);
      return '';
    }
  };

  const handleCanvasClear = () => {
    if (!canvas) return;
    
    // Create a new canvas with the same dimensions and settings
    const newCanvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth <= 768 ? 290 : 400,
      height: window.innerWidth <= 768 ? 290 : 400,
      backgroundColor: "#000",
      preserveObjectStacking: true,
    });
    
    // Update canvas reference
    setCanvas(newCanvas);
    fabricInitialized.current = true;
    
    // Set up the event listeners again
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

    // Re-add the main cat image
    addMainImg(newCanvas, main_cat);
    
    // Reset state variables for all categories
    setHeadwear(null);
    setEyewear(null);
    setMouth(null);
    setKimono(null);
    setJewelry(null);
    setAccessories(null);
    
    // Reset active categories state
    setActiveCategories({
      headwear: false,
      eyewear: false,
      mouth: false,
      kimono: false,
      jewelry: false,
      accessories: false
    });
    
    // Update the preview after resetting
    setTimeout(() => {
      console.log("Updating preview after canvas clear");
      saveImageToDataURL();
    }, 800);
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
    }
  };

  const handleAddText = () => {
    const text = prompt("Enter your text:");

    if (text) {
      const newText = new fabric.Text(text, {
        fontFamily: "Tahoma",
        fontSize: 20,
        fill: "#fff",
        stroke: "#000",
        fontWeight: "bold",
        left: 100,
        top: 100,
        charSpacing: 1,
      });

      canvas.add(newText);
    }
  };

  return (
    <div className=" min-h-screen overflow-y-auto bg-gradient-to-r from-mainRed to-darkRed">
      {/* <img
        className="w-full h-full absolute top-0 left-0 opacity-[0.4] object-cover md:object-cover"
        src={isMobile ? all_bg_mobile : all_bg}
        alt=""
      /> */}

      <div
        onClick={() => (window.location.href = "https://catownkimono.com")}
        className="flex cursor-pointer absolute top-5 left-10"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
        >
          <path
            fill="#000"
            d="m6.921 12.5l5.793 5.792L12 19l-7-7l7-7l.714.708L6.92 11.5H19v1z"
          />
        </svg>
        <h1 className="text-3xl">Home</h1>
      </div>

      <div className="w-full flex py-10 flex-col lg:flex-row justify-center">
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
          <div className="flex item-center justify-center gap-5 md:gap-10 mb-5">
            {/* <img
              // onClick={() => window.open("https://madcatcoin.com/", "_blank")}
              src={logo}
              className="w-[100px] lg:w-[150px] h-auto cursor-pointer"
              alt=""
            /> */}
            <h1 className="text-white mt-5 lg:mt-0 text-5xl md:text-7xl text-center font-black ">
              Cok <br />
              Meme Generator
            </h1>
          </div>

          <div
            className={`mx-auto mb-7 bg-transparent rounded-xl relative
          ${isMobile ? "canvas-mobile" : "w-[400px]"}
          `}
          >
            <canvas
              ref={canvasRef}
              // style={{ width: "550px", height: "550px" }}
            />
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
          <div className="flex flex-wrap w-full gap-5 justify-center">
            <div
              onClick={() => stickerImgInputRef.current.click()}
              className="border-4 cursor-pointer border-black bg-white text-black px-5 py-2 rounded-lg flex justify-center items-center overflow-hidden relative group transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-full md:w-1/3 lg:w-1/3"
            >
              <p className="text-black text-center text-2xl tracking-wider font-medium relative">
                UPLOAD STICKER
              </p>
              <div className="absolute top-0 left-0 w-full h-full bg-black opacity-0 z-0 transition duration-300 ease-in-out group-hover:opacity-50"></div>
            </div>
            <div
              onClick={() => bgImgInputRef.current.click()}
              className="border-4 cursor-pointer border-black bg-white text-black px-5 py-2 rounded-lg flex justify-center items-center overflow-hidden relative group transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-full md:w-1/3 lg:w-1/3"
            >
              <p className="text-black text-center text-2xl tracking-wider font-medium relative">
                UPLOAD BACKGROUND
              </p>
              <div className="absolute top-0 left-0 w-full h-full bg-black opacity-0 z-0 transition duration-300 ease-in-out group-hover:opacity-50"></div>
            </div>
            <div
              onClick={handleAddText}
              className="border-4 cursor-pointer border-black bg-white text-black px-5 py-2 rounded-lg flex justify-center items-center overflow-hidden relative group transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-full md:w-1/3 lg:w-1/3"
            >
              <p className="text-black text-center text-2xl tracking-wider font-medium relative">
                ADD TEXT
              </p>
              <div className="absolute top-0 left-0 w-full h-full bg-black opacity-0 z-0 transition duration-300 ease-in-out group-hover:opacity-50"></div>
            </div>
            <div
              onClick={handleCanvasClear}
              className="border-4 cursor-pointer border-black bg-white text-black px-5 py-2 rounded-lg flex justify-center items-center overflow-hidden relative group transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-full md:w-1/3 lg:w-1/3"
            >
              <p className="text-black text-center text-2xl tracking-wider font-medium relative">
                RESET
              </p>
              <div className="absolute top-0 left-0 w-full h-full bg-black opacity-0 z-0 transition duration-300 ease-in-out group-hover:opacity-50"></div>
            </div>
            <div
              onClick={generateRandom}
              className="border-4 cursor-pointer border-black bg-white text-black px-5 py-2 rounded-lg flex justify-center items-center overflow-hidden relative group transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-full md:w-1/3 lg:w-1/3"
            >
              <p className="text-black text-center text-2xl tracking-wider font-medium relative">
                GENERATE RANDOM
              </p>
              <div className="absolute top-0 left-0 w-full h-full bg-black opacity-0 z-0 transition duration-300 ease-in-out group-hover:opacity-50"></div>
            </div>
            <div
              onClick={saveImageToLocal}
              className="border-4 cursor-pointer border-black bg-white text-black px-5 py-2 rounded-lg flex justify-center items-center overflow-hidden relative group transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-full md:w-1/3 lg:w-1/3"
            >
              <p className="text-black text-center text-2xl tracking-wider font-medium relative">
                SAVE MEME
              </p>
              <div className="absolute top-0 left-0 w-full h-full bg-black opacity-0 z-0 transition duration-300 ease-in-out group-hover:opacity-50"></div>
            </div>
          </div>

          {/* <div className="flex flex-wrap w-full mt-5 gap-5 justify-center">
            <div
              onClick={bringForward}
              // disabled={isAtFront}
              className="border-4 cursor-pointer border-black bg-white text-black px-5 py-2   rounded-lg flex justify-center items-center overflow-hidden relative group transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              <p className="text-black text-center text-2xl tracking-wider font-medium relative">
                BRING FORWARD
              </p>
              <div className="absolute top-0 left-0 w-full h-full bg-black opacity-0 z-0 transition duration-300 ease-in-out group-hover:opacity-50"></div>
            </div>
            <div
              onClick={bringToFront}
              // disabled={isAtFront}
              className="border-4 cursor-pointer border-black bg-white text-black px-5 py-2   rounded-lg flex justify-center items-center overflow-hidden relative group transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              <p className="text-black text-center text-2xl tracking-wider font-medium relative">
                BRING TO FRONT
              </p>
              <div className="absolute top-0 left-0 w-full h-full bg-black opacity-0 z-0 transition duration-300 ease-in-out group-hover:opacity-50"></div>
            </div>

            <div
              onClick={sendBackward}
              // disabled={isAtBack}
              className="border-4 cursor-pointer border-black bg-white text-black px-5 py-2   rounded-lg flex justify-center items-center overflow-hidden relative group transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              <p className="text-black text-center text-2xl tracking-wider font-medium relative">
                SEND BACKWARD
              </p>
              <div className="absolute top-0 left-0 w-full h-full bg-black opacity-0 z-0 transition duration-300 ease-in-out group-hover:opacity-50"></div>
            </div>
            <div
              onClick={sendToBack}
              // disabled={isAtBack}
              className="border-4 cursor-pointer border-black  bg-white text-black px-5 py-2 rounded-lg flex justify-center items-center overflow-hidden relative group transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              <p className="text-black text-center text-2xl tracking-wider font-medium relative">
                SEND TO BACK
              </p>
              <div className="absolute top-0 left-0 w-full h-full bg-black opacity-0 z-0 transition duration-300 ease-in-out group-hover:opacity-50"></div>
            </div>
          </div> */}
        </div>

        <div className="mt-5 w-full lg:w-[60%] px-5 lg:pl-0 ">
          <div className="flex-1">
            <h1 className="text-4xl text-center text-white mt-10">
              CLICK TO ADD STICKER
            </h1>
            <ImageScroller
              canvas={canvas}
              categorizedImages={stickers}
              handleAddImage={handleAddImage}
              changeBackgroundImage={changeBackgroundImage}
              hats={headwear}
              kimonos={kimono}
              weapons={accessories}
              eyewear={eyewear}
              mouth={mouth}
              setHats={setHeadwear}
              setKimonos={setKimono}
              setWeapons={setAccessories}
              setEyewear={setEyewear}
              setMouth={setMouth}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
