import {
  ArrowRightIcon,
  BellIcon,
  BookOpenIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  CommandIcon,
  CreditCardIcon,
  FileTextIcon,
  GlobeIcon,
  HelpCircleIcon,
  KeyboardIcon,
  LogOutIcon,
  MessageCircleIcon,
  MoonIcon,
  PaletteIcon,
  PauseIcon,
  PhoneIcon,
  PlayIcon,
  PlusIcon,
  SettingsIcon,
  SmartphoneIcon,
  StarIcon,
  SunIcon,
  TargetIcon,
  TimerIcon,
  TrendingUpIcon,
  UserIcon,
  UsersIcon,
  ZapIcon,
} from "lucide-react";
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Progress } from "./ui/progress";

interface UserDropdownMenuProps {
  user: {
    name: string;
    email: string;
    avatar: string;
    initials: string;
  };
}

export const UserDropdownMenu: React.FC<UserDropdownMenuProps> = ({ user }) => {
  const [status, setStatus] = useState("active");
  const [theme, setTheme] = useState("light");
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [timerTime, setTimerTime] = useState("02:34:12");

  const statusOptions = [
    { value: "active", label: "Active", icon: "🟢" },
    { value: "meeting", label: "In a Meeting", icon: "🟡" },
    { value: "dnd", label: "Do Not Disturb", icon: "🔴" },
    { value: "away", label: "Away", icon: "⏰" },
    { value: "custom", label: "Set custom status...", icon: "✏️" },
  ];

  const themeOptions = [
    { value: "light", label: "Light", icon: <SunIcon className="w-4 h-4" /> },
    { value: "dark", label: "Dark", icon: <MoonIcon className="w-4 h-4" /> },
    { value: "system", label: "System", icon: "🔄" },
  ];

  const workspaces = [
    { name: "Personal Workspace", active: true },
    { name: "Marketing Team", active: false },
    { name: "Dev Team", active: false },
  ];

  const recentItems = [
    { name: "Website Redesign Project", icon: "📁", type: "project" },
    { name: "Fix Navigation Bug", icon: "✅", type: "task" },
    { name: "Q4 Report", icon: "📊", type: "document" },
  ];

  const recentCollaborators = [
    { name: "Sarah", avatar: "https://c.animaapp.com/mfanfvhybs8RPw/img/display-picture.png", action: "Message" },
    { name: "John", avatar: "https://c.animaapp.com/mfanfvhybs8RPw/img/display-picture-1.png", action: "Assign Task" },
    { name: "Lisa", avatar: "https://c.animaapp.com/mfanfvhybs8RPw/img/display-picture-2.png", action: "Schedule Meeting" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 lg:gap-3 h-auto p-1">
          <div className="relative">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.initials}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          </div>
          <span className="hidden sm:inline font-body-base-medium font-[number:var(--body-base-medium-font-weight)] text-black text-[length:var(--body-base-medium-font-size)] tracking-[var(--body-base-medium-letter-spacing)] leading-[var(--body-base-medium-line-height)] [font-style:var(--body-base-medium-font-style)]">
            {user.name}
          </span>
          <ChevronDownIcon className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-[280px] max-h-[80vh] overflow-y-auto" align="end" sideOffset={8}>
        {/* Profile Section */}
        <div className="p-3 border-b">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.initials}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">{user.name}</div>
              <div className="text-xs text-gray-500">{user.email}</div>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-between h-8 px-2 text-xs">
            View Profile
            <ArrowRightIcon className="w-3 h-3" />
          </Button>
        </div>

        {/* Quick Timer Widget */}
        <div className="p-3 border-b bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TimerIcon className="w-4 h-4" />
              <span className="font-medium text-sm">Timer: {timerTime}</span>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
              >
                {isTimerRunning ? <PauseIcon className="w-3 h-3" /> : <PlayIcon className="w-3 h-3" />}
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <div className="w-2 h-2 bg-gray-600 rounded-sm" />
              </Button>
            </div>
          </div>
          <div className="text-xs text-gray-600">Working on: "Dashboard Redesign"</div>
        </div>

        {/* Today's Summary */}
        <div className="p-3 border-b">
          <div className="text-sm font-medium mb-2">📊 Today's Stats</div>
          <div className="space-y-1 text-xs text-gray-600">
            <div>✓ 5/8 tasks completed</div>
            <div>⏰ 4.5 hours tracked</div>
            <div>🎯 2 goals progressed</div>
          </div>
        </div>

        {/* Quick Status */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2">
            <span className="text-lg">🟢</span>
            Set Status
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            <DropdownMenuRadioGroup value={status} onValueChange={setStatus}>
              {statusOptions.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value} className="flex items-center gap-2">
                  <span>{option.icon}</span>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Main Actions */}
        <DropdownMenuItem className="flex items-center gap-2">
          <UserIcon className="w-4 h-4" />
          My Profile
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2">
          <CheckIcon className="w-4 h-4" />
          My Tasks
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2">
          <TargetIcon className="w-4 h-4" />
          My Goals
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2">
          <TimerIcon className="w-4 h-4" />
          Time Tracker
          <DropdownMenuShortcut>⌘T</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2">
          <FileTextIcon className="w-4 h-4" />
          Personal Notes
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Quick Switch */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2">
            <ZapIcon className="w-4 h-4" />
            Quick Switch
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-56">
            {recentItems.map((item, index) => (
              <DropdownMenuItem key={index} className="flex items-center gap-2">
                <span>{item.icon}</span>
                {item.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-blue-600">See all →</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Workspace */}
        <DropdownMenuLabel>Workspace</DropdownMenuLabel>
        <DropdownMenuItem className="flex items-center gap-2">
          <SettingsIcon className="w-4 h-4" />
          Workspace Settings
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2">
          <UsersIcon className="w-4 h-4" />
          Invite Team Members
        </DropdownMenuItem>
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-100 flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-600 rounded" />
            </div>
            Switch Workspace
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            {workspaces.map((workspace, index) => (
              <DropdownMenuItem key={index} className="flex items-center justify-between">
                {workspace.name}
                {workspace.active && <CheckIcon className="w-3 h-3" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-center gap-2">
              <PlusIcon className="w-4 h-4" />
              Create New Workspace
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Preferences */}
        <DropdownMenuLabel>Preferences</DropdownMenuLabel>
        <DropdownMenuItem className="flex items-center gap-2">
          <BellIcon className="w-4 h-4" />
          Notification Settings
        </DropdownMenuItem>
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2">
            <PaletteIcon className="w-4 h-4" />
            Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-40">
            <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
              {themeOptions.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value} className="flex items-center gap-2">
                  {typeof option.icon === 'string' ? <span>{option.icon}</span> : option.icon}
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuItem className="flex items-center gap-2">
          <KeyboardIcon className="w-4 h-4" />
          Keyboard Shortcuts
          <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2">
          <GlobeIcon className="w-4 h-4" />
          Language
          <DropdownMenuShortcut>English ▼</DropdownMenuShortcut>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Account & Billing */}
        <DropdownMenuLabel>Account & Billing</DropdownMenuLabel>
        <DropdownMenuItem className="flex items-center gap-2">
          <SettingsIcon className="w-4 h-4" />
          Account Settings
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2">
          <CreditCardIcon className="w-4 h-4" />
          Billing & Plans
          <Badge variant="outline" className="ml-auto text-xs">
            Free Plan
          </Badge>
        </DropdownMenuItem>
        <div className="px-2 py-1">
          <div className="text-xs text-gray-600 mb-1">Usage (8/10 team members)</div>
          <Progress value={80} className="h-1" />
        </div>

        <DropdownMenuSeparator />

        {/* Recent Collaborators */}
        <DropdownMenuLabel>Recent Team Members</DropdownMenuLabel>
        {recentCollaborators.map((collaborator, index) => (
          <DropdownMenuItem key={index} className="flex items-center gap-2">
            <Avatar className="w-5 h-5">
              <AvatarImage src={collaborator.avatar} />
              <AvatarFallback className="text-xs">{collaborator.name[0]}</AvatarFallback>
            </Avatar>
            <span className="flex-1">{collaborator.name}</span>
            <span className="text-xs text-gray-500">{collaborator.action}</span>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        {/* Mood Check-in */}
        <div className="p-2">
          <div className="text-sm font-medium mb-2">😊 How are you feeling?</div>
          <div className="flex justify-between">
            {['😔', '😐', '🙂', '😊', '🚀'].map((emoji, index) => (
              <Button key={index} variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-100">
                <span className="text-lg">{emoji}</span>
              </Button>
            ))}
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Focus Mode */}
        <DropdownMenuItem className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TargetIcon className="w-4 h-4" />
            Focus Mode
          </div>
          <div className="w-8 h-4 bg-gray-200 rounded-full relative">
            <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm" />
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Help & Resources */}
        <DropdownMenuLabel>Help & Resources</DropdownMenuLabel>
        <DropdownMenuItem className="flex items-center gap-2">
          <HelpCircleIcon className="w-4 h-4" />
          Help Center
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2">
          <StarIcon className="w-4 h-4" />
          What's New
          <Badge variant="destructive" className="ml-auto text-xs px-1">
            3
          </Badge>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2">
          <BookOpenIcon className="w-4 h-4" />
          Documentation
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2">
          <MessageCircleIcon className="w-4 h-4" />
          Chat Support
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 rounded flex items-center justify-center">
            <div className="w-2 h-2 bg-red-600 rounded" />
          </div>
          Video Tutorials
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Daily Quote */}
        <div className="p-2 bg-blue-50 rounded mx-1 mb-1">
          <div className="text-xs font-medium text-blue-800">🎉 Daily Tip</div>
          <div className="text-xs text-blue-700">"You've completed 45% more tasks this week!"</div>
        </div>

        <DropdownMenuSeparator />

        {/* Bottom Section */}
        <DropdownMenuItem className="flex items-center gap-2 text-gray-600">
          <SmartphoneIcon className="w-4 h-4" />
          Download Mobile App
          <Badge variant="outline" className="ml-auto text-xs">
            Soon
          </Badge>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-100 rounded flex items-center justify-center">
            <div className="w-2 h-2 bg-purple-600 rounded" />
          </div>
          API & Integrations
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="flex items-center gap-2 text-red-600 focus:text-red-600">
          <LogOutIcon className="w-4 h-4" />
          Sign Out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
