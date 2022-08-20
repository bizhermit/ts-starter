type ConfigValue = string | number | boolean | Array<ConfigValue> | { [key: string]: ConfigValue };
type Config<T = { [key: string]: ConfigValue }> = {
  appDirname: string;
  isDev: boolean;
  layout?: {
    color?: string;
    design?: string;
  };
} & T;

type ElectronAccessor = {
  fetch: <T = Struct>(path: string, params?: Struct, options?: RequestInit) => Promise<T>;
  setSize: (params: { width?: number; height?: number; animate?: boolean; }) => boolean;
  getSize: () => { height: number; width: number; };
  setAlwaysOnTop: (alwaysOnTop: boolean) => boolean;
  isAlwaysOnTop: () => boolean;
  minimize: () => { height: number; width: number; };
  unminimize: () => { height: number; width: number; };
  isMinimize: () => boolean;
  maximize: () => { height: number; width: number; };
  unmaximize: () => { height: number; width: number; };
  isMaximize: () => boolean;
  setFullScreen: (fullScreen: boolean) => boolean;
  isFullScreen: () => boolean;
  setOpacity: (opacity: number) => number;
  getOpacity: () => number;
  close: () => void;
  destory: () => void;
  focus: () => void;
  blur: () => void;
  hasFocus: () => boolean;
  notification: (title: string, options: NotificationOptions) => Promise<void>;
  setPosition: (params: { position: { x: number; y: number; } | "center" | "left-top" | "right-bottom"; animate?: boolean; }) => { x: number; y: number; };
  setLayoutColor: <T = string>(color: T) => Promise<T>;
  getLayoutColor: <T = string>() => T;
  setLayoutDesign: <T = string>(design: T) => Promise<T>;
  getLayoutDesign: <T = string>() => T;
  saveConfig: (config: { [key: string]: ConfigValue }) => Promise<void>;
  getConfig: <T = { [key: string]: ConfigValue }>(key?: string) => Config<T>;
  getSession: <T = string>(key?: string) => T;
  setSession: (key: string, value: any) => void;
  clearSession: (key: string) => void;
};