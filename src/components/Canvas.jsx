
import React, { useRef, useState, useEffect } from "react";
import { fabric } from "fabric";

const Canvas = ({ 
  onCanvasReady, 
  onObjectSelected, 
  isMobile,
  backgroundImage,
  baseCharacter 
}) => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);

  useEffect(() => {
    const newCanvas = new fabric.Canvas(canvasRef.current, {
      width: isMobile ? 400 : 400,
      height: isMobile ? 400 : 400,
      backgroundColor: "#F1F0FB",
    });

    setCanvas(newCanvas);
    onCanvasReady(newCanvas);

    // Event listener for object selection
    newCanvas.on("selection:created", (e) => {
      onObjectSelected(e.selected[0]);
    });

    newCanvas.on("object:modified", (e) => {
      onObjectSelected(e.target);
    });

    newCanvas.on("selection:cleared", () => {
      onObjectSelected(null);
    });

    // Add the base character
    addMainImg(newCanvas, baseCharacter);

    return () => {
      newCanvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!canvas) return;

    if (backgroundImage) {
      changeBackgroundImage(backgroundImage, canvas);
    } else {
      canvas.setBackgroundImage("", canvas.renderAll.bind(canvas));
    }
  }, [canvas, backgroundImage, isMobile]);

  const addMainImg = (canvas, image) => {
    fabric.Image.fromURL(image, (img) => {
      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();
      
      // Scale to 100% of canvas height while maintaining aspect ratio
      const scaleFactor = canvasHeight / img.height;
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
      let maxWidth = isMobile ? 400 : 400;
      let newWidth = maxWidth;
      let newHeight = 400;

      canvas.setWidth(newWidth);
      canvas.setHeight(newHeight);
      canvas.renderAll();

      canvas.setBackgroundImage(
        backgroundImage,
        canvas.renderAll.bind(canvas),
        {
          scaleX: canvas.width / img.width,
          scaleY: canvas.height / img.height,
        }
      );
      
      if (mainCatProps) {
        const objects = canvas.getObjects();
        const mainCat = objects.find(obj => 
          obj.selectable === false && 
          (!obj._element || !obj._element.src || !obj._element.src.includes("stickers"))
        );
        
        if (mainCat) {
          if (isMobile) {
            mainCat.set({
              left: canvas.width / 2,
              top: canvas.height,
              originX: 'center',
              originY: 'bottom',
              scaleX: mainCatProps.scaleX,
              scaleY: mainCatProps.scaleY
            });
          } else {
            mainCat.set(mainCatProps);
          }
          canvas.renderAll();
        }
      }
    });
  };

  return (
    <div className={`mx-auto mb-7 bg-transparent rounded-xl relative ${isMobile ? "canvas-mobile" : "w-[400px]"}`}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default Canvas;
