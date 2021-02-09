import { animate, motion, useMotionValue } from "framer-motion";
import { useRef, useState } from "react";
import { useGesture } from "react-use-gesture";

export default function Home() {
  let [crop, setCrop] = useState({ x: 0, y: 0, scale: 1 });

  return (
    <>
      <p className="mt-2 text-center">Image Cropper</p>

      <div className="p-8">
        <ImageCropper src="/thumb.jpg" crop={crop} onCropChange={setCrop} />
        <div className="mt-2">
          <p>Crop X: {Math.round(crop.x)}</p>
          <p>Crop Y: {Math.round(crop.y)}</p>
          <p>Crop Scale: {crop.scale}</p>
        </div>
      </div>
    </>
  );
}

function ImageCropper({ src, crop, onCropChange }) {
  let x = useMotionValue(crop.x);
  let y = useMotionValue(crop.y);
  let scale = useMotionValue(crop.scale);

  let imageRef = useRef();
  let imageContainerRef = useRef();
  let animations = useRef([]);
  useGesture(
    {
      onDrag: ({ movement: [dx, dy] }) => {
        animations.current.forEach((a) => a.stop());

        x.set(dx);
        y.set(dy);
      },

      onPinch: ({
        memo,
        origin: [pinchOriginX, pinchOriginY],
        offset: [d],
      }) => {
        animations.current.forEach((a) => a.stop());

        memo ??= {
          bounds: imageRef.current.getBoundingClientRect(),
          crop: { x: x.get(), y: y.get(), scale: scale.get() },
        };

        let transformOriginX = memo.bounds.x + memo.bounds.width / 2;
        let transformOriginY = memo.bounds.y + memo.bounds.height / 2;

        let displacementX = (transformOriginX - pinchOriginX) / memo.crop.scale;
        let displacementY = (transformOriginY - pinchOriginY) / memo.crop.scale;

        let initialOffsetDistance = (memo.crop.scale - 1) * 50;
        let movementDistance = d - initialOffsetDistance;

        scale.set(1 + d / 50);
        x.set(memo.crop.x + (displacementX * movementDistance) / 50);
        y.set(memo.crop.y + (displacementY * movementDistance) / 50);

        return memo;
      },

      onDragEnd: maybeAdjustImage,
      onPinchEnd: maybeAdjustImage,
    },
    {
      drag: {
        initial: () => [x.get(), y.get()],
      },
      pinch: {
        distanceBounds: { min: 0 },
      },
      domTarget: imageRef,
      eventOptions: { passive: false },
    }
  );

  function maybeAdjustImage() {
    let newCrop = { x: x.get(), y: y.get(), scale: scale.get() };
    let imageBounds = imageRef.current.getBoundingClientRect();
    let containerBounds = imageContainerRef.current.getBoundingClientRect();
    let originalWidth = imageRef.current.clientWidth;
    let widthOverhang = (imageBounds.width - originalWidth) / 2;
    let originalHeight = imageRef.current.clientHeight;
    let heightOverhang = (imageBounds.height - originalHeight) / 2;

    if (imageBounds.left > containerBounds.left) {
      newCrop.x = widthOverhang;
    } else if (imageBounds.right < containerBounds.right) {
      newCrop.x = -(imageBounds.width - containerBounds.width) + widthOverhang;
    }

    if (imageBounds.top > containerBounds.top) {
      newCrop.y = heightOverhang;
    } else if (imageBounds.bottom < containerBounds.bottom) {
      newCrop.y =
        -(imageBounds.height - containerBounds.height) + heightOverhang;
    }

    animations.current = [animate(x, newCrop.x), animate(y, newCrop.y)];
    onCropChange(newCrop);
  }

  return (
    <>
      <div className="overflow-hidden cursor-grab ring-4 ring-blue-500 aspect-w-3 aspect-h-4">
        <div ref={imageContainerRef}>
          <motion.img
            src={src}
            ref={imageRef}
            style={{
              x: x,
              y: y,
              scale: scale,
              touchAction: "none",
              userSelect: "none",
              MozUserSelect: "none",
              WebkitUserDrag: "none",
            }}
            className="relative w-auto h-full max-w-none max-h-none"
          />
        </div>
      </div>
    </>
  );
}
