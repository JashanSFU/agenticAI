// "use client";

// import Link from "next/link";
// import {
//   MessageSquare,
//   Users,
//   UserPlus,
//   Calendar,
//   Bell,
//   FolderSearch,
//   Settings,
// } from "lucide-react";

// const ICON_MAP: Record<string, any> = {
//   "message-square": MessageSquare,
//   users: Users,
//   "user-plus": UserPlus,
//   calendar: Calendar,
//   bell: Bell,
//   "folder-search": FolderSearch,
//   settings: Settings,
// };

// interface SidebarItemProps {
//   href: string;
//   label: string;
//   icon: keyof typeof ICON_MAP;
// }

// export function SidebarItem({ href, label, icon }: SidebarItemProps) {
//   const Icon = ICON_MAP[icon];

//   return (
//     <Link
//       href={href}
//       className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent/50 transition-colors"
//     >
//       <Icon className="h-5 w-5 text-muted-foreground" />
//       <span className="text-sm font-medium">{label}</span>
//     </Link>
//   );
// }
"use client";

import Link from "next/link";
import {
  MessageSquare,
  Users,
  UserPlus,
  Calendar,
  Bell,
  FileSearch,
  Settings,
} from "lucide-react";

const ICON_MAP = {
  "message-square": MessageSquare,
  users: Users,
  "user-plus": UserPlus,
  calendar: Calendar,
  bell: Bell,
  "file-search": FileSearch,
  settings: Settings,
};

type IconName = keyof typeof ICON_MAP;

interface SidebarItemProps {
  href: string;
  label: string;
  icon: IconName;
}

export function SidebarItem({ href, label, icon }: SidebarItemProps) {
  const Icon = ICON_MAP[icon];

  if (!Icon) {
    console.error(`❌ Invalid icon name: ${icon}`);
    return null;
  }

  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent/50 transition-colors"
    >
      <Icon className="h-5 w-5 text-muted-foreground" />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}
