import { animate, motion, useMotionValue } from "framer-motion";
import { useRef, useState } from "react";
import { useGesture } from "react-use-gesture";

export default function Home() {
  let [crop, setCrop] = useState({ x: 0, y: 0, scale: 1 });

  return (
    <>
      <p className="mt-2 text-lg text-center">Image Cropper</p>

      <div className="p-8 mt-2">
        <ImageCropper src="/thumb.jpg" crop={crop} onCropChange={setCrop} />

        <div className="mt-6">
          <p>Crop X: {Math.round(crop.x)}</p>
          <p>Crop Y: {Math.round(crop.y)}</p>
          <p>Crop Scale: {Math.round(crop.scale * 100) / 100}</p>
        </div>
      </div>
    </>
  );
}

function ImageCropper({ src, crop, onCropChange }) {
  let x = useMotionValue(crop.x);
  let y = useMotionValue(crop.y);
  let scale = useMotionValue(crop.scale);
  let [isDragging, setIsDragging] = useState(false);
  let [isPinching, setIsPinching] = useState(false);

  let imageRef = useRef();
  let imageContainerRef = useRef();
  useGesture(
    {
      onDrag: ({ dragging, movement: [newX, newY] }) => {
        setIsDragging(dragging);
        x.stop();
        y.stop();

        let imageBounds = imageRef.current.getBoundingClientRect();
        let containerBounds = imageContainerRef.current.getBoundingClientRect();
        let originalWidth = imageRef.current.clientWidth;
        let widthOverhang = (imageBounds.width - originalWidth) / 2;
        let originalHeight = imageRef.current.clientHeight;
        let heightOverhang = (imageBounds.height - originalHeight) / 2;

        let minX = -(imageBounds.width - containerBounds.width) + widthOverhang;
        let maxX = widthOverhang;
        x.set(dampen(newX, [minX, maxX]));

        let minY = -(originalHeight - containerBounds.height + heightOverhang);
        let maxY = heightOverhang;
        y.set(dampen(newY, [minY, maxY]));
      },

      onPinch: ({
        event,
        pinching,
        memo,
        origin: [pinchOriginX, pinchOriginY],
        offset: [d],
      }) => {
        event.preventDefault();
        setIsPinching(pinching);

        x.stop();
        y.stop();
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

    animate(x, newCrop.x, {
      type: "tween",
      duration: 0.4,
      ease: [0.25, 1, 0.5, 1],
    });
    animate(y, newCrop.y, {
      type: "tween",
      duration: 0.4,
      ease: [0.25, 1, 0.5, 1],
    });
    onCropChange(newCrop);
  }

  return (
    <>
      <div
        className={`relative overflow-hidden bg-black ring-4 ring-white aspect-w-4 aspect-h-5 ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
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
          <div
            className={`pointer-events-none absolute inset-0 transition duration-300 ${
              isDragging || isPinching ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="absolute inset-0 flex flex-col">
              <div className="self-stretch flex-1 border-b border-gray-50 "></div>
              <div className="self-stretch flex-1 border-b border-gray-50 "></div>
              <div className="self-stretch flex-1"></div>
            </div>
            <div className="absolute inset-0 flex">
              <div className="self-stretch flex-1 border-r border-gray-50 "></div>
              <div className="self-stretch flex-1 border-r border-gray-50 "></div>
              <div className="self-stretch flex-1"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function dampen(val, [originalMin, originalMax]) {
  let threshold = 20;
  let min = originalMin - threshold;
  let max = originalMax + threshold;

  if (val < min) {
    let extra = val - min;
    let dampenedExtra = extra > 0 ? Math.sqrt(extra) : -Math.sqrt(-extra);
    return min + dampenedExtra * 2;
  } else if (val > max) {
    let extra = val - max;
    let dampenedExtra = extra > 0 ? Math.sqrt(extra) : -Math.sqrt(-extra);
    return max + dampenedExtra * 2;
  } else {
    return val;
  }
}
