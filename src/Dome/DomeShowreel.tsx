import React from "react";
import { z } from "zod";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile } from "remotion";
import { linearTiming, TransitionPresentation, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { IntroScene } from "./scenes/Intro";
import { HookScene } from "./scenes/Hook";
import { BeerScene } from "./scenes/Beer";
import { WineScene } from "./scenes/Wine";
import { TerroirScene } from "./scenes/Terroir";
import { RestaurantScene } from "./scenes/Restaurant";
import { CoiffeurScene } from "./scenes/Coiffeur";
import { GymScene } from "./scenes/Gym";
import { FormatsScene } from "./scenes/Formats";
import { OutroScene } from "./scenes/Outro";
import { Subtitle } from "./ui";

export const domeSchema = z.object({
  instagram: z.string(),
  website: z.string(),
  showSubtitles: z.boolean(),
  // Voice-over: one file per scene in public/dome/voix/ (01.wav ... 10.wav). Leave false until the files exist.
  withVoice: z.boolean(),
});

type Props = z.infer<typeof domeSchema>;

const TRANSITION = 15;

// Each scene carries the voice-over line it illustrates.
export const SCENES: { id: string; duration: number; vo: string; render: (p: Props) => React.ReactNode }[] = [
  { id: "intro", duration: 150, vo: "Dôme Motion. Le motion design, made in Clermont-Ferrand.", render: () => <IntroScene /> },
  {
    id: "hook",
    duration: 230,
    vo: "Vos produits méritent mieux qu'une affiche générée en deux clics. Ils méritent un rendu réaliste, qui donne envie.",
    render: () => <HookScene />,
  },
  { id: "biere", duration: 165, vo: "Une bière artisanale d'Auvergne ? On la met en scène, bulle après bulle.", render: () => <BeerScene /> },
  { id: "vin", duration: 150, vo: "Un vin des Côtes d'Auvergne ? On sublime votre cuvée.", render: () => <WineScene /> },
  {
    id: "terroir",
    duration: 170,
    vo: "Fromages, charcuteries, produits du terroir : on fait saliver vos clients.",
    render: () => <TerroirScene />,
  },
  { id: "restaurant", duration: 165, vo: "Restaurants : des menus animés pour vos écrans et vos réseaux.", render: () => <RestaurantScene /> },
  {
    id: "coiffeur",
    duration: 165,
    vo: "Coiffeurs et barbiers : des visuels élégants qui remplissent votre agenda.",
    render: () => <CoiffeurScene />,
  },
  { id: "sport", duration: 165, vo: "Salles de sport : de l'énergie, du rythme, et des offres qui claquent.", render: () => <GymScene /> },
  {
    id: "formats",
    duration: 190,
    vo: "Reels Instagram, écrans en vitrine, site web : un seul studio pour tous vos formats.",
    render: () => <FormatsScene />,
  },
  {
    id: "outro",
    duration: 240,
    vo: "Dôme Motion. Donnons vie à vos produits. Demandez votre devis gratuit.",
    render: (p) => <OutroScene instagram={p.instagram} website={p.website} />,
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PRESENTATIONS: TransitionPresentation<any>[] = [
  fade(),
  slide({ direction: "from-right" }),
  wipe({ direction: "from-left" }),
  slide({ direction: "from-bottom" }),
  fade(),
  wipe({ direction: "from-right" }),
  slide({ direction: "from-left" }),
  wipe({ direction: "from-top-left" }),
  fade(),
];

// Start frame of each scene on the final timeline (transitions overlap).
export const sceneStarts = () => {
  const starts: number[] = [];
  let t = 0;
  SCENES.forEach((s, i) => {
    starts.push(t);
    t += s.duration - (i < SCENES.length - 1 ? TRANSITION : 0);
  });
  return { starts, total: t };
};

export const DOME_DURATION = sceneStarts().total;

export const DomeShowreel: React.FC<Props> = (props) => {
  const { starts, total } = sceneStarts();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <TransitionSeries>
        {SCENES.flatMap((s, i) => {
          const items = [
            <TransitionSeries.Sequence key={s.id} durationInFrames={s.duration}>
              {s.render(props)}
            </TransitionSeries.Sequence>,
          ];
          if (i < SCENES.length - 1) {
            items.push(
              <TransitionSeries.Transition
                key={`${s.id}-t`}
                presentation={PRESENTATIONS[i % PRESENTATIONS.length]}
                timing={linearTiming({ durationInFrames: TRANSITION })}
              />,
            );
          }
          return items;
        })}
      </TransitionSeries>

      {props.showSubtitles
        ? SCENES.map((s, i) => (
            <Sequence key={s.id} from={starts[i]} durationInFrames={s.duration}>
              <Subtitle text={s.vo} start={12} end={s.duration - TRANSITION} />
            </Sequence>
          ))
        : null}

      {/* Sound */}
      <Audio
        src={staticFile("dome/musique.wav")}
        volume={(f) =>
          interpolate(f, [0, 20, total - 60, total], [0, 1, 1, 0], { extrapolateRight: "clamp" }) *
          (props.withVoice ? 0.32 : 0.6)
        }
      />
      <Sequence from={40}>
        <Audio src={staticFile("dome/hit.wav")} volume={0.7} />
      </Sequence>
      {starts.slice(1).map((st, i) => (
        <Sequence key={i} from={Math.max(0, st - 10)}>
          <Audio src={staticFile("dome/whoosh.wav")} volume={0.45} />
        </Sequence>
      ))}
      <Sequence from={starts[SCENES.length - 1] + 5}>
        <Audio src={staticFile("dome/hit.wav")} volume={0.6} />
      </Sequence>
      {props.withVoice
        ? SCENES.map((s, i) => (
            <Sequence key={s.id} from={starts[i] + 10}>
              <Audio src={staticFile(`dome/voix/${String(i + 1).padStart(2, "0")}.wav`)} />
            </Sequence>
          ))
        : null}
    </AbsoluteFill>
  );
};
