export interface IAdBlockerConfig {
  /** Keep re-checking after the visitor claims to have disabled their blocker. */
  persistent: boolean;
  /** Remember a successful dismissal in localStorage so the modal stays gone. */
  persistSetting: boolean;
  title: string;
  howToTitle: string;
  description: string;
  btn1Title: string;
  btn2Title: string;
  goBackButtonTitle: string;
  howToImageURL: string;
  howToSteps: Array<{ title: string; description: string }>;
  /** When `persistent`, how long to wait before re-checking. Omit to re-check at once. */
  pollingTime?: number;
  initialInterval: number;
}

/**
 * The config after defaults have been applied: everything is present except
 * `pollingTime`, which is genuinely optional.
 */
export type ResolvedAdBlockerConfig = Required<
  Omit<IAdBlockerConfig, "pollingTime">
> &
  Pick<IAdBlockerConfig, "pollingTime">;

export interface IAdBlocker {
  config: Partial<IAdBlockerConfig>;
}
