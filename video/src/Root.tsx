import { Composition, Still } from "remotion";
import { FRAME_TOTAL } from "./adegan/daftar";
import { muatFont } from "./fonts";
import { VIDEO } from "./tema";
import { SentraDemo } from "./Video";
import { THUMBNAIL, THUMBNAIL_KARYA, Thumbnail, ThumbnailKarya } from "./Thumbnail";

muatFont();

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SentraDemo"
        component={SentraDemo}
        durationInFrames={FRAME_TOTAL}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
      <Still
        id="Thumbnail"
        component={Thumbnail}
        width={THUMBNAIL.width}
        height={THUMBNAIL.height}
      />
      <Still
        id="ThumbnailKarya"
        component={ThumbnailKarya}
        width={THUMBNAIL_KARYA.width}
        height={THUMBNAIL_KARYA.height}
      />
    </>
  );
};
