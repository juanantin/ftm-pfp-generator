import { useState, useEffect, useRef } from "react";
import { fabric } from "fabric";
import logo from "./assets/logo.png";
import ImageScroller from "./ImageScroller";
import bg from "./assets/bg.png";
import main_cat from "./assets/main_cat.png";

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
      backgroundColor: "#fff",
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

    addMainImg(newCanvas, main_cat);

    return () => {
      newCanvas.dispose();
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
    });
  };

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
    const categoryItems = stickers[category];
    if (categoryItems.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * categoryItems.length);
    return categoryItems[randomIndex];
  };

  const generateRandom = () => {
    const randomHats = getRandomImage("hat & mask");
    const randomKimonos = getRandomImage("kimono");
    const randomWeapons = getRandomImage("weapons");
    const randomBackground = getRandomImage("background");

    if (randomHats) handleAddImage(hats, setHats, randomHats);
    if (randomKimonos) handleAddImage(kimonos, setKimonos, randomKimonos);
    // if (randomPants) handleAddImage(pants, setPants, randomPants);
    if (randomWeapons) handleAddImage(weapons, setWeapons, randomWeapons);

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
      const link = document.createElement("a");
      link.download = "cok_meme.png";
      link.href = saveImageToDataURL();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
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

    // const newCanvas = new fabric.Canvas(canvasRef.current, {
    //   width: 300,
    //   height: 300,
    //   backgroundColor: "#fff",
    // });

    setCanvas(newCanvas);
    addMainImg(newCanvas, main_cat);

    // changeBackgroundImage(bg, newCanvas);
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

  // useEffect(() => {
  //   if (selectedObject && canvas) {
  //     const isObjectInFront =
  //       selectedObject === canvas.getObjects()[canvas.getObjects().length - 1];
  //     const isObjectInBack = selectedObject === canvas.getObjects()[0];
  //     setIsAtFront(isObjectInFront);
  //     setIsAtBack(isObjectInBack);
  //   } else {
  //     setIsAtFront(false);
  //     setIsAtBack(false);
  //   }
  // }, [selectedObject, canvas]);

  // const bringForward = () => {
  //   if (selectedObject) {
  //     canvas.bringForward(selectedObject);
  //     canvas.renderAll();
  //   }
  // };

  // const bringToFront = () => {
  //   if (selectedObject) {
  //     canvas.bringToFront(selectedObject);
  //     canvas.renderAll();
  //   }
  // };

  // const sendBackward = () => {
  //   if (selectedObject) {
  //     canvas.sendBackwards(selectedObject);
  //     canvas.renderAll();
  //   }
  // };

  // const sendToBack = (object) => {
  //   if (object) {
  //     canvas.sendToBack(selectedObject);
  //     canvas.renderAll();
  //   }
  // };

  return (
    <div className="max-w-screen min-h-screen overflow-x-auto overflow-y-auto bg-gradient-to-r from-blue-700 to-blue-300">
      {/* <img
        className="w-full h-full absolute top-0 left-0 opacity-[0.4] object-cover md:object-cover"
        src={isMobile ? all_bg_mobile : all_bg}
        alt=""
      /> */}

      {/* <div
        onClick={() => (window.location.href = "https://gojionsol.xyz")}
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
      </div> */}

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
        <div className="w-[80vw] px-5 mx-auto">
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

        <div className="mt-5 flex-1 px-5 lg:pl-0 ">
          <div className="flex-1">
            <h1 className="text-4xl text-center text-white mt-10">
              CLICK TO ADD STICKER
            </h1>
            <ImageScroller
              canvas={canvas}
              categorizedImages={stickers}
              handleAddImage={handleAddImage}
              changeBackgroundImage={changeBackgroundImage}
              hats={hats}
              kimonos={kimonos}
              weapons={weapons}
              setHats={setHats}
              setKimonos={setKimonos}
              setWeapons={setWeapons}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
