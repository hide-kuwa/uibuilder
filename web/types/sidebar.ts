export type RouteId = string; // 例: "/builder"

export type MenuNode = {
  id: RouteId;
  label: string;
  href: string;
  children?: MenuNode[];
  hidden?: boolean;
  icon?: string;
};

export type OverlayNode = {
  ref: RouteId;             // 自動ノードの参照（href と同じ）
  label?: string;           // ラベル上書き
  hidden?: boolean;
  children?: OverlayNode[]; // 再親化＆並び替え
};

export type SidebarPreset = {
  id: string;
  name: string;
  mode: 'auto+overlay' | 'manual';
  include?: RouteId[];      // 自動から許可（空=全許可）
  exclude?: RouteId[];      // 非表示
  overlay?: OverlayNode[];  // 手動オーバーレイ
  rootHidden?: boolean;     // サイドバー自体の表示/非表示
};
