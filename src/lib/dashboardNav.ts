import LibraryBooksRoundedIcon from "@mui/icons-material/LibraryBooksRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";

export type DashboardNavItem = {
  label: string;
  href?: string;
  icon: any;
  action?: "logout";
};

export const dashboardNav: DashboardNavItem[] = [
  { label: "Upload Paper", href: "/dashboard/upload", icon: UploadFileRoundedIcon },
  { label: "Library", href: "/dashboard/library", icon: LibraryBooksRoundedIcon },
  { label: "AI Chat", href: "/dashboard/chat", icon: ChatRoundedIcon },
  { label: "Learn", href: "/dashboard/learn", icon: SchoolRoundedIcon },
  { label: "Knowledge Graph", href: "/dashboard/graph", icon: HubRoundedIcon },
  { label: "My Profile", href: "/dashboard/profile", icon: AccountCircleRoundedIcon },
  { label: "Logout", icon: LogoutRoundedIcon, action: "logout" },
];
