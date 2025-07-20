export interface IAdBlockerConfig {
  persistent: boolean;
  persistSetting: boolean;
  title: string;
  howToTitle: string;
  description: string;
  btn1Title: string;
  btn2Title: string;
  howToSteps: Array<{ title: string; description: string }>;
  pollingTime?: number;
  initialInterval: number;
}

export interface IAdBlocker {
  config: Partial<IAdBlockerConfig>;
}
