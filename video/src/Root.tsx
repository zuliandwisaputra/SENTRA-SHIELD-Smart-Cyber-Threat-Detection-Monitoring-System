import { Composition } from "remotion";
import { DURASI_TOTAL } from "./adegan/daftar";
import { muatFont } from "./fonts";
import { VIDEO } from "./tema";
import { SentraDemo } from "./Video";

muatFont();

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="SentraDemo"
      component={SentraDemo}
      durationInFrames={DURASI_TOTAL * VIDEO.fps}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
    />
  );
};
