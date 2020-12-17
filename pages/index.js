import { useRef, useState } from "react";
import { useGesture } from "react-use-gesture";

export default function Home() {
  return (
    <>
      <p className="mt-2 text-center">Image Cropper</p>

      <div className="p-8">
        <ImageCropper src="http://i3.ytimg.com/vi/bNDCFBIiAe8/maxresdefault.jpg" />
      </div>
    </>
  );
}

function ImageCropper({ src }) {
  let [crop, setCrop] = useState({ x: 0, y: 0, scale: 1 });
  let imageRef = useRef();
  useGesture(
    {
      onDrag: ({ offset: [dx, dy] }) => {
        setCrop((crop) => ({ ...crop, x: dx, y: dy }));
      },
      onPinch: ({ offset: [d] }) => {
        setCrop((crop) => ({ ...crop, scale: 1 + d / 50 }));
      },
    },
    {
      domTarget: imageRef,
      eventOptions: { passive: false },
    }
  );

  return (
    <>
      <div className="overflow-hidden ring-4 ring-blue-500 aspect-w-3 aspect-h-4">
        <div>
          <img
            src={src}
            ref={imageRef}
            style={{
              left: crop.x,
              top: crop.y,
              transform: `scale(${crop.scale})`,
              touchAction: "none",
            }}
            className="relative w-auto h-full max-w-none max-h-none"
          />
        </div>
      </div>
      <div className="mt-2">
        <p>Crop X: {crop.x}</p>
        <p>Crop Y: {crop.y}</p>
        <p>Crop Scale: {crop.scale}</p>
      </div>
    </>
  );
}
