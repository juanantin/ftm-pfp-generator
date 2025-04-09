
import { useState, useEffect, useRef } from "react";
// Import Fabric.js properly to prevent "Canvas is not a constructor" error
import { fabric } from "fabric";
import logo from "./assets/logo.png";
import ImageScroller from "./ImageScroller";
import bg from "./assets/bg.png";
import main_cat from "./assets/main_cat.png";

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
          return;
        }
        
        console.log("Canvas element found:", canvasRef.current);
        
        // Create the Fabric.js canvas instance
        const newCanvas = new fabric.Canvas(canvasRef.current, {
          width: window.innerWidth <= 768 ? 400 : 400,
          height: window.innerWidth <= 768 ? 400 : 400,
          backgroundColor: "#fff",
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
          }, 300);
        });

        newCanvas.on("selection:cleared", () => {
          setSelectedObject(null);
        });

        // Add the main cat image
        addMainImg(newCanvas, main_cat);
        
        // Update preview after initialization
        setTimeout(() => {
          console.log("Updating preview after canvas init");
          saveImageToDataURL();
        }, 500);
      } catch (error) {
        console.error("Error initializing Fabric.js canvas:", error);
        fabricInitialized.current = false;
      }
    }
  };

  useEffect(() => {
    // Import stickers from asset folders
    const importStickers = async () => {
      // Import images from all subfolders in the 'assets/stickers' directory
      const imageContext = import.meta.glob(
        "./assets/stickers/*/*.(png|jpg|jpeg|svg)"
      );

      // Object to store categorized images
      const categorizedImages = {};

      // Process each import promise
      await Promise.all(
        Object.entries(imageContext).map(async ([path, importPromise]) => {
          const imageModule = await importPromise();
          const imagePath = imageModule.default;

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
        })
      );

      // Use the categorized images as needed
      setStickers(categorizedImages);
      
      // After loading stickers, try to initialize the canvas
      setTimeout(() => {
        initializeCanvas();
        
        // Force an initial preview update after everything is loaded
        setTimeout(() => {
          console.log("Initial preview update");
          saveImageToDataURL();
        }, 1000);
      }, 200);
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
    fabric.Image.fromURL(image, (img) => {
      const canvasWidth = canvas.getWidth();

      img.scaleToWidth(canvasWidth);
      img.scaleToHeight(img.height * (canvasWidth / img.width));
      img.set({
        selectable: false, // Disable selection
      });

      canvas.add(img);
      
      // Update preview after adding main image
      setTimeout(() => {
        saveImageToDataURL();
      }, 300);
    });
  };

  const handleAddImage = (state, setState, image) => {
    if (state != null) {
      canvas.remove(state);
    }
    fabric.Image.fromURL(image, (img) => {
      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();

      img.scaleToWidth(canvasWidth);
      img.scaleToHeight(canvasHeight);
      img.set({
        selectable: false, // Disable selection
      });

      setState(img);

      canvas.add(img);
      
      // Update the preview after adding the image
      setTimeout(() => {
        saveImageToDataURL();
      }, 100);
    });
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

    const randomEyewear = getRandomImage("eyewear");
    if (randomEyewear) handleAddImage(eyewear, setEyewear, randomEyewear);

    const randomMouth = getRandomImage("mouth");
    if (randomMouth) handleAddImage(mouth, setMouth, randomMouth);

    const randomKimono = getRandomImage("kimono");
    if (randomKimono) handleAddImage(kimono, setKimono, randomKimono);

    const randomJewelry = getRandomImage("jewelry");
    if (randomJewelry) handleAddImage(jewelry, setJewelry, randomJewelry);

    const randomAccessories = getRandomImage("accessories");
    if (randomAccessories)
      handleAddImage(accessories, setAccessories, randomAccessories);

    // Removed randomPawAccessories section

    const randomBackground = getRandomImage("background");
    if (randomBackground) changeBackgroundImage(randomBackground, canvas);
    
    // Update the preview after a slight delay to allow canvas to render
    setTimeout(() => {
      saveImageToDataURL();
    }, 500);
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
          img.scaleToWidth(100);
          img.scaleToHeight(img.height * (100 / img.width));
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
      const dataURL = canvas.toDataURL({
        format: "png",
        multiplier: 8,
        quality: 1,
      });
      
      // Display the image preview to the user
      const resultPreview = document.getElementById('result-preview');
      if (resultPreview) {
        resultPreview.src = dataURL;
        resultPreview.style.display = 'block';
        console.log("Preview updated with image data", resultPreview);
      } else {
        console.error("Cannot find preview element with ID 'result-preview'");
      }
      return dataURL;
    } catch (error) {
      console.error("Error saving image to data URL:", error);
      return '';
    }
  };

  const handleCanvasClear = () => {
    try {
      // Dispose of the old canvas first
      if (canvas) {
        canvas.dispose();
      }
      
      if (!canvasRef.current) {
        console.error("Canvas reference is null during clear!");
        return;
      }
      
      // Create a new canvas instance
      const newCanvas = new fabric.Canvas(canvasRef.current, {
        width: window.innerWidth <= 768 ? 400 : 400,
        height: window.innerWidth <= 768 ? 400 : 400,
        backgroundColor: "#fff",
      });

      console.log("New canvas created during clear:", newCanvas);
      setCanvas(newCanvas);
      fabricInitialized.current = true;
      
      // Add main cat image to the new canvas
      addMainImg(newCanvas, main_cat);
      
      // Clear the preview image
      const resultPreview = document.getElementById('result-preview');
      if (resultPreview) {
        resultPreview.src = '';
      }
    } catch (error) {
      console.error("Error during canvas clear:", error);
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
        stroke: "#0c46af", // Changed from black to #0c46af
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
    <div className="min-h-screen overflow-y-auto bg-black">
      <div
        onClick={() => window.open("https://fantomsonic.com/", "_blank")}
        className="flex cursor-pointer absolute top-5 left-10"
      >
        <img 
          src="/lovable-uploads/d3db5656-828a-47f4-b0b4-888cde78af09.png" 
          alt="Logo" 
          className="h-10 w-10" 
        />
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
            <img
              src="/lovable-uploads/13dd479a-7c88-43de-94c7-701c74fae6c8.png"
              className="w-full max-w-[400px] h-auto mx-auto"
              alt="FANTOM PFP GENERATOR"
            />
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
              className="border-2 cursor-pointer border-white bg-[#0c46af] text-white px-5 py-2 rounded-lg flex justify-center items-center overflow-hidden relative group transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-full md:w-1/3 lg:w-1/3"
            >
              <p className="text-white text-center text-lg tracking-wider relative" style={{ fontFamily: "'Finger Paint', cursive" }}>
                UPLOAD
              </p>
              <div className="absolute top-0 left-0 w-full h-full bg-black opacity-0 z-0 transition duration-300 ease-in-out group-hover:opacity-50"></div>
            </div>
            <div
              onClick={() => bgImgInputRef.current.click()}
              className="border-2 cursor-pointer border-white bg-[#0c46af] text-white px-5 py-2 rounded-lg flex justify-center items-center overflow-hidden relative group transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-full md:w-1/3 lg:w-1/3"
            >
              <p className="text-white text-center text-lg tracking-wider relative" style={{ fontFamily: "'Finger Paint', cursive" }}>
                BG
              </p>
              <div className="absolute top-0 left-0 w-full h-full bg-black opacity-0 z-0 transition duration-300 ease-in-out group-hover:opacity-50"></div>
            </div>
            <div
              onClick={handleAddText}
              className="border-2 cursor-pointer border-white bg-[#0c46af] text-white px-5 py-2 rounded-lg flex justify-center items-center overflow-hidden relative group transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-full md:w-1/3 lg:w-1/3"
            >
              <p className="text-white text-center text-lg tracking-wider relative" style={{ fontFamily: "'Finger Paint', cursive" }}>
                TEXT
              </p>
              <div className="absolute top-0 left-0 w-full h-full bg-black opacity-0 z-0 transition duration-300 ease-in-out group-hover:opacity-50"></div>
            </div>
            <div
              onClick={handleCanvasClear}
              className="border-2 cursor-pointer border-white bg-[#0c46af] text-white px-5 py-2 rounded-lg flex justify-center items-center overflow-hidden relative group transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-full md:w-1/3 lg:w-1/3"
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
          
          {/* Result Preview Container */}
          <div className="mt-10 flex flex-col items-center justify-center">
            <h2 className="text-3xl text-center text-white mb-4 content-font" style={{ fontFamily: "'Finger Paint', cursive" }}>Your FTM PFP Preview</h2>
            <div className="border-4 border-[#0c46af] p-2 rounded-lg bg-black/50">
              <img 
                id="result-preview" 
                alt="Result Preview" 
                className="max-w-[300px] max-h-[300px] block"
                style={{display: 'block', margin: '0 auto'}}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 w-full lg:w-[60%] px-5 lg:pl-0 ">
          <div className="flex-1">
            <h1 className="text-4xl text-center text-white mt-10" style={{ fontFamily: "'Finger Paint', cursive" }}>
              CLICK TO ADD STICKER
            </h1>
            <ImageScroller
              canvas={canvas}
              categorizedImages={stickers}
              handleAddImage={handleAddImage}
              changeBackgroundImage={changeBackgroundImage}
              headwear={headwear}
              eyewear={eyewear}
              mouth={mouth}
              jewelry={jewelry}
              accessories={accessories}
              setHeadwear={setHeadwear}
              setEyewear={setEyewear}
              setMouth={setMouth}
              setKimono={setKimono}
              setJewelry={setJewelry}
              setAccessories={setAccessories}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
