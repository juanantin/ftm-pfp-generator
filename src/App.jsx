
import { useState, useEffect, useRef } from "react";
import { fabric } from "fabric";
import ImageScroller from "./ImageScroller";
import baseCharacter from "../public/lovable-uploads/c1f10ba7-7878-44be-9be8-56715615e69f.png";
import fantomLogo from "../public/lovable-uploads/e562fef2-b876-4191-9dd8-82c2e04581ec.png";
import roundLogo from "../public/lovable-uploads/be6d606d-e20d-47a4-a906-4f6f02bd8668.png";
import TextDialog from "./TextDialog";

function App() {
  const [stickers, setStickers] = useState({});

  const canvasRef = useRef(null);
  const bgImgInputRef = useRef(null);
  const stickerImgInputRef = useRef(null);

  const [canvas, setCanvas] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [hats, setHats] = useState(null);
  // const [faces, setFaces] = useState(null);
  const [kimonos, setKimonos] = useState(null);
  // const [pants, Pants] = useState(null);
  const [weapons, setWeapons] = useState(null);
  const [eyewear, setEyewear] = useState(null);
  const [mouth, setMouth] = useState(null);
  const [showTextDialog, setShowTextDialog] = useState(false);

  // const [isAtFront, setIsAtFront] = useState(false);
  // const [isAtBack, setIsAtBack] = useState(false);

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
    if (!canvas) return;
    
    // Store current objects to restore after background change
    const currentObjects = [...canvas.getObjects()]; 
    
    // Find the main cat image specifically (the base character)
    const mainCatImage = currentObjects.find(obj => 
      obj.selectable === false && 
      (!obj._element || !obj._element.src || !obj._element.src.includes("stickers"))
    );
    
    // Store main cat position and scale if it exists
    let mainCatProps = null;
    if (mainCatImage) {
      mainCatProps = {
        scaleX: mainCatImage.scaleX,
        scaleY: mainCatImage.scaleY,
        left: mainCatImage.left,
        top: mainCatImage.top,
        originX: mainCatImage.originX || 'center',
        originY: mainCatImage.originY || 'bottom'
      };
    }

    fabric.Image.fromURL(backgroundImage, (img) => {
      // Calculate the new dimensions respecting the maximum width of 550px
      let newWidth = img.width;
      let newHeight = img.height;

      let maxWidth = isMobile ? 400 : 400;

      if (img.width > maxWidth) {
        newWidth = maxWidth;
        newHeight = (maxWidth / img.width) * img.height;
      }

      // Temporarily store the current canvas dimensions
      const oldWidth = canvas.width;
      const oldHeight = canvas.height;

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
      
      // If main character was found, restore its properties after background change
      if (mainCatProps) {
        // Find the main cat again after background change
        const objects = canvas.getObjects();
        const mainCat = objects.find(obj => 
          obj.selectable === false && 
          (!obj._element || !obj._element.src || !obj._element.src.includes("stickers"))
        );
        
        if (mainCat) {
          // On mobile, ensure the main cat stays aligned with the bottom regardless of background
          if (isMobile) {
            mainCat.set({
              left: canvas.width / 2, // Center horizontally
              top: canvas.height, // Align with bottom
              originX: 'center',
              originY: 'bottom',
              scaleX: mainCatProps.scaleX,
              scaleY: mainCatProps.scaleY
            });
          } else {
            // For desktop, just restore previous position
            mainCat.set({
              left: mainCatProps.left,
              top: mainCatProps.top,
              originX: mainCatProps.originX,
              originY: mainCatProps.originY,
              scaleX: mainCatProps.scaleX,
              scaleY: mainCatProps.scaleY
            });
          }
          canvas.renderAll();
        }
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
  }, [canvas, backgroundImage, isMobile]);

  const addMainImg = (canvas2, image) => {
    fabric.Image.fromURL(image, (img) => {
      const canvasWidth = canvas2.getWidth();
      const canvasHeight = canvas2.getHeight();
      
      // Scale to 100% of canvas height while maintaining aspect ratio
      const scaleFactor = canvasHeight / img.height;
      img.scaleToHeight(canvasHeight);

      img.set({
        left: canvasWidth / 2,
        top: canvasHeight, // Align with bottom of canvas
        originX: 'center',
        originY: 'bottom',
        selectable: false
      });

      canvas2.add(img);
      canvas2.renderAll();
    });
  };

  useEffect(() => {
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
    };

    importStickers();

    const newCanvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth <= 768 ? 400 : 400,
      height: window.innerWidth <= 768 ? 400 : 400,
      backgroundColor: "#fff"
    });

    setCanvas(newCanvas);

    // Event listener for object selection
    newCanvas.on("selection:created", (e) => {
      setSelectedObject(e.selected[0]);
    });

    newCanvas.on("object:modified", (e) => {
      setSelectedObject(e.target);
    });

    // Event listener for object deselection
    newCanvas.on("selection:cleared", () => {
      setSelectedObject(null);
    });

    // fabric.Image.fromURL(bgImg, (img) => {
    //   newCanvas.setBackgroundImage(img, newCanvas.renderAll.bind(newCanvas), {
    //     scaleX: newCanvas.width / img.width,
    //     scaleY: newCanvas.height / img.height,
    //   });
    // });

    // changeBackgroundImage(bg, newCanvas);
    // handleAddImage(null, null, logo);

    // addMainImg(newCanvas, main_cat);
    // Add the base character
    addMainImg(newCanvas, baseCharacter);

    return () => {
      newCanvas.dispose();
    };
  }, []);

  const handleAddImage = (state, setState, image) => {
    if (state != null) {
      canvas.remove(state);
    }
    fabric.Image.fromURL(image, (img) => {
      const canvasWidth = canvas.getWidth();

      img.scaleToWidth(canvasWidth);
      img.scaleToHeight(img.height * (canvasWidth / img.width));
      img.set({
        selectable: false, // Disable selection
      });

      setState(img);

      canvas.add(img);
    });
  };

  const getRandomImage = (category) => {
    if (!stickers[category] || stickers[category].length === 0) return null;
    const randomIndex = Math.floor(Math.random() * stickers[category].length);
    return stickers[category][randomIndex];
  };

  // Fix randomizer functionality to pick one from each category
  const generateRandom = () => {
    const randomHats = getRandomImage("headwear");
    const randomKimonos = getRandomImage("kimono");
    const randomWeapons = getRandomImage("accessory");
    const randomEyewear = getRandomImage("eyewear");
    const randomMouth = getRandomImage("mouth");
    const randomBackground = getRandomImage("background");

    if (randomHats) handleAddImage(hats, setHats, randomHats);
    if (randomKimonos) handleAddImage(kimonos, setKimonos, randomKimonos);
    if (randomWeapons) handleAddImage(weapons, setWeapons, randomWeapons);
    if (randomEyewear) handleAddImage(eyewear, setEyewear, randomEyewear);
    if (randomMouth) handleAddImage(mouth, setMouth, randomMouth);
    if (randomBackground) changeBackgroundImage(randomBackground, canvas);
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
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveImageToLocal = () => {
    if (canvas) {
      const dataURL = saveImageToDataURL();
      const blob = dataURLToBlob(dataURL);
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.download = "ftm_pfp.png";
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    }
  };

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
    return canvas.toDataURL({
      format: "jpeg",
      multiplier: 8,
      quality: 1,
    });
  };

  const handleCanvasClear = () => {
    // canvas.clear();
    const newCanvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth <= 768 ? 400 : 400,
      height: window.innerWidth <= 768 ? 400 : 400,
      backgroundColor: "#fff",
    });

    setCanvas(newCanvas);
    addMainImg(newCanvas, baseCharacter);

    // Reset sticker states
    setHats(null);
    setKimonos(null);
    setWeapons(null);
    setEyewear(null);
    setMouth(null);
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
    setShowTextDialog(true);
  };

  const handleTextSubmit = (text, color) => {
    if (text) {
      const newText = new fabric.Text(text, {
        fontFamily: "Tahoma",
        fontSize: 20,
        fill: color,
        stroke: "#000",
        strokeWidth: 0.5,
        fontWeight: "bold",
        left: 100,
        top: 100,
        charSpacing: 1,
      });

      canvas.add(newText);
      canvas.setActiveObject(newText);
      setSelectedObject(newText);
    }
    setShowTextDialog(false);
  };

  const handleCloseTextDialog = () => {
    setShowTextDialog(false);
  };

  return (
    <div className="min-h-screen overflow-y-auto bg-[#050b1f]">
      {/* Logo - using fixed positioning with smaller size on mobile */}
      <div className="pt-5 pb-10 mt-12">
        <img 
          src={fantomLogo} 
          alt="Fantom PFP Generator" 
          className="w-[160px] md:w-[260px] h-auto mx-auto"
        />
      </div>

      {/* Top left home logo - fixed position */}
      <div className="fixed top-5 left-5 z-10">
        <img
          src={roundLogo}
          alt="Home"
          onClick={() => window.location.href = "https://fantomsonic.com"}
          className="w-12 h-12 cursor-pointer hover:opacity-80 transition-opacity"
        />
      </div>

      <div className="w-full flex flex-col items-center py-5">
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

        <div className="flex flex-col items-center px-5">
          <div
            className={`mx-auto mb-7 bg-transparent rounded-xl relative
            ${isMobile ? "canvas-mobile" : "w-[400px]"}
            `}
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

          <div className="w-full">
            <ImageScroller
              canvas={canvas}
              categorizedImages={stickers}
              handleAddImage={handleAddImage}
              changeBackgroundImage={changeBackgroundImage}
              hats={hats}
              kimonos={kimonos}
              weapons={weapons}
              eyewear={eyewear}
              mouth={mouth}
              setHats={setHats}
              setKimonos={setKimonos}
              setWeapons={setWeapons}
              setEyewear={setEyewear}
              setMouth={setMouth}
            />
          </div>

          <div className="flex flex-wrap gap-3 justify-center mt-8">
            <button
              onClick={() => stickerImgInputRef.current.click()}
              className="border-2 content-font cursor-pointer border-white bg-transparent text-white px-4 py-2 rounded-lg text-base hover:bg-white hover:text-black transition-all duration-300"
            >
              UPLOAD STICKER
            </button>
            <button
              onClick={handleAddText}
              className="border-2 content-font cursor-pointer border-white bg-transparent text-white px-4 py-2 rounded-lg text-base hover:bg-white hover:text-black transition-all duration-300"
            >
              ADD TEXT
            </button>
            <button
              onClick={handleCanvasClear}
              className="border-2 content-font cursor-pointer border-white bg-transparent text-white px-4 py-2 rounded-lg text-base hover:bg-white hover:text-black transition-all duration-300"
            >
              RESET
            </button>
            <button
              onClick={generateRandom}
              className="border-2 content-font cursor-pointer border-white bg-transparent text-white px-4 py-2 rounded-lg text-base hover:bg-white hover:text-black transition-all duration-300"
            >
              RANDOMIZER
            </button>
            <button
              onClick={saveImageToLocal}
              className="border-2 content-font cursor-pointer border-white bg-transparent text-white px-4 py-2 rounded-lg text-base hover:bg-white hover:text-black transition-all duration-300"
            >
              DOWNLOAD
            </button>
          </div>
        </div>
      </div>

      {/* Text dialog modal */}
      {showTextDialog && (
        <TextDialog onSubmit={handleTextSubmit} onClose={handleCloseTextDialog} />
      )}

      {/* Bottom logo with same size as top left logo */}
      <div className="flex justify-center pb-16 mt-10">
        <img
          src={roundLogo}
          alt="Logo"
          onClick={() => window.location.href = "https://fantomsonic.com"}
          className="w-12 h-12 cursor-pointer hover:opacity-80 transition-opacity"
        />
      </div>
    </div>
  );
}

export default App;
