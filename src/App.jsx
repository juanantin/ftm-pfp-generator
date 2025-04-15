import { useState, useEffect, useRef } from "react";
import { fabric } from "fabric";
import baseCharacter from "../public/lovable-uploads/c1f10ba7-7878-44be-9be8-56715615e69f.png";
import ImageScroller from "./ImageScroller";
import TextDialog from "./TextDialog";
import Header from "./components/Header";
import Canvas from "./components/Canvas";
import ActionButtons from "./components/ActionButtons";
import Footer from "./components/Footer";
import { addMainImg, changeBackgroundImage } from "./utils/canvasUtils";

function App() {
  const [stickers, setStickers] = useState({});
  const [canvas, setCanvas] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showTextDialog, setShowTextDialog] = useState(false);
  
  // State for different sticker types
  const [hats, setHats] = useState(null);
  const [kimonos, setKimonos] = useState(null);
  const [weapons, setWeapons] = useState(null);
  const [eyewear, setEyewear] = useState(null);
  const [mouth, setMouth] = useState(null);

  const canvasRef = useRef(null);
  const bgImgInputRef = useRef(null);
  const stickerImgInputRef = useRef(null);

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

  useEffect(() => {
    if (!canvas) return;
    if (backgroundImage) {
      changeBackgroundImage(backgroundImage, canvas, isMobile);
    } else {
      canvas.setBackgroundImage("", canvas.renderAll.bind(canvas));
    }
  }, [canvas, backgroundImage, isMobile]);

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
    if (randomBackground) changeBackgroundImage(randomBackground, canvas, isMobile);
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
    const newCanvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth <= 768 ? 400 : 400,
      height: window.innerWidth <= 768 ? 400 : 400,
      backgroundColor: "#fff",
    });

    setCanvas(newCanvas);
    addMainImg(newCanvas, baseCharacter);

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

  const handleTextSubmit = (text, color) => {
    if (text) {
      const newText = new fabric.Text(text, {
        fontFamily: "Finger Paint",
        fontSize: 20,
        fill: color,
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

  return (
    <div className="min-h-screen overflow-y-auto bg-[#050b1f]">
      <Header />

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
          <Canvas 
            canvasRef={canvasRef}
            selectedObject={selectedObject}
            handleDelete={handleDelete}
          />

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

          <ActionButtons 
            onStickerUpload={() => stickerImgInputRef.current.click()}
            onTextAdd={() => setShowTextDialog(true)}
            onCanvasClear={handleCanvasClear}
            onRandomGenerate={generateRandom}
            onSaveImage={saveImageToLocal}
            stickerInputRef={stickerImgInputRef}
          />
        </div>
      </div>

      {showTextDialog && (
        <TextDialog onSubmit={handleTextSubmit} onClose={() => setShowTextDialog(false)} />
      )}

      <Footer />
    </div>
  );
}

export default App;
