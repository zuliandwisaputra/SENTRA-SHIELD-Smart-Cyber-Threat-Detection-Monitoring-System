import { Composition } from "remotion";
import { muatFont } from "./fonts";
import { Placeholder } from "./Placeholder";
import { VIDEO } from "./tema";

muatFont();

// Satu komposisi utama. Adegan baru dibuat setelah storyboard diterima.
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="SentraDemo"
      component={Placeholder}
      durationInFrames={VIDEO.fps * 10}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
    />
  );
};
