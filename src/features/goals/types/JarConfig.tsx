import {
  AirplaneIcon,
  HouseIcon,
  CarIcon,
  DeviceMobileIcon,
  GameControllerIcon,
  BooksIcon,
  HeartIcon,
  BriefcaseIcon,
  GiftIcon,
  TreeIcon,
  RugIcon,
  DogIcon,
  GuitarIcon,
  BarbellIcon,
  PizzaIcon,
  RocketIcon,
  StarIcon,
  PiggyBankIcon,
} from "@phosphor-icons/react";

export type CoverOption = {
  id: string;
  label: string;
  style: string;
};

export type JarIconOption = {
  key: string;
  label: string;
  icon: React.ElementType;
};

export const COVERS: CoverOption[] = [
  {
    id: "aurora",
    label: "Aurora",
    style: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  {
    id: "sunset",
    label: "Pôr do Sol",
    style: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },
  {
    id: "ocean",
    label: "Oceano",
    style: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  },
  {
    id: "forest",
    label: "Floresta",
    style: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  },
  {
    id: "fire",
    label: "Fogo",
    style: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  },
  {
    id: "midnight",
    label: "Meia-Noite",
    style: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
  },
  {
    id: "peach",
    label: "Pêssego",
    style: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
  },
  {
    id: "lavender",
    label: "Lavanda",
    style: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  },
  {
    id: "grid",
    label: "Grade",
    style:
      "repeating-linear-gradient(0deg,transparent,transparent 24px,rgba(255,255,255,.08) 24px,rgba(255,255,255,.08) 25px),repeating-linear-gradient(90deg,transparent,transparent 24px,rgba(255,255,255,.08) 24px,rgba(255,255,255,.08) 25px), linear-gradient(135deg,#1a1a2e,#16213e)",
  },
  {
    id: "dots",
    label: "Dots",
    style:
      "radial-gradient(circle, rgba(255,255,255,.15) 1px, transparent 1px) 0 0 / 20px 20px, linear-gradient(135deg,#232526,#414345)",
  },
];

export const JAR_ICONS: JarIconOption[] = [
  { key: "airplane", label: "Viagem", icon: AirplaneIcon },
  { key: "house", label: "Casa", icon: HouseIcon },
  { key: "car", label: "Carro", icon: CarIcon },
  { key: "phone", label: "Celular", icon: DeviceMobileIcon },
  { key: "game", label: "Games", icon: GameControllerIcon },
  { key: "books", label: "Educação", icon: BooksIcon },
  { key: "heart", label: "Saúde", icon: HeartIcon },
  { key: "briefcase", label: "Negócio", icon: BriefcaseIcon },
  { key: "gift", label: "Presente", icon: GiftIcon },
  { key: "palm", label: "Férias", icon: TreeIcon },
  { key: "ring", label: "Casamento", icon: RugIcon },
  { key: "dog", label: "Pet", icon: DogIcon },
  { key: "guitar", label: "Música", icon: GuitarIcon },
  { key: "barbell", label: "Academia", icon: BarbellIcon },
  { key: "pizza", label: "Comida", icon: PizzaIcon },
  { key: "rocket", label: "Projeto", icon: RocketIcon },
  { key: "star", label: "Meta", icon: StarIcon },
  { key: "piggybank", label: "Poupança", icon: PiggyBankIcon },
];

export type JarIconKey = (typeof JAR_ICONS)[number]["key"];
