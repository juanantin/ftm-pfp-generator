
import { fabric } from 'fabric';

export const addMainImg = (canvas, image) => {
  fabric.Image.fromURL(image, (img) => {
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    
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

export const changeBackgroundImage = (backgroundImage, canvas, isMobile) => {
  if (!canvas) return;
  
  const currentObjects = [...canvas.getObjects()];
  
  const mainCatImage = currentObjects.find(obj => 
    obj.selectable === false && 
    (!obj._element || !obj._element.src || !obj._element.src.includes("stickers"))
  );
  
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
