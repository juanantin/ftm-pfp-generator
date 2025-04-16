import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import ImageScroller from "./ImageScroller";
import Canvas from "./components/Canvas";
import Toolbar from "./components/Toolbar";
import TextDialog from "./TextDialog";
import { saveImageToDataURL, dataURLToBlob } from "./utils/imageUtils";
import baseCharacter from "../public/lovable-uploads/c1f10ba7-7878-44be-9be8-56715615e69f.png";
import fantomLogo from "../public/lovable-uploads/e562fef2-b876-4191-9dd8-82c2e04581ec.png";
import roundLogo from "../public/lovable-uploads/be6d606d-e20d-47a4-a906-4f6f02bd8668.png";

function App() {
  const [stickers, setStickers] = useState({});
  const [canvas, setCanvas] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showTextDialog, setShowTextDialog] = useState(false);
  
  // State for different sticker categories
  const [hats, setHats] = useState(null);
  const [kimonos, setKimonos] = useState(null);
  const [weapons, setWeapons] = useState(null);
  const [eyewear, setEyewear] = useState(null);
  const [mouth, setMouth] = useState(null);

  const bgImgInputRef = useRef(null);
  const stickerImgInputRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const importStickers = async () => {
      const imageContext = import.meta.glob("./assets/stickers/*/*.(png|jpg|jpeg|svg)");
      const categorizedImages = {};

      await Promise.all(
        Object.entries(imageContext).map(async ([path, importPromise]) => {
          const imageModule = await importPromise();
          const imagePath = imageModule.default;
          const pathParts = path.split("/");
          const folderName = pathParts[pathParts.length - 2];
          const category = folderName.split(" ").slice(1).join(" ");

          if (!categorizedImages[category]) {
            categorizedImages[category] = [];
          }
          categorizedImages[category].push(imagePath);
        })
      );

      setStickers(categorizedImages);
    };

    importStickers();
  }, []);

  const handleAddImage = (state, setState, image) => {
    if (state != null) {
      canvas.remove(state);
    }
    fabric.Image.fromURL(image, (img) => {
      const canvasWidth = canvas.getWidth();
      img.scaleToWidth(canvasWidth);
      img.scaleToHeight(img.height * (canvasWidth / img.width));
      img.set({ selectable: false });
      setState(img);
      canvas.add(img);
    });
  };

  const getRandomImage = (category) => {
    if (!stickers[category] || stickers[category].length === 0) return null;
    const randomIndex = Math.floor(Math.random() * stickers[category].length);
    return stickers[category][randomIndex];
  };

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
    if (randomBackground) setBackgroundImage(randomBackground);
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
      const dataURL = saveImageToDataURL(canvas);
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

  const handleCanvasClear = () => {
    if (!canvas) return;
    const newBaseCharacter = baseCharacter;
    canvas.clear();
    canvas.setBackgroundColor("#F1F0FB", canvas.renderAll.bind(canvas));
    
    // Reset sticker states
    setHats(null);
    setKimonos(null);
    setWeapons(null);
    setEyewear(null);
    setMouth(null);
    
    // Re-add base character
    fabric.Image.fromURL(newBaseCharacter, (img) => {
      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();
      
      img.scaleToHeight(canvasHeight);
      img.set({
        left: canvasWidth / 2,
        top: canvasHeight,
        originX: 'center',
        originY: 'bottom',
        selectable: false
      });

      canvas.add(img);
      canvas.renderAll();
    });
  };

  const handleDelete = () => {
    const activeObjects = canvas?.getActiveObjects();
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
    if (text && canvas) {
      const newText = new fabric.Text(text, {
        fontFamily: "Finger Paint",
        fontSize: 20,
        fill: color,
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

  const handleHomeNavigation = () => {
    window.location.href = "https://fantomsonic.com/#pfp";
  };

  return (
    <div className="min-h-screen overflow-y-auto bg-[#050b1f]">
      <div onClick={handleHomeNavigation} className="fixed top-5 left-5 z-10">
        <img
          src={roundLogo}
          alt="Home"
          className="w-12 h-12 cursor-pointer hover:opacity-80 transition-opacity"
        />
      </div>

      <div className="pt-5 pb-10 mt-12">
        <img 
          src={fantomLogo} 
          alt="Fantom PFP Generator" 
          className="w-[250px] md:w-[300px] h-auto mx-auto"
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
          <Canvas
            onCanvasReady={setCanvas}
            onObjectSelected={setSelectedObject}
            isMobile={isMobile}
            backgroundImage={backgroundImage}
            baseCharacter={baseCharacter}
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

          <div className="w-full">
            <ImageScroller
              canvas={canvas}
              categorizedImages={stickers}
              handleAddImage={handleAddImage}
              changeBackgroundImage={(bg) => setBackgroundImage(bg)}
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

          <Toolbar
            onUploadSticker={() => stickerImgInputRef.current.click()}
            onAddText={() => setShowTextDialog(true)}
            onReset={handleCanvasClear}
            onRandomize={generateRandom}
            onSave={saveImageToLocal}
            stickerInputRef={stickerImgInputRef}
          />
        </div>
      </div>

      {showTextDialog && (
        <TextDialog onSubmit={handleTextSubmit} onClose={() => setShowTextDialog(false)} />
      )}

      <div className="flex justify-center pb-16 mt-10">
        <div 
          onClick={handleHomeNavigation} 
          className="cursor-pointer hover:opacity-80 transition-opacity"
        >
          <ArrowLeft 
            color="white" 
            size={32} 
            strokeWidth={2.5} 
            className="hover:scale-110 transition-transform" 
          />
        </div>
      </div>

      <div className="w-full text-center py-4 bg-[#050b1f] mt-8">
        <p className="content-font text-white text-sm">© 2025, Fantom</p>
      </div>
    </div>
  );
}

export default App;
