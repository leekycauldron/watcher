interface MJPEGPlayerProps {
  onLoad?: () => void;
}

export default function MJPEGPlayer({ onLoad }: MJPEGPlayerProps) {
  return (
    <img
      src="/api/stream/mjpeg"
      alt="Live stream"
      onLoad={onLoad}
      className="w-full h-full object-contain bg-black"
    />
  );
}
