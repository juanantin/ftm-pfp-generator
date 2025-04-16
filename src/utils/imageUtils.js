
export const saveImageToDataURL = (canvas) => {
  // Create a temporary canvas for high-res export
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = 1000;
  tempCanvas.height = 1000;
  const tempContext = tempCanvas.getContext('2d');

  // Scale up the content to 1000x1000
  const originalCanvas = canvas.getElement();
  tempContext.drawImage(originalCanvas, 0, 0, 1000, 1000);

  return tempCanvas.toDataURL('image/png', 1.0);
};

export const dataURLToBlob = (dataURL) => {
  const [header, data] = dataURL.split(",");
  const mimeString = "image/png"; // Force PNG mime type
  const byteString = atob(data);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uint8Array = new Uint8Array(arrayBuffer);

  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
  }

  return new Blob([uint8Array], { type: mimeString });
};
