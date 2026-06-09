export interface NavLink {
  label: string;
  href: string;
  icon?: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Bảng xếp hạng', href: '/leaderboard' },
  { label: 'Diễn đàn', href: '/forum' },
  { label: 'Wiki', href: '/wiki' },
  { label: 'Vote', href: '/vote' },
  { label: 'Cửa hàng', href: '/store' },
  { label: 'Hỗ trợ', href: '/support' },
];
