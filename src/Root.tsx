import { Composition, Folder } from "remotion";
import { HelloWorld } from "./HelloWorld";
import { Logo } from "./HelloWorld/Logo";
import { Title } from "./HelloWorld/Title";
import { BuildingAd, buildingAdSchema } from "./Building/BuildingAd";
import { DURATION, FPS } from "./Building/scene";
import { DOME_DURATION, DomeShowreel, domeSchema } from "./Dome/DomeShowreel";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PubBatimentIso"
        component={BuildingAd}
        durationInFrames={DURATION}
        fps={FPS}
        width={1920}
        height={1080}
        schema={buildingAdSchema}
        defaultProps={{
          companyName: "BatiSens",
          tagline: "Construire durable, comprendre son bâtiment",
          website: "www.batisens.fr",
          accentColor: "#ef5a3c",
        }}
      />
      <Composition
        id="DomeMotionShowreel"
        component={DomeShowreel}
        durationInFrames={DOME_DURATION}
        fps={30}
        width={1920}
        height={1080}
        schema={domeSchema}
        defaultProps={{
          instagram: "@domemotion",
          website: "www.domemotion.fr",
          showSubtitles: true,
          withVoice: false,
        }}
      />
      <Folder name="Elements">
        <Composition
          id="Logo"
          component={Logo}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            logoColor1: "#91EAE4",
            logoColor2: "#86A8E7",
          }}
        />
        <Composition
          id="Title"
          component={Title}
          durationInFrames={115}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            titleText: "Welcome to Remotion",
            titleColor: "#000000",
          }}
        />
      </Folder>
      <Composition
        // You can take the "id" to render a video:
        // bunx remotion render HelloWorld
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        // You can override these props for each render:
        // https://www.remotion.dev/docs/parametrized-rendering
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#000000",
        }}
      />

    </>
  );
};
