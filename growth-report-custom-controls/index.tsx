import { Index } from "solid-js";
import { dots } from "./data/world-dots";

/** @inspect color path="Brand/Primary" */
const brandColor = "#FFE100";

const brandPaint = (opacity = 1) => ({
  color: brandColor,
  opacity,
});

/** @inspect select options="Dark,Light,Brown,Green" path="Brand/Theme" */
const theme = "Dark";

const palettes = {
  Dark: { background: "#000000", text: "#FFFFFF", muted: "#7A7A7A", bar: "#FFFFFF", barOpacity: 0.18 },
  Light: { background: "#FFFFFF", text: "#000000", muted: "#8A8A8A", bar: "#000000", barOpacity: 0.12 },
  Brown: { background: "#14120B", text: "#EDECEC", muted: "#969592", bar: "#EDECEC", barOpacity: 0.16 },
  Green: { background: "#061A1C", text: "#FFFFFF", muted: "#9DABAD", bar: "#FFFFFF", barOpacity: 0.16 },
};

const palette = () => palettes[theme as keyof typeof palettes];

/** @inspect font path="Brand/Font" */
const projectFont = "Inter";

const typography = (size: number) => ({
  fontFamily: projectFont,
  fontSize: size,
});

/** @inspect select options="Global,Asia-Pacific,Europe,North America,EMEA" path="Metrics/Region" */
const region = "Global";

const regions = {
  Global: { growth: 24, directShare: 61.5, returns: 3.2, returnsUp: false, years: [42, 58, 51, 74, 88] },
  "Asia-Pacific": { growth: -12, directShare: 48.3, returns: 5.1, returnsUp: true, years: [92, 81, 68, 54, 41] },
  Europe: { growth: 19, directShare: 57.2, returns: 4.1, returnsUp: false, years: [82, 61, 44, 63, 85] },
  "North America": { growth: 22, directShare: 63.8, returns: 3.6, returnsUp: false, years: [48, 61, 55, 78, 90] },
  EMEA: { growth: 17, directShare: 54.9, returns: 4.4, returnsUp: false, years: [40, 50, 47, 63, 75] },
};

const metrics = () => regions[region as keyof typeof regions];

/** @inspect select options="English,Spanish,French" path="Localization/Language" */
const language = "English";

type Metrics = (typeof regions)["Global"];

const copy = {
  English: {
    mapWidth: 1240,
    mapTitle: "Regional performance",
    mapLine: (name: string, m: Metrics) =>
      `${name}: online revenue ${m.growth >= 0 ? "grew" : "fell"} ${Math.abs(m.growth)}% year over year, with direct orders at ${m.directShare}% of all sales.`,
    perYear: "year over year",
    regions: { Global: "Global", "Asia-Pacific": "Asia-Pacific", Europe: "Europe", "North America": "North America", EMEA: "EMEA" },
    width: 850,
    title: "Annual growth report",
    description: (m: Metrics) =>
      `Online revenue ${m.growth >= 0 ? "grew" : "fell"} ${Math.abs(m.growth)}% year over year. Direct orders now account for ${m.directShare}% of all sales, while the return rate ${m.returnsUp ? "rose" : "fell"} to ${m.returns}%.`,
  },
  Spanish: {
    mapWidth: 760,
    mapTitle: "Rendimiento regional",
    mapLine: (name: string, m: Metrics) =>
      `${name}: los ingresos online ${m.growth >= 0 ? "crecieron" : "cayeron"} un ${Math.abs(m.growth)}% interanual, con pedidos directos del ${m.directShare}% de las ventas.`,
    perYear: "interanual",
    regions: { Global: "Global", "Asia-Pacific": "Asia-Pacífico", Europe: "Europa", "North America": "Norteamérica", EMEA: "EMEA" },
    width: 1180,
    title: "Informe anual de crecimiento",
    description: (m: Metrics) =>
      `Los ingresos online ${m.growth >= 0 ? "crecieron" : "cayeron"} un ${Math.abs(m.growth)}% interanual. Los pedidos directos ya representan el ${m.directShare}% de las ventas totales, mientras que la tasa de devoluciones ${m.returnsUp ? "subió" : "bajó"} al ${m.returns}%.`,
  },
  French: {
    mapWidth: 820,
    mapTitle: "Performance régionale",
    mapLine: (name: string, m: Metrics) =>
      `${name} : le chiffre d'affaires en ligne a ${m.growth >= 0 ? "progressé" : "reculé"} de ${Math.abs(m.growth)}% sur un an, avec ${m.directShare}% de commandes directes.`,
    perYear: "sur un an",
    regions: { Global: "Mondial", "Asia-Pacific": "Asie-Pacifique", Europe: "Europe", "North America": "Amérique du Nord", EMEA: "EMEA" },
    width: 1290,
    title: "Rapport annuel de croissance",
    description: (m: Metrics) =>
      `Le chiffre d'affaires en ligne a ${m.growth >= 0 ? "progressé" : "reculé"} de ${Math.abs(m.growth)}% sur un an. Les commandes directes représentent désormais ${m.directShare}% des ventes totales, tandis que le taux de retours ${m.returnsUp ? "est monté" : "est tombé"} à ${m.returns}%.`,
  },
};

const text = () => copy[language as keyof typeof copy];

/** @inspect select options="Gallery and Stats,Gallery,Stats" path="Scene Layout/Show" */
const sceneLayout = "Gallery and Stats";

const showGallery = () => (sceneLayout as string) !== "Stats";
const showStats = () => (sceneLayout as string) !== "Gallery";

/** @inspect select options="All Categories,Bags,Shoes,Outerwear,Accessories" path="Imagery/Collection" */
const imagery = "All Categories";



const collections = {
  "All Categories": [
    "Product Shots/AW26-OUT-001_wool-coat.jpg",
    "Product Shots/AW26-BAG-001_leather-tote.jpg",
    "Product Shots/AW26-KNT-001_knit-sweater.jpg",
    "Product Shots/AW26-OUT-002_oversized-blazer.jpg",
    "Product Shots/AW26-SHO-001_leather-sneaker.jpg",
    "Product Shots/AW26-SHT-001_linen-shirt.jpg",
    "Product Shots/AW26-KNT-002_turtleneck-pleated-skirt.jpg",
    "Product Shots/AW26-ACC-001_accessories-flatlay.jpg",
    "Product Shots/AW26-BAG-002_crossbody-bag.jpg",
    "Product Shots/AW26-SHO-002_chelsea-boot.jpg",
    "Product Shots/AW26-OUT-003_trench-coat.jpg",
    "Product Shots/AW26-ACC-002_metal-frame-sunglasses.jpg",
    "Product Shots/AW26-BAG-003_canvas-backpack.jpg",
    "Product Shots/AW26-SHO-003_suede-loafer.jpg",
    "Product Shots/AW26-OUT-004_puffer-jacket.jpg",
    "Product Shots/AW26-ACC-003_leather-belt.jpg",
    "Product Shots/AW26-BAG-004_leather-clutch.jpg",
    "Product Shots/AW26-SHO-004_heeled-sandal.jpg",
    "Product Shots/AW26-OUT-005_biker-jacket.jpg",
    "Product Shots/AW26-ACC-004_leather-strap-watch.jpg",
    "Product Shots/AW26-BAG-005_weekender.jpg",
    "Product Shots/AW26-SHO-005_derby.jpg",
    "Product Shots/AW26-OUT-006_wool-parka.jpg",
    "Product Shots/AW26-ACC-005_silk-scarf.jpg",
    "Product Shots/AW26-BAG-006_bucket-bag.jpg",
    "Product Shots/AW26-SHO-006_white-trainer.jpg",
    "Product Shots/AW26-ACC-006_wool-cap.jpg",
    "Product Shots/AW26-OUT-007_denim-jacket.jpg",
    "Product Shots/AW26-BAG-007_saddle-bag.jpg",
    "Product Shots/AW26-SHO-007_hiking-boot.jpg",
    "Product Shots/AW26-ACC-007_leather-wallet.jpg",
    "Product Shots/AW26-OUT-008_wool-cape.jpg",
    "Product Shots/AW26-BAG-008_briefcase.jpg",
    "Product Shots/AW26-SHO-008_ballet-flat.jpg",
    "Product Shots/AW26-ACC-008_wool-beanie.jpg",
    "Product Shots/AW26-OUT-009_bomber-jacket.jpg",
    "Product Shots/AW26-BAG-009_belt-bag.jpg",
    "Product Shots/AW26-SHO-009_slide-sandal.jpg",
    "Product Shots/AW26-ACC-009_leather-gloves.jpg",
    "Product Shots/AW26-OUT-010_mac-coat.jpg",
    "Product Shots/AW26-BAG-010_mini-top-handle.jpg",
    "Product Shots/AW26-SHO-010_high-top-sneaker.jpg",
    "Product Shots/AW26-ACC-010_knit-scarf.jpg",
    "Product Shots/AW26-OUT-011_shearling-jacket.jpg",
    "Product Shots/AW26-BAG-011_drawstring-bag.jpg",
    "Product Shots/AW26-SHO-011_brogue.jpg",
    "Product Shots/AW26-ACC-011_bracelet.jpg",
    "Product Shots/AW26-OUT-012_cardigan-coat.jpg",
    "Product Shots/AW26-BAG-012_shoulder-bag.jpg",
    "Product Shots/AW26-SHO-012_mule.jpg",
    "Product Shots/AW26-ACC-012_bucket-hat.jpg",
    "Product Shots/AW26-OUT-013_peacoat.jpg",
    "Product Shots/AW26-BAG-013_hobo-bag.jpg",
    "Product Shots/AW26-SHO-013_pump.jpg",
    "Product Shots/AW26-ACC-013_knit-tie.jpg",
    "Product Shots/AW26-OUT-014_gilet.jpg",
    "Product Shots/AW26-BAG-014_doctor-bag.jpg",
    "Product Shots/AW26-SHO-014_ankle-strap-heel.jpg",
    "Product Shots/AW26-ACC-014_socks.jpg",
    "Product Shots/AW26-OUT-015_raincoat.jpg",
    "Product Shots/AW26-BAG-015_messenger-bag.jpg",
    "Product Shots/AW26-SHO-015_espadrille.jpg",
    "Product Shots/AW26-ACC-015_cardholder.jpg",
    "Product Shots/AW26-OUT-016_varsity-jacket.jpg",
    "Product Shots/AW26-BAG-016_phone-pouch.jpg",
    "Product Shots/AW26-SHO-016_running-shoe.jpg",
    "Product Shots/AW26-ACC-016_earrings.jpg",
    "Product Shots/AW26-OUT-017_chore-jacket.jpg",
    "Product Shots/AW26-BAG-017_basket-bag.jpg",
    "Product Shots/AW26-SHO-017_knee-high-boot.jpg",
    "Product Shots/AW26-ACC-017_umbrella.jpg",
    "Product Shots/AW26-OUT-018_overshirt.jpg",
    "Product Shots/AW26-BAG-018_laptop-sleeve.jpg",
    "Product Shots/AW26-SHO-018_fisherman-sandal.jpg",
    "Product Shots/AW26-ACC-018_fedora.jpg",
    "Product Shots/AW26-OUT-019_teddy-coat.jpg",
    "Product Shots/AW26-BAG-019_camera-bag.jpg",
    "Product Shots/AW26-SHO-019_monk-strap.jpg",
    "Product Shots/AW26-ACC-019_phone-case.jpg",
    "Product Shots/AW26-OUT-020_windbreaker.jpg",
    "Product Shots/AW26-BAG-020_nylon-shopper.jpg",
    "Product Shots/AW26-SHO-020_house-slipper.jpg",
    "Product Shots/AW26-ACC-020_necklace.jpg",
  ],
  Bags: [
    "Product Shots/AW26-BAG-001_leather-tote.jpg",
    "Product Shots/AW26-BAG-002_crossbody-bag.jpg",
    "Product Shots/AW26-BAG-003_canvas-backpack.jpg",
    "Product Shots/AW26-BAG-004_leather-clutch.jpg",
    "Product Shots/AW26-BAG-005_weekender.jpg",
    "Product Shots/AW26-BAG-006_bucket-bag.jpg",
    "Product Shots/AW26-BAG-007_saddle-bag.jpg",
    "Product Shots/AW26-BAG-008_briefcase.jpg",
    "Product Shots/AW26-BAG-009_belt-bag.jpg",
    "Product Shots/AW26-BAG-010_mini-top-handle.jpg",
    "Product Shots/AW26-BAG-011_drawstring-bag.jpg",
    "Product Shots/AW26-BAG-012_shoulder-bag.jpg",
    "Product Shots/AW26-BAG-013_hobo-bag.jpg",
    "Product Shots/AW26-BAG-014_doctor-bag.jpg",
    "Product Shots/AW26-BAG-015_messenger-bag.jpg",
    "Product Shots/AW26-BAG-016_phone-pouch.jpg",
    "Product Shots/AW26-BAG-017_basket-bag.jpg",
    "Product Shots/AW26-BAG-018_laptop-sleeve.jpg",
    "Product Shots/AW26-BAG-019_camera-bag.jpg",
    "Product Shots/AW26-BAG-020_nylon-shopper.jpg",
  ],
  Shoes: [
    "Product Shots/AW26-SHO-001_leather-sneaker.jpg",
    "Product Shots/AW26-SHO-002_chelsea-boot.jpg",
    "Product Shots/AW26-SHO-003_suede-loafer.jpg",
    "Product Shots/AW26-SHO-004_heeled-sandal.jpg",
    "Product Shots/AW26-SHO-005_derby.jpg",
    "Product Shots/AW26-SHO-006_white-trainer.jpg",
    "Product Shots/AW26-SHO-007_hiking-boot.jpg",
    "Product Shots/AW26-SHO-008_ballet-flat.jpg",
    "Product Shots/AW26-SHO-009_slide-sandal.jpg",
    "Product Shots/AW26-SHO-010_high-top-sneaker.jpg",
    "Product Shots/AW26-SHO-011_brogue.jpg",
    "Product Shots/AW26-SHO-012_mule.jpg",
    "Product Shots/AW26-SHO-013_pump.jpg",
    "Product Shots/AW26-SHO-014_ankle-strap-heel.jpg",
    "Product Shots/AW26-SHO-015_espadrille.jpg",
    "Product Shots/AW26-SHO-016_running-shoe.jpg",
    "Product Shots/AW26-SHO-017_knee-high-boot.jpg",
    "Product Shots/AW26-SHO-018_fisherman-sandal.jpg",
    "Product Shots/AW26-SHO-019_monk-strap.jpg",
    "Product Shots/AW26-SHO-020_house-slipper.jpg",
  ],
  Outerwear: [
    "Product Shots/AW26-OUT-001_wool-coat.jpg",
    "Product Shots/AW26-OUT-002_oversized-blazer.jpg",
    "Product Shots/AW26-OUT-003_trench-coat.jpg",
    "Product Shots/AW26-OUT-004_puffer-jacket.jpg",
    "Product Shots/AW26-OUT-005_biker-jacket.jpg",
    "Product Shots/AW26-OUT-006_wool-parka.jpg",
    "Product Shots/AW26-OUT-007_denim-jacket.jpg",
    "Product Shots/AW26-OUT-008_wool-cape.jpg",
    "Product Shots/AW26-OUT-009_bomber-jacket.jpg",
    "Product Shots/AW26-OUT-010_mac-coat.jpg",
    "Product Shots/AW26-OUT-011_shearling-jacket.jpg",
    "Product Shots/AW26-OUT-012_cardigan-coat.jpg",
    "Product Shots/AW26-OUT-013_peacoat.jpg",
    "Product Shots/AW26-OUT-014_gilet.jpg",
    "Product Shots/AW26-OUT-015_raincoat.jpg",
    "Product Shots/AW26-OUT-016_varsity-jacket.jpg",
    "Product Shots/AW26-OUT-017_chore-jacket.jpg",
    "Product Shots/AW26-OUT-018_overshirt.jpg",
    "Product Shots/AW26-OUT-019_teddy-coat.jpg",
    "Product Shots/AW26-OUT-020_windbreaker.jpg",
  ],
  Accessories: [
    "Product Shots/AW26-ACC-001_accessories-flatlay.jpg",
    "Product Shots/AW26-ACC-002_metal-frame-sunglasses.jpg",
    "Product Shots/AW26-ACC-003_leather-belt.jpg",
    "Product Shots/AW26-ACC-004_leather-strap-watch.jpg",
    "Product Shots/AW26-ACC-005_silk-scarf.jpg",
    "Product Shots/AW26-ACC-006_wool-cap.jpg",
    "Product Shots/AW26-ACC-007_leather-wallet.jpg",
    "Product Shots/AW26-ACC-008_wool-beanie.jpg",
    "Product Shots/AW26-ACC-009_leather-gloves.jpg",
    "Product Shots/AW26-ACC-010_knit-scarf.jpg",
    "Product Shots/AW26-ACC-011_bracelet.jpg",
    "Product Shots/AW26-ACC-012_bucket-hat.jpg",
    "Product Shots/AW26-ACC-013_knit-tie.jpg",
    "Product Shots/AW26-ACC-014_socks.jpg",
    "Product Shots/AW26-ACC-015_cardholder.jpg",
    "Product Shots/AW26-ACC-016_earrings.jpg",
    "Product Shots/AW26-ACC-017_umbrella.jpg",
    "Product Shots/AW26-ACC-018_fedora.jpg",
    "Product Shots/AW26-ACC-019_phone-case.jpg",
    "Product Shots/AW26-ACC-020_necklace.jpg",
  ],
};

const images = () => collections[imagery as keyof typeof collections];

/** @inspect select options="Grid,Row" path="Gallery Component/Layout" */
const layout = "Grid";

/** @inspect number path="Gallery Component/Count" min=1 max=20 step=1 */
const imageCount = 6;

/** @inspect number path="Gallery Component/Duration" min=0.5 max=5 step=0.1 */
const secondsPerImage = 1.5;

/** @inspect boolean path="Gallery Component/Stagger" */
const stagger = true;

const lead = () => secondsPerImage * 0.5;
const revealSpread = 1;
const rowTilt = 1.4;
const distance = (i: number) => (i % columns()) + Math.floor(i / columns()) * rowTilt;
const farthest = () => Math.max(...Array.from({ length: shown() }, (_, i) => distance(i)), 0.001);
const delay = (i: number) =>
  lead() + (stagger ? (distance(i) / farthest()) * secondsPerImage * revealSpread : i * secondsPerImage);
const lastStart = () => (stagger ? secondsPerImage * revealSpread : Math.max(shown() - 1, 0) * secondsPerImage);
const galleryEnd = () => lead() + lastStart() + secondsPerImage + 2;

const gallerySources = () => Array.from({ length: imageCount }, (_, i) => images()[i % images().length]);

/** @inspect text path="Highlight Words/Regex" */
const pattern = "\\b\\d+(?:\\.\\d+)?%";

const findHighlights = (text: string) => {
  try {
    return [...text.matchAll(new RegExp(pattern, "g"))];
  } catch {
    return [];
  }
};

const margin = 120;
const bottom = 1000;
const gapX = 20;
const gapY = 20;

const galleryTopLimit = 360;

const galleryWidth = () => (showStats() ? 940 : 1920 - margin * 2);
const galleryHeight = () => bottom - galleryTopLimit;
const aspect = () => (showStats() ? 2 / 3 : 9 / 16);
const shown = () => imageCount;

const fit = () => {
  const count = shown();
  if ((layout as string) === "Row") {
    const width = (galleryWidth() - gapX * (count - 1)) / count;
    return { columns: count, width, height: width * aspect() };
  }
  const candidates = [];
  for (let columns = 1; columns <= count; columns++) {
    const rows = Math.ceil(count / columns);
    const byWidth = (galleryWidth() - gapX * (columns - 1)) / columns;
    const byHeight = (galleryHeight() - gapY * (rows - 1)) / rows / aspect();
    const width = Math.min(byWidth, byHeight);
    candidates.push({ columns, width, height: width * aspect(), span: columns * width + gapX * (columns - 1) });
  }
  const largest = Math.max(...candidates.map((c) => c.width));
  return candidates
    .filter((c) => c.width >= largest * 0.85)
    .reduce((best, c) => (c.span > best.span ? c : best));
};

const columns = () => fit().columns;
const rows = () => Math.ceil(shown() / columns());
const cellWidth = () => fit().width;
const cellHeight = () => fit().height;
const galleryTop = () => bottom - (rows() * cellHeight() + (rows() - 1) * gapY);

const position = (index: number) => ({
  x: (index % columns()) * (cellWidth() + gapX),
  y: Math.floor(index / columns()) * (cellHeight() + gapY),
});

const chartWidth = () => (showGallery() ? 620 : 1920 - margin * 2);
const barWidth = () => (showGallery() ? 100 : 280);
const barStep = () => (showGallery() ? 130 : 350);
const chartMax = () => (showGallery() ? 360 : 520);
const barScale = () => chartMax() / Math.max(...metrics().years);

const yearLabels = ["2021", "2022", "2023", "2024", "2025"];

const mapBox = { x: margin, y: 340, width: 1680, height: 653 };
const project = (lon: number, lat: number) => ({
  x: ((lon + 180) / 360) * mapBox.width,
  y: ((84 - lat) / 140) * mapBox.height,
});

const regionKeys = { Global: "all", "North America": "na", Europe: "eu", EMEA: "emea", "Asia-Pacific": "apac" };

const memberOf = (lon: number, lat: number) => {
  const keys = ["all"];
  if (lon >= -170 && lon <= -52 && lat >= 15) keys.push("na");
  if (lon >= -25 && lon <= 45 && lat >= 36 && lat <= 72) keys.push("eu");
  if (lon >= -25 && lon <= 62 && lat >= -36 && lat <= 72) keys.push("emea");
  if (lon >= 62) keys.push("apac");
  return keys;
};

const mapDots = dots.map(([lon, lat]) => {
  const { x, y } = project(lon, lat);
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, cls: memberOf(lon, lat).map((k) => `r-${k}`).join(" ") };
});

const regionKey = () => regionKeys[region as keyof typeof regionKeys];

const anchors = {
  Global: { lon: -38, lat: 8 },
  "Asia-Pacific": { lon: 104, lat: 34 },
  Europe: { lon: 12, lat: 50 },
  "North America": { lon: -98, lat: 42 },
  EMEA: { lon: 20, lat: 18 },
};

const anchor = () => project(anchors[region as keyof typeof anchors].lon, anchors[region as keyof typeof anchors].lat);
const regionName = () => text().regions[region as keyof typeof anchors];
const growthLabel = () => `${metrics().growth >= 0 ? "+" : "\u2212"}${Math.abs(metrics().growth)}%`;

export default function Project() {
  const duration = () => galleryEnd();
  const description = () => text().description(metrics());
  const latest = yearLabels.length - 1;
  const barHeight = (i: number) => metrics().years[i] * barScale();
  const barDelay = (i: number) => lead() + i * secondsPerImage * 0.15;

  return (
    <stage background="#161616" id="umix9l">
      <scene id="report" name="E-Commerce Growth Report" width={1920} height={1080} fill={palette().background} x={0} y={0} active>
        <text name="Title" x={120} y={104} width={880} color={palette().text} fontWeight={600} end={duration()} {...typography(56)} id="54w458">
          {text().title}
          <keyframeTrack property="opacity" id="6zmac5">
            <keyframe time={0} value={0} easing="cubicBezier(0.4,0,0.2,1)" id="p4w65c" />
            <keyframe time={secondsPerImage * 0.8} value={1} id="vvno4s" />
          </keyframeTrack>
          <keyframeTrack property="offsetY" id="ixj7yc">
            <keyframe time={0} value={24} easing="cubicBezier(0,0.6,0.4,1)" id="0mgp4w" />
            <keyframe time={secondsPerImage * 0.8} value={0} id="us8jz4" />
          </keyframeTrack>
        </text>

        <text
          name="Description"
          x={120}
          y={200}
          width={text().width}
          color={palette().text}
          leading={1.5}
          end={duration()}
          {...typography(30)} id="5jh21a"
        >
          {description()}
          {findHighlights(description()).map((match) => (
            <textRange start={match.index} end={match.index + match[0].length} color={brandColor} fontWeight={600} id="5hpfn9" />
          ))}
          <keyframeTrack property="opacity" id="cz64em">
            <keyframe time={secondsPerImage * 0.2} value={0} easing="cubicBezier(0.4,0,0.2,1)" id="3zd4uz" />
            <keyframe time={secondsPerImage} value={1} id="h9wss3" />
          </keyframeTrack>
          <keyframeTrack property="offsetY" id="7501te">
            <keyframe time={secondsPerImage * 0.2} value={24} easing="cubicBezier(0,0.6,0.4,1)" id="thqszs" />
            <keyframe time={secondsPerImage} value={0} id="mdmvtv" />
          </keyframeTrack>
        </text>

        <group name="Chart" x={showGallery() ? 1160 : margin} y={540} hidden={!showStats()} id="h37tuu">
          <rect name="Baseline" y={420} width={chartWidth()} height={1} fill={palette().bar} opacity={0.25} end={duration()} id="x2i952">
            <keyframeTrack property="opacity" id="obl6b5">
              <keyframe time={lead()} value={0} easing="cubicBezier(0.4,0,0.2,1)" id="k5qpg7" />
              <keyframe time={lead() + secondsPerImage * 0.4} value={0.25} id="nuohqt" />
            </keyframeTrack>
          </rect>
          {yearLabels.map((label, i) => (
            <group name={label} x={i * barStep()} id="4pa1wf">
              <rect name="Bar" y={420 - barHeight(i)} width={barWidth()} height={barHeight(i)} end={duration()} id="fha76j">
                {i === latest ? (
                  <solidPaint {...brandPaint()} id="7b2u53" />
                ) : (
                  <solidPaint color={palette().bar} opacity={palette().barOpacity} id="sskybx" />
                )}
                <keyframeTrack property="height" id="zu2z85">
                  <keyframe time={barDelay(i)} value={0} easing="cubicBezier(0,0.6,0.4,1)" id="9uy9fc" />
                  <keyframe time={barDelay(i) + secondsPerImage} value={barHeight(i)} id="tpdo5h" />
                </keyframeTrack>
                <keyframeTrack property="y" id="1uc8kv">
                  <keyframe time={barDelay(i)} value={420} easing="cubicBezier(0,0.6,0.4,1)" id="b110r6" />
                  <keyframe time={barDelay(i) + secondsPerImage} value={420 - barHeight(i)} id="e8sga9" />
                </keyframeTrack>
              </rect>
              <text
                name="Value"
                y={420 - barHeight(i) - 40}
                width={barWidth()}
                height={30}
                textAlign="center"
                color={i === latest ? brandColor : palette().text}
                fontWeight={500}
                end={duration()}
                {...typography(22)} id="94cq1q"
              >
                {`${metrics().years[i]}%`}
                <keyframeTrack property="opacity" id="1o1wcn">
                  <keyframe time={barDelay(i) + secondsPerImage * 0.5} value={0} easing="cubicBezier(0,0.6,0.4,1)" id="owejwp" />
                  <keyframe time={barDelay(i) + secondsPerImage * 0.9} value={1} id="ocojzx" />
                </keyframeTrack>
                <keyframeTrack property="offsetY" id="07akeq">
                  <keyframe time={barDelay(i) + secondsPerImage * 0.5} value={16} easing="cubicBezier(0,0.6,0.4,1)" id="dd8a4f" />
                  <keyframe time={barDelay(i) + secondsPerImage * 0.9} value={0} id="bugazl" />
                </keyframeTrack>
              </text>
              <text name="Label" y={440} width={barWidth()} height={26} textAlign="center" color={palette().muted} end={duration()} {...typography(20)} id="vofilf">
                {label}
                <keyframeTrack property="opacity" id="ec4awe">
                  <keyframe time={barDelay(i)} value={0} easing="cubicBezier(0.4,0,0.2,1)" id="4xjx63" />
                  <keyframe time={barDelay(i) + secondsPerImage * 0.4} value={1} id="p095j9" />
                </keyframeTrack>
              </text>
            </group>
          ))}
        </group>

        <group name="Gallery" x={margin} y={galleryTop()} hidden={!showGallery()} id="z8m5cf">
          <Index each={gallerySources()}>
            {(src, i) => (
              <image src={src()} {...position(i)} width={cellWidth()} height={cellHeight()} cornerRadius={4} start={delay(i)} end={galleryEnd()} id="6cs003">
                <effect type="grayscale" value={1} id="gwtvul" />
                <keyframeTrack property="opacity" id="kz5wke">
                  <keyframe time={0} value={0} easing={stagger ? "cubicBezier(0.4,0,0.2,1)" : "linear"} id="0pvqls" />
                  <keyframe time={secondsPerImage} value={1} id="pxq3u6" />
                </keyframeTrack>
                <keyframeTrack property="offsetY" id="j8xfmm">
                  <keyframe time={0} value={stagger ? 40 : 0} easing="cubicBezier(0,0.6,0.4,1)" id="z0zqbn" />
                  <keyframe time={secondsPerImage} value={0} id="e5tieq" />
                </keyframeTrack>
              </image>
            )}
          </Index>
        </group>
      </scene>

      <scene id="map" name="Regional Performance" width={1920} height={1080} x={2100} fill={palette().background} y={0}>
        <text name="Title" x={120} y={104} width={880} color={palette().text} fontWeight={600} end={duration()} {...typography(56)} id="00c7qc">
          {text().mapTitle}
          <keyframeTrack property="opacity" id="zy5dv8">
            <keyframe time={0} value={0} easing="cubicBezier(0.4,0,0.2,1)" id="ahopar" />
            <keyframe time={secondsPerImage * 0.8} value={1} id="45xj9j" />
          </keyframeTrack>
          <keyframeTrack property="offsetY" id="r835zo">
            <keyframe time={0} value={24} easing="cubicBezier(0,0.6,0.4,1)" id="7g7h1f" />
            <keyframe time={secondsPerImage * 0.8} value={0} id="qctkuj" />
          </keyframeTrack>
        </text>

        <text name="Description" x={120} y={200} width={text().mapWidth} color={palette().text} leading={1.5} end={duration()} {...typography(30)} id="dtihw1">
          {text().mapLine(regionName(), metrics())}
          {findHighlights(text().mapLine(regionName(), metrics())).map((match) => (
            <textRange start={match.index} end={match.index + match[0].length} color={brandColor} fontWeight={600} id="hb3i1x" />
          ))}
          <keyframeTrack property="opacity" id="cibvqi">
            <keyframe time={secondsPerImage * 0.2} value={0} easing="cubicBezier(0.4,0,0.2,1)" id="zuonpr" />
            <keyframe time={secondsPerImage} value={1} id="81jmx5" />
          </keyframeTrack>
          <keyframeTrack property="offsetY" id="fpxtgw">
            <keyframe time={secondsPerImage * 0.2} value={24} easing="cubicBezier(0,0.6,0.4,1)" id="1wwgee" />
            <keyframe time={secondsPerImage} value={0} id="ku4kms" />
          </keyframeTrack>
        </text>

        <group name="World" id="w89mme">
          <html x={mapBox.x} y={mapBox.y} width={mapBox.width} height={mapBox.height} end={duration()} id="7d7ua8">
            <style>{`.world circle { fill: ${palette().bar}; fill-opacity: 0.22; }`}</style>
            <svg class="world" width={mapBox.width} height={mapBox.height} viewBox={`0 0 ${mapBox.width} ${mapBox.height}`}>
              {mapDots.map((d) => (
                <circle cx={d.x} cy={d.y} r={3.4} />
              ))}
            </svg>
          </html>
          <keyframeTrack property="opacity" id="893z3p">
            <keyframe time={lead()} value={0} easing="cubicBezier(0.4,0,0.2,1)" id="52jkmz" />
            <keyframe time={lead() + secondsPerImage} value={1} id="75ekj2" />
          </keyframeTrack>
        </group>

        <group name="Region" id="oqmmra">
          <html x={mapBox.x} y={mapBox.y} width={mapBox.width} height={mapBox.height} end={duration()} id="0c8sd6">
            <style>{`.lit circle { display: none; } .lit .r-${regionKey()} { display: inline; fill: ${brandColor}; }`}</style>
            <svg class="lit" width={mapBox.width} height={mapBox.height} viewBox={`0 0 ${mapBox.width} ${mapBox.height}`}>
              {mapDots.map((d) => (
                <circle class={d.cls} cx={d.x} cy={d.y} r={3.4} />
              ))}
            </svg>
          </html>
          <keyframeTrack property="opacity" id="vim14d">
            <keyframe time={lead() + secondsPerImage * 0.4} value={0} easing="cubicBezier(0.4,0,0.2,1)" id="ldwcfn" />
            <keyframe time={lead() + secondsPerImage * (stagger ? 0.6 : 1.4)} value={1} id="43g7h6" />
          </keyframeTrack>
          <rect mask x={mapBox.x} y={mapBox.y} height={mapBox.height} id="qnagqn">
            <keyframeTrack property="width" id="fymnsu">
              <keyframe time={lead() + secondsPerImage * 0.4} value={stagger ? 0 : mapBox.width} easing="cubicBezier(0.4,0,0.2,1)" id="r4n8eg" />
              <keyframe time={lead() + secondsPerImage * 1.6} value={mapBox.width} id="ifaxf3" />
            </keyframeTrack>
          </rect>
        </group>

        {region !== "Global" && (
        <group name="Callout" x={mapBox.x + anchor().x} y={mapBox.y + anchor().y} id="ae3wra">
          <rect name="Ring" x={-22} y={-22} width={44} height={44} cornerRadius={22} end={duration()} id="futzar">
            <stroke color={brandColor} width={2} opacity={0.5} id="z7tt90" />
            <keyframeTrack property="scale" id="lbyrlb">
              <keyframe time={lead() + secondsPerImage * 1.2} value={0.4} easing="cubicBezier(0,1,0,1)" id="5usz05" />
              <keyframe time={lead() + secondsPerImage * 2} value={1} id="6ucw5y" />
            </keyframeTrack>
            <keyframeTrack property="opacity" id="hhatu9">
              <keyframe time={lead() + secondsPerImage * 1.2} value={0} id="a3os3m" />
              <keyframe time={lead() + secondsPerImage * 1.5} value={1} id="b31isd" />
            </keyframeTrack>
          </rect>
          <rect name="Marker" x={-8} y={-8} width={16} height={16} cornerRadius={8} end={duration()} id="5tlctu">
            <solidPaint {...brandPaint()} id="rxsw74" />
            <keyframeTrack property="opacity" id="d5b1az">
              <keyframe time={lead() + secondsPerImage * 1.1} value={0} easing="cubicBezier(0.4,0,0.2,1)" id="iwy8s4" />
              <keyframe time={lead() + secondsPerImage * 1.4} value={1} id="l9wpgx" />
            </keyframeTrack>
          </rect>
        </group>
        )}

        <group name="Figure" x={margin} y={806} id="zaqdrj">
          <text name="Region" color={palette().muted} fontWeight={500} end={duration()} {...typography(24)} id="kqad02">
            {regionName()}
          </text>
          <text name="Growth" y={30} fontWeight={700} end={duration()} {...typography(88)} id="nassoe">
            {growthLabel()}
            <solidPaint {...brandPaint()} id="trzic1" />
          </text>
          <text name="Per year" y={138} color={palette().text} end={duration()} {...typography(24)} id="mg68cf">
            {text().perYear}
          </text>
          <keyframeTrack property="opacity" id="89ue39">
            <keyframe time={lead() + secondsPerImage * 1.3} value={0} easing="cubicBezier(0.4,0,0.2,1)" id="7dvj29" />
            <keyframe time={lead() + secondsPerImage * 2} value={1} id="0lh4rg" />
          </keyframeTrack>
          <keyframeTrack property="offsetY" id="hu8tps">
            <keyframe time={lead() + secondsPerImage * 1.3} value={24} easing="cubicBezier(0,0.6,0.4,1)" id="4su2dm" />
            <keyframe time={lead() + secondsPerImage * 2} value={0} id="6kls2h" />
          </keyframeTrack>
        </group>
      </scene>
    </stage>
  );
}
