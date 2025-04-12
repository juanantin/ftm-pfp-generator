
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

      let maxWidth = isMobile ? 470 : 400;

      if (img.width > maxWidth) {
        newWidth = maxWidth;
        newHeight = (maxWidth / img.width) * img.height;
      }

      canvas.setWidth(newWidth);
      canvas.setHeight(isMobile ? 470 : 400);

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
          width: window.innerWidth <= 768 ? 470 : 400,
          height: window.innerWidth <= 768 ? 470 : 400,
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
        const scaleFactor = 3.2; // Increased scale factor to make stickers slightly bigger
        
        // Apply the scaling to make stickers slightly bigger (3.0 → 3.2)
        const updatedScaleFactor = 3.2;
        img.scale(updatedScaleFactor);
        
        // Determine which type of sticker this is and apply vertical offset
        let yOffset = 0;
        
        // Check the image path to determine the category
        const imagePath = image.toLowerCase();
        
        if (imagePath.includes("headwear")) {
          // Move headwear slightly up and to the right
          yOffset = -10; // Move up by 10px
          // We'll adjust the left position separately
        } else if (imagePath.includes("kimono") || imagePath.includes("clothing")) {
          // Move clothing down by 9 pixels as requested
          yOffset = 14; // Changed from 5 (up) to 14 (down: 5+9=14) 
        } else if (imagePath.includes("accessories")) {
          // Move accessories down slightly
          yOffset = 15;
        } else if (imagePath.includes("mouth")) {
          // Move mouth items slightly higher (was 5)
          yOffset = 5;
        } else if (imagePath.includes("eyewear")) {
          // Move eyewear down 9 pixels (changed from -8)
          yOffset = 1; // Changed from -8 to 1 (moved 9px down)
        }
        
        // Determine horizontal positioning (moving headwear to the right, adjusted 8px left)
        let xOffset = 0;
        if (imagePath.includes("headwear")) {
          xOffset = 7; // Move headwear to the right by 7px (reduced from 15px)
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
      
      // Update the mobile preview element only
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
      
      // Update all preview elements
      updatePreviewElement('mobile-preview');
      updatePreviewElement('bottom-mobile-preview');
      
      // Make sure both previews work for compatibility with any code that expects them
      const resultPreview = document.getElementById('result-preview');
      if (resultPreview) resultPreview.src = dataURL;
      
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
    // Create custom modal dialog for text input
    const existingModal = document.getElementById('text-input-modal');
    if (existingModal) {
      document.body.removeChild(existingModal);
    }
    
    // Create modal container
    const modal = document.createElement('div');
    modal.id = 'text-input-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '9999';
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = '#0A1F3F';
    modalContent.style.padding = '25px';
    modalContent.style.borderRadius = '10px';
    modalContent.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
    modalContent.style.width = '80%';
    modalContent.style.maxWidth = '400px';
    modalContent.style.textAlign = 'center';
    modalContent.style.border = '3px solid white';
    
    // Create heading
    const heading = document.createElement('h2');
    heading.innerText = 'ENTER TEXT TO ADD';
    heading.style.color = 'white';
    heading.style.marginBottom = '20px';
    heading.style.fontFamily = "'Finger Paint', cursive";
    heading.style.fontSize = '24px';
    
    // Create input field
    const input = document.createElement('input');
    input.type = 'text';
    input.style.width = '100%';
    input.style.padding = '10px';
    input.style.marginBottom = '20px';
    input.style.backgroundColor = 'white';
    input.style.color = '#0A1F3F';
    input.style.border = 'none';
    input.style.borderRadius = '5px';
    input.style.fontSize = '16px';
    
    // Create color picker section
    const colorSection = document.createElement('div');
    colorSection.style.marginBottom = '20px';
    
    const colorLabel = document.createElement('p');
    colorLabel.innerText = 'SELECT COLOR:';
    colorLabel.style.color = 'white';
    colorLabel.style.marginBottom = '10px';
    colorLabel.style.fontFamily = "'Finger Paint', cursive";
    colorLabel.style.fontSize = '16px';
    
    // Color options container
    const colorOptions = document.createElement('div');
    colorOptions.style.display = 'flex';
    colorOptions.style.flexWrap = 'wrap';
    colorOptions.style.justifyContent = 'center';
    colorOptions.style.gap = '10px';
    
    // Define color choices
    const colors = [
      { name: 'White', value: '#FFFFFF' },
      { name: 'Red', value: '#FF0000' },
      { name: 'Blue', value: '#0000FF' },
      { name: 'Green', value: '#00FF00' },
      { name: 'Yellow', value: '#FFFF00' },
      { name: 'Purple', value: '#800080' },
      { name: 'Orange', value: '#FFA500' },
      { name: 'Pink', value: '#FFC0CB' }
    ];
    
    let selectedColor = '#FFFFFF'; // Default color: white
    
    // Create color buttons
    colors.forEach(color => {
      const colorButton = document.createElement('div');
      colorButton.style.width = '30px';
      colorButton.style.height = '30px';
      colorButton.style.backgroundColor = color.value;
      colorButton.style.borderRadius = '50%';
      colorButton.style.cursor = 'pointer';
      colorButton.style.border = '2px solid #FFFFFF';
      colorButton.title = color.name;
      
      // Selection indicator
      colorButton.addEventListener('click', () => {
        // Remove selection border from all color buttons
        colorOptions.querySelectorAll('div').forEach(btn => {
          btn.style.border = '2px solid #FFFFFF';
        });
        
        // Add selection border to selected color
        colorButton.style.border = '2px solid #00FFFF';
        selectedColor = color.value;
      });
      
      colorOptions.appendChild(colorButton);
    });
    
    // Create buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.justifyContent = 'space-between';
    
    // Create Add button
    const addButton = document.createElement('button');
    addButton.innerText = 'ADD';
    addButton.style.backgroundColor = '#0c46af';
    addButton.style.color = 'white';
    addButton.style.border = '2px solid white';
    addButton.style.padding = '10px 20px';
    addButton.style.borderRadius = '5px';
    addButton.style.cursor = 'pointer';
    addButton.style.fontFamily = "'Finger Paint', cursive";
    addButton.style.fontSize = '16px';
    addButton.style.width = '48%';
    
    // Create Cancel button
    const cancelButton = document.createElement('button');
    cancelButton.innerText = 'CANCEL';
    cancelButton.style.backgroundColor = 'transparent';
    cancelButton.style.color = 'white';
    cancelButton.style.border = '2px solid white';
    cancelButton.style.padding = '10px 20px';
    cancelButton.style.borderRadius = '5px';
    cancelButton.style.cursor = 'pointer';
    cancelButton.style.fontFamily = "'Finger Paint', cursive";
    cancelButton.style.fontSize = '16px';
    cancelButton.style.width = '48%';
    
    // Add event listeners
    addButton.addEventListener('click', () => {
      const text = input.value;
      if (text) {
        const newText = new fabric.Text(text.toUpperCase(), {
          fontFamily: "'Finger Paint', cursive",
          fontSize: 20,
          fill: selectedColor,
          stroke: "",
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
      document.body.removeChild(modal);
    });
    
    cancelButton.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    // Build modal
    buttonsContainer.appendChild(addButton);
    buttonsContainer.appendChild(cancelButton);
    
    // Assemble the modal content
    modalContent.appendChild(heading);
    modalContent.appendChild(input);
    
    // Add the color section
    colorSection.appendChild(colorLabel);
    colorSection.appendChild(colorOptions);
    modalContent.appendChild(colorSection);
    
    modalContent.appendChild(buttonsContainer);
    modal.appendChild(modalContent);
    
    // Add to document and focus input
    document.body.appendChild(modal);
    input.focus();
    
    // Allow closing by clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
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

      <div className="w-full flex py-6 pt-20 flex-col lg:flex-row justify-center">
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
          <div className="flex item-center justify-center gap-5 md:gap-10 mb-3">
            <img
              src="/lovable-uploads/13dd479a-7c88-43de-94c7-701c74fae6c8.png"
              className="w-full max-w-[400px] h-auto mx-auto lg:mt-0"
              alt="FANTOM PFP GENERATOR"
              style={{ margin: '0 auto' }}
            />
          </div>

          {/* Mobile layout - Preview right after title */}
          {isMobile && (
            <>
              {/* Mobile Preview directly after title - With balanced spacing */}
              <div className="mt-0 mb-3 flex flex-col items-center justify-center">
                <div className="p-1 rounded-2xl bg-black/50 w-[95%] max-w-[470px]">
                  <div className="preview-container relative rounded-xl" style={{ width: '100%', height: '240px', backgroundColor: 'rgba(1, 10, 30, 0.4)' }}>
                    {/* Fallback message if preview fails */}
                    <div className="absolute inset-0 flex items-center justify-center text-white opacity-50 z-0">
                      <p className="text-center" style={{ fontFamily: "'Finger Paint', cursive" }}>
                        Preview
                      </p>
                    </div>
                    
                    {/* Mobile top preview image - Made larger */}
                    <img 
                      id="mobile-preview" 
                      alt="Mobile Preview" 
                      className="z-10 object-contain w-full h-full"
                      style={{
                        display: 'block', 
                        margin: '0 auto',
                        backgroundColor: 'transparent',
                        objectFit: 'contain' 
                      }}
                      onError={(e) => {
                        console.log("Mobile preview image loading error");
                        e.target.style.display = 'none'; // Hide broken image
                      }}
                      onLoad={(e) => {
                        console.log("Mobile preview image loaded successfully");
                        e.target.style.display = 'block';
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Canvas Preview - hidden completely */}
              <div
                className="mx-auto mb-0 bg-transparent rounded-xl relative canvas-mobile"
                style={{ height: 0, overflow: 'hidden', display: 'none' }}
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
                    width={12}
                    height={12}
                    alt=""
                  />
                )}
              </div>
              
              {/* Mobile control buttons - Adjusted spacing and smaller text */}
              <div className="flex flex-wrap w-full gap-3 justify-center mt-0 mb-3 pt-0">
                <div
                  onClick={() => stickerImgInputRef.current.click()}
                  className="border-1 cursor-pointer border-white bg-[#0A1F3F] text-white px-2 py-1 rounded-lg flex justify-center items-center overflow-hidden relative group transition-all duration-300 ease-in-out transform hover:scale-105 w-[30%]"
                >
                  <p className="text-white text-center text-xs tracking-wider relative" style={{ fontFamily: "'Finger Paint', cursive" }}>
                    UPLOAD ELEMENT
                  </p>
                </div>
                <div
                  onClick={() => bgImgInputRef.current.click()}
                  className="border-1 cursor-pointer border-white bg-[#0A1F3F] text-white px-2 py-1 rounded-lg flex justify-center items-center overflow-hidden relative group transition-all duration-300 ease-in-out transform hover:scale-105 w-[30%]"
                >
                  <p className="text-white text-center text-xs tracking-wider relative" style={{ fontFamily: "'Finger Paint', cursive" }}>
                    UPLOAD BG
                  </p>
                </div>
                <div
                  onClick={handleAddText}
                  className="border-1 cursor-pointer border-white bg-[#0A1F3F] text-white px-2 py-1 rounded-lg flex justify-center items-center overflow-hidden relative group transition-all duration-300 ease-in-out transform hover:scale-105 w-[30%]"
                >
                  <p className="text-white text-center text-xs tracking-wider relative" style={{ fontFamily: "'Finger Paint', cursive" }}>
                    ADD TEXT
                  </p>
                </div>
                <div
                  onClick={handleCanvasClear}
                  className="border-1 cursor-pointer border-white bg-[#0A1F3F] text-white px-2 py-1 rounded-lg flex justify-center items-center overflow-hidden relative group transition-all duration-300 ease-in-out transform hover:scale-105 w-[30%]"
                >
                  <p className="text-white text-center text-xs tracking-wider relative" style={{ fontFamily: "'Finger Paint', cursive" }}>
                    RESET
                  </p>
                </div>
                <div
                  onClick={generateRandom}
                  className="border-1 cursor-pointer border-white bg-[#0c46af] text-white px-2 py-1 rounded-lg flex justify-center items-center overflow-hidden relative group transition-all duration-300 ease-in-out transform hover:scale-105 w-[30%]"
                >
                  <p className="text-white text-center text-xs tracking-wider relative" style={{ fontFamily: "'Finger Paint', cursive" }}>
                    RANDOM
                  </p>
                </div>
                <div
                  onClick={saveImageToLocal}
                  className="border-1 cursor-pointer border-white bg-[#0c46af] text-white px-2 py-1 rounded-lg flex justify-center items-center overflow-hidden relative group transition-all duration-300 ease-in-out transform hover:scale-105 w-[30%]"
                >
                  <p className="text-white text-center text-xs tracking-wider relative" style={{ fontFamily: "'Finger Paint', cursive" }}>
                    DOWNLOAD
                  </p>
                </div>
              </div>
              
              {/* Stickers section with zero spacing */}
              <div className="mb-0 mt-0">
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
              className="mx-auto mb-7 bg-transparent rounded-2xl relative w-[400px]"
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
          
          {/* Control buttons - shown only on desktop */}
          {!isMobile && (
            <div className="flex flex-wrap w-full gap-5 justify-center">
              <div
                onClick={() => stickerImgInputRef.current.click()}
                className="border-2 cursor-pointer border-white bg-[#0A1F3F] text-white px-5 py-2 rounded-lg flex justify-center items-center overflow-hidden relative group transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-full md:w-1/3 lg:w-1/3"
              >
                <p className="text-white text-center text-lg tracking-wider relative" style={{ fontFamily: "'Finger Paint', cursive" }}>
                  UPLOAD ELEMENT
                </p>
                <div className="absolute top-0 left-0 w-full h-full bg-black opacity-0 z-0 transition duration-300 ease-in-out group-hover:opacity-50"></div>
              </div>
              <div
                onClick={() => bgImgInputRef.current.click()}
                className="border-2 cursor-pointer border-white bg-[#0A1F3F] text-white px-5 py-2 rounded-lg flex justify-center items-center overflow-hidden relative group transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-full md:w-1/3 lg:w-1/3"
              >
                <p className="text-white text-center text-lg tracking-wider relative" style={{ fontFamily: "'Finger Paint', cursive" }}>
                  UPLOAD BG
                </p>
                <div className="absolute top-0 left-0 w-full h-full bg-black opacity-0 z-0 transition duration-300 ease-in-out group-hover:opacity-50"></div>
              </div>
              <div
                onClick={handleAddText}
                className="border-2 cursor-pointer border-white bg-[#0A1F3F] text-white px-5 py-2 rounded-lg flex justify-center items-center overflow-hidden relative group transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-full md:w-1/3 lg:w-1/3"
              >
                <p className="text-white text-center text-lg tracking-wider relative" style={{ fontFamily: "'Finger Paint', cursive" }}>
                  ADD TEXT
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
                  DOWNLOAD
                </p>
                <div className="absolute top-0 left-0 w-full h-full bg-black opacity-0 z-0 transition duration-300 ease-in-out group-hover:opacity-50"></div>
              </div>
            </div>
          )}
          
          {/* Hidden element for compatibility with existing code */}
          <div style={{ display: 'none' }}>
            <img id="result-preview" alt="Hidden Preview" />
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
      
      {/* Mobile bottom preview over the footer logo - with minimal frame */}
      {isMobile && (
        <div className="w-full relative mt-0 mb-0">
          {/* Bottom preview container - almost no border, maximum image size */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="p-[1px] rounded-2xl bg-black/20 w-[95%] max-w-[350px]">
              <div className="preview-container relative rounded-xl" style={{ width: '100%', height: '120px', backgroundColor: 'transparent' }}>
                {/* Bottom preview image - maximized to fill frame */}
                <img 
                  id="bottom-mobile-preview" 
                  alt="Bottom Preview" 
                  className="z-10 object-contain w-full h-full rounded-xl"
                  style={{
                    display: 'block', 
                    margin: '0 auto',
                    backgroundColor: 'transparent'
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Footer logo for navigation - reduced spacing */}
          <div className="w-full flex justify-center py-2 mt-3">
            <img 
              onClick={() => window.open("https://fantomsonic.com/", "_blank")}
              src="/lovable-uploads/d3db5656-828a-47f4-b0b4-888cde78af09.png" 
              alt="Logo" 
              className="h-12 w-12 cursor-pointer" 
            />
          </div>
        </div>
      )}
      
      {/* Desktop footer logo for navigation */}
      {!isMobile && (
        <div className="w-full flex justify-center py-6 mt-8">
          <img 
            onClick={() => window.open("https://fantomsonic.com/", "_blank")}
            src="/lovable-uploads/d3db5656-828a-47f4-b0b4-888cde78af09.png" 
            alt="Logo" 
            className="h-12 w-12 cursor-pointer" 
          />
        </div>
      )}
    </div>
  );
}

export default App;
