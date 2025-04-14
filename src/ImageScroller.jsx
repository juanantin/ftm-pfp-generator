
import React from "react";
import AssetTabs from "./components/AssetTabs";

function ImageScroller({
  canvas,
  categorizedImages,
  handleAddImage,
  changeBackgroundImage,
  hats,
  kimonos,
  weapons,
  eyewear,
  mouth,
  setHats,
  setKimonos,
  setWeapons,
  setEyewear,
  setMouth,
}) {
  return (
    <AssetTabs
      canvas={canvas}
      categorizedImages={categorizedImages}
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
  );
}

export default ImageScroller;
