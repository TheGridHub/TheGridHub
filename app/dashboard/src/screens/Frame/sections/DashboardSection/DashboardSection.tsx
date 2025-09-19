import {
  CalendarIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
  ClockIcon,
  CommandIcon,
  FilterIcon,
  HelpCircleIcon,
  MenuIcon,
  MoreVerticalIcon,
  PlusIcon,
  SearchIcon,
  TargetIcon,
  TimerIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";
import React, { memo, useEffect, useMemo, useState, useCallback } from "react";
import { createClient } from '@/lib/supabase/client'
import { getProfileClient } from '@/lib/profile.client'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../../components/ui/avatar";
import { UserDropdownMenu } from "../../../../components/UserDropdownMenu";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Checkbox } from "../../../../components/ui/checkbox";

const keyMetrics = [
  {
    icon: CheckCircleIcon,
    title: "Active Tasks",
    value: "24 tasks",
    change: "↑ 12% this week",
    changeColor: "text-green-600",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    icon: TargetIcon,
    title: "Goals Progress",
    value: "3/5 completed",
    change: "60% on track",
    changeColor: "text-green-600",
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    icon: UsersIcon,
    title: "Team Activity",
    value: "8 online now",
    change: "+2 new members",
    changeColor: "text-blue-600",
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
  },
  {
    icon: TimerIcon,
    title: "Hours Tracked",
    value: "142h this month",
    change: "$3,550 value",
    changeColor: "text-green-600",
    bgColor: "bg-orange-50",
    iconColor: "text-orange-600",
  },
];

const projects = [
  {
    name: "Website Redesign",
    progress: 75,
    status: "on-track",
    statusColor: "bg-green-100 text-green-800",
    dueDate: "Dec 15, 2024",
    team: [
      "https://c.animaapp.com/mfanfvhybs8RPw/img/display-picture.png",
      "https://c.animaapp.com/mfanfvhybs8RPw/img/display-picture-1.png",
      "https://c.animaapp.com/mfanfvhybs8RPw/img/display-picture-2.png",
    ],
  },
  {
    name: "Mobile App Development",
    progress: 45,
    status: "at-risk",
    statusColor: "bg-yellow-100 text-yellow-800",
    dueDate: "Jan 20, 2025",
    team: [
      "https://c.animaapp.com/mfanfvhybs8RPw/img/display-picture-3.png",
      "https://c.animaapp.com/mfanfvhybs8RPw/img/display-picture-4.png",
    ],
  },
  {
    name: "Marketing Campaign",
    progress: 90,
    status: "on-track",
    statusColor: "bg-green-100 text-green-800",
    dueDate: "Dec 10, 2024",
    team: [
      "https://c.animaapp.com/mfanfvhybs8RPw/img/display-picture.png",
      "https://c.animaapp.com/mfanfvhybs8RPw/img/display-picture-1.png",
    ],
  },
  {
    name: "API Integration",
    progress: 20,
    status: "delayed",
    statusColor: "bg-red-100 text-red-800",
    dueDate: "Dec 5, 2024",
    team: [
      "https://c.animaapp.com/mfanfvhybs8RPw/img/display-picture-2.png",
    ],
  },
];

const myTasks = [
  {
    id: 1,
    title: "Review design mockups",
    priority: "high",
    completed: false,
    dueDate: "Today",
    project: "Website Redesign",
  },
  {
    id: 2,
    title: "Update project timeline",
    priority: "medium",
    completed: false,
    dueDate: "Today",
    project: "Mobile App",
  },
  {
    id: 3,
    title: "Team standup meeting",
    priority: "high",
    completed: true,
    dueDate: "Today",
    project: "General",
  },
  {
    id: 4,
    title: "Code review for API endpoints",
    priority: "medium",
    completed: false,
    dueDate: "Tomorrow",
    project: "API Integration",
  },
  {
    id: 5,
    title: "Prepare quarterly report",
    priority: "low",
    completed: false,
    dueDate: "This week",
    project: "General",
  },
];

const goals = [
  {
    title: "Q4 Revenue Target",
    progress: 85,
    target: "$500K",
    current: "$425K",
    color: "text-green-600",
  },
  {
    title: "Product Launch",
    progress: 60,
    target: "100%",
    current: "60%",
    color: "text-blue-600",
  },
  {
    title: "Team Growth",
    progress: 40,
    target: "15 members",
    current: "12 members",
    color: "text-purple-600",
  },
];

const upcomingDeadlines = [
  {
    title: "API Integration Deadline",
    date: "Dec 5",
    project: "API Integration",
    color: "bg-red-100 text-red-800",
  },
  {
    title: "Marketing Campaign Launch",
    date: "Dec 10",
    project: "Marketing",
    color: "bg-green-100 text-green-800",
  },
  {
    title: "Website Redesign Review",
    date: "Dec 15",
    project: "Website",
    color: "bg-blue-100 text-blue-800",
  },
  {
    title: "Team Quarterly Meeting",
    date: "Dec 20",
    project: "General",
    color: "bg-purple-100 text-purple-800",
  },
];

const recentActivity = [
  {
    user: "Sarah Chen",
    action: "completed task",
    target: "Design System Documentation",
    time: "2 hours ago",
    avatar: "https://c.animaapp.com/mfanfvhybs8RPw/img/display-picture.png",
  },
  {
    user: "Mike Johnson",
    action: "commented on",
    target: "Mobile App Wireframes",
    time: "4 hours ago",
    avatar: "https://c.animaapp.com/mfanfvhybs8RPw/img/display-picture-1.png",
  },
  {
    user: "Emma Wilson",
    action: "joined project",
    target: "Website Redesign",
    time: "1 day ago",
    avatar: "https://c.animaapp.com/mfanfvhybs8RPw/img/display-picture-2.png",
  },
  {
    user: "Alex Rodriguez",
    action: "updated milestone",
    target: "API Integration Phase 2",
    time: "2 days ago",
    avatar: "https://c.animaapp.com/mfanfvhybs8RPw/img/display-picture-3.png",
  },
];

const quickActions = [
  { icon: PlusIcon, label: "Create Task", color: "bg-blue-600" },
  { icon: TimerIcon, label: "Start Timer", color: "bg-green-600" },
  { icon: CalendarIcon, label: "Schedule Meeting", color: "bg-purple-600" },
  { icon: UsersIcon, label: "Invite Member", color: "bg-orange-600" },
];

interface DashboardSectionProps {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onToggleMobileSidebar: () => void;
}

export const DashboardSection = ({ isSidebarCollapsed, onToggleSidebar, onToggleMobileSidebar }: DashboardSectionProps): JSX.Element => {
  const supabase = useMemo(() => createClient(), [])
  const [workspaceName, setWorkspaceName] = useState<string | null>(null)
  const [headerLoading, setHeaderLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const { profile } = await getProfileClient()
        setWorkspaceName(profile?.team_name ?? null)
      } finally {
        setHeaderLoading(false)
      }
    })()
  }, [])

  // memoized lists (placeholder for real pagination / data)
  const metrics = useMemo(() => keyMetrics, [])
  const projectsPageSize = 2
  const [projectPage, setProjectPage] = useState(1)
  const pagedProjects = useMemo(() => projects.slice(0, projectPage * projectsPageSize), [projectPage])
  const canLoadMoreProjects = pagedProjects.length < projects.length

  const tasksPageSize = 3
  const [tasksPage, setTasksPage] = useState(1)
  const pagedTasks = useMemo(() => myTasks.slice(0, tasksPage * tasksPageSize), [tasksPage])
  const canLoadMoreTasks = pagedTasks.length < myTasks.length

  const onLoadMoreProjects = useCallback(() => setProjectPage(p => p + 1), [])
  const onLoadMoreTasks = useCallback(() => setTasksPage(p => p + 1), [])

  return (
    <div className="flex flex-col w-full translate-y-[-1rem] animate-fade-in opacity-0">
      {/* Header */}
      <header className="flex w-full h-[72px] items-center justify-between px-4 lg:px-8 py-0 bg-white border-b border-[#e4e4e4]">
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Mobile Hamburger Menu */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden w-8 h-8 p-0 bg-[#f1f1f1] hover:bg-[#e4e4e4] rounded-sm"
            onClick={onToggleMobileSidebar}
          >
            <MenuIcon className="w-5 h-5" />
          </Button>

          {/* Desktop Sidebar Toggle Button - Only show when sidebar is collapsed */}
          {isSidebarCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              className="hidden lg:flex w-7 h-7 p-0 bg-[#f1f1f1] hover:bg-[#e4e4e4] rounded-sm"
              onClick={onToggleSidebar}
            >
              <ChevronsRightIcon className="w-5 h-5" />
            </Button>
          )}
          
          <div className="flex w-full max-w-[280px] sm:max-w-[360px] items-center justify-between px-3 py-2.5 rounded border border-[#aeaeae]">
            <div className="flex items-center gap-2 lg:gap-3">
              <SearchIcon className="w-4 lg:w-5 h-4 lg:h-5 text-[#aeaeae]" />
              <span className="font-body-base-regular font-[number:var(--body-base-regular-font-weight)] text-[#aeaeae] text-xs lg:text-[length:var(--body-base-regular-font-size)] tracking-[var(--body-base-regular-letter-spacing)] leading-[var(--body-base-regular-line-height)] [font-style:var(--body-base-regular-font-style)] truncate">
                <span className="hidden sm:inline">Search projects, tasks...</span>
                <span className="sm:hidden">Search...</span>
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex w-5 h-5 items-center justify-center bg-[#f1f1f1] rounded-sm">
                <CommandIcon className="w-4 h-4" />
              </div>
              <div className="flex w-5 h-5 items-center justify-center bg-[#f1f1f1] rounded-sm">
                <span className="font-body-large-medium font-[number:var(--body-large-medium-font-weight)] text-[#717171] text-[length:var(--body-large-medium-font-size)] tracking-[var(--body-large-medium-letter-spacing)] leading-[var(--body-large-medium-line-height)] [font-style:var(--body-large-medium-font-style)]">
                  F
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-8">
          <Button
            variant="ghost"
            className="hidden md:flex items-center gap-3 p-2 h-auto"
          >
            <HelpCircleIcon className="w-5 h-5" />
            <span className="hidden lg:inline font-body-base-medium font-[number:var(--body-base-medium-font-weight)] text-[#717171] text-[length:var(--body-base-medium-font-size)] tracking-[var(--body-base-medium-letter-spacing)] leading-[var(--body-base-medium-line-height)] [font-style:var(--body-base-medium-font-style)]">
              Help Center
            </span>
          </Button>

          <div className="flex items-center gap-2 lg:gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src="https://c.animaapp.com/mfanfvhybs8RPw/img/frame-5518.png" />
              <AvatarFallback>BF</AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline font-body-base-medium font-[number:var(--body-base-medium-font-weight)] text-black text-[length:var(--body-base-medium-font-size)] tracking-[var(--body-base-medium-letter-spacing)] leading-[var(--body-base-medium-line-height)] [font-style:var(--body-base-medium-font-style)]">
              Brian F.
            </span>
            <ChevronDownIcon className="w-4 h-4" />
          </div>
        </div>
      </header>

      {/* Sub Header */}
      <div className="flex w-full items-center justify-between px-4 lg:px-8 py-4 min-h-[69px] bg-white border-b border-[#e4e4e4]">
        <div className="flex flex-col">
          <h1 className="font-heading-desktop-h5 font-[number:var(--heading-desktop-h5-font-weight)] text-black text-lg lg:text-[length:var(--heading-desktop-h5-font-size)] tracking-[var(--heading-desktop-h5-letter-spacing)] leading-[var(--heading-desktop-h5-line-height)] [font-style:var(--heading-desktop-h5-font-style)]">
            {headerLoading ? 'Loading workspace…' : (workspaceName || 'Set your workspace name')}
          </h1>
          <p className="text-sm text-gray-600">Welcome back 👋</p>
        </div>
        <div className="flex items-center gap-2 lg:gap-3">
          <Button variant="outline" className="gap-2 text-xs lg:text-sm px-2 lg:px-4">
            <FilterIcon className="w-4 h-4" />
            <span className="hidden sm:inline">This Week</span>
            <ChevronDownIcon className="w-4 h-4" />
          </Button>
          <Button className="gap-2 bg-black text-white hover:bg-black/90 text-xs lg:text-sm px-2 lg:px-4">
            <PlusIcon className="w-4 h-4" />
            <span className="hidden sm:inline">New Project</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex flex-col w-full items-start gap-4 lg:gap-6 p-4 lg:p-8">
        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5 w-full translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]">
          {metrics.map((metric, index) => (
            <Card key={index} className="border-[#e4e4e4]">
              <CardContent className="flex flex-col items-start justify-center gap-3 p-5">
                <div className="flex items-center justify-between w-full">
                  <div
                    className={`flex items-center justify-center p-2 rounded-lg ${metric.bgColor}`}
                  >
                    <metric.icon className={`w-5 h-5 ${metric.iconColor}`} />
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex flex-col items-start justify-center gap-1 w-full">
                  <span className="font-body-base-medium font-[number:var(--body-base-medium-font-weight)] text-[#717171] text-[length:var(--body-base-medium-font-size)] tracking-[var(--body-base-medium-letter-spacing)] leading-[var(--body-base-medium-line-height)] [font-style:var(--body-base-medium-font-style)]">
                    {metric.title}
                  </span>
                  <span className="font-heading-desktop-h6 font-[number:var(--heading-desktop-h6-font-weight)] text-black text-[length:var(--heading-desktop-h6-font-size)] tracking-[var(--heading-desktop-h6-letter-spacing)] leading-[var(--heading-desktop-h6-line-height)] [font-style:var(--heading-desktop-h6-font-style)]">
                    {metric.value}
                  </span>
                  <span className={`text-sm ${metric.changeColor}`}>
                    {metric.change}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 w-full">
          {/* Left Column - 8/12 width on desktop, full width on mobile */}
          <div className="lg:col-span-8 flex flex-col gap-4 lg:gap-6">
            {/* Project Overview */}
            <Card className="border-[#e4e4e4] translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms]">
              <CardHeader className="p-5 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-heading-desktop-h6 font-[number:var(--heading-desktop-h6-font-weight)] text-black text-[length:var(--heading-desktop-h6-font-size)] tracking-[var(--heading-desktop-h6-letter-spacing)] leading-[var(--heading-desktop-h6-line-height)] [font-style:var(--heading-desktop-h6-font-style)]">
                    📈 Project Overview
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={onLoadMoreProjects} disabled={!canLoadMoreProjects}>
                    {canLoadMoreProjects ? 'Load more' : 'All loaded'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="space-y-4">
                  {projects.map((project, index) => (
                    <div
                      key={index}
                      className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors gap-4 lg:gap-0"
                    >
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                          <h4 className="font-medium text-black">{project.name}</h4>
                          <Badge className={`text-xs w-fit ${project.statusColor}`}>
                            {project.status}
                          </Badge>
                        </div>
                        <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-600">Progress</span>
                              <span className="text-black">{project.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 lg:whitespace-nowrap">
                            Due: {project.dueDate}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {project.team.map((avatar, i) => (
                              <Avatar key={i} className="w-6 h-6 border-2 border-white">
                                <AvatarImage src={avatar} />
                                <AvatarFallback>U</AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            {project.team.length} members
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 lg:flex-col lg:gap-1">
                        <Button variant="ghost" size="sm" className="w-full lg:w-auto">
                          View
                        </Button>
                        <MoreVerticalIcon className="w-4 h-4 text-gray-400 lg:mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* My Tasks */}
            <Card className="border-[#e4e4e4] translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:600ms]">
              <CardHeader className="p-5 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-heading-desktop-h6 font-[number:var(--heading-desktop-h6-font-weight)] text-black text-[length:var(--heading-desktop-h6-font-size)] tracking-[var(--heading-desktop-h6-letter-spacing)] leading-[var(--heading-desktop-h6-line-height)] [font-style:var(--heading-desktop-h6-font-style)]">
                    ✅ My Tasks
                  </CardTitle>
                  <Button variant="ghost" size="sm">
                    <PlusIcon className="w-4 h-4" />
                    Add Task
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="space-y-3">
          {pagedTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        task.completed
                          ? "bg-green-50 border-green-200"
                          : "bg-white border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <Checkbox
                        checked={task.completed}
                        className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`font-medium ${
                              task.completed
                                ? "text-green-800 line-through"
                                : "text-black"
                            }`}
                          >
                            {task.title}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              task.priority === "high"
                                ? "border-red-200 text-red-700"
                                : task.priority === "medium"
                                ? "border-yellow-200 text-yellow-700"
                                : "border-gray-200 text-gray-700"
                            }`}
                          >
                            {task.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{task.project}</span>
                          <span>•</span>
                          <span>{task.dueDate}</span>
                        </div>
                      </div>
                      <MoreVerticalIcon className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - 4/12 width on desktop, full width on mobile */}
          <div className="lg:col-span-4 flex flex-col gap-4 lg:gap-6">
            {/* Goals Tracker */}
            <Card className="border-[#e4e4e4] translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:500ms]">
              <CardHeader className="p-5 pb-4">
                <CardTitle className="font-heading-desktop-h6 font-[number:var(--heading-desktop-h6-font-weight)] text-black text-[length:var(--heading-desktop-h6-font-size)] tracking-[var(--heading-desktop-h6-letter-spacing)] leading-[var(--heading-desktop-h6-line-height)] [font-style:var(--heading-desktop-h6-font-style)]">
                  🎯 Goals Tracker
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="space-y-4">
                  {goals.map((goal, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-black">{goal.title}</span>
                        <span className={`text-sm font-medium ${goal.color}`}>
                          {goal.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            goal.progress >= 80
                              ? "bg-green-600"
                              : goal.progress >= 50
                              ? "bg-blue-600"
                              : "bg-yellow-600"
                          }`}
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{goal.current}</span>
                        <span>of {goal.target}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card className="border-[#e4e4e4] translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:700ms]">
              <CardHeader className="p-5 pb-4">
                <CardTitle className="font-heading-desktop-h6 font-[number:var(--heading-desktop-h6-font-weight)] text-black text-[length:var(--heading-desktop-h6-font-size)] tracking-[var(--heading-desktop-h6-letter-spacing)] leading-[var(--heading-desktop-h6-line-height)] [font-style:var(--heading-desktop-h6-font-style)]">
                  📅 Upcoming Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="space-y-3">
                  {upcomingDeadlines.map((deadline, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-black mb-1">
                          {deadline.title}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${deadline.color}`}>
                            {deadline.project}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {deadline.date}
                          </span>
                        </div>
                      </div>
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-[#e4e4e4] translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:800ms]">
              <CardHeader className="p-5 pb-4">
                <CardTitle className="font-heading-desktop-h6 font-[number:var(--heading-desktop-h6-font-weight)] text-black text-[length:var(--heading-desktop-h6-font-size)] tracking-[var(--heading-desktop-h6-letter-spacing)] leading-[var(--heading-desktop-h6-line-height)] [font-style:var(--heading-desktop-h6-font-style)]">
                  💬 Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={activity.avatar} />
                        <AvatarFallback>
                          {activity.user.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm">
                          <span className="font-medium text-black">
                            {activity.user}
                          </span>{" "}
                          <span className="text-gray-600">{activity.action}</span>{" "}
                          <span className="font-medium text-black">
                            {activity.target}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-[#e4e4e4] translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:900ms]">
              <CardHeader className="p-5 pb-4">
                <CardTitle className="font-heading-desktop-h6 font-[number:var(--heading-desktop-h6-font-weight)] text-black text-[length:var(--heading-desktop-h6-font-size)] tracking-[var(--heading-desktop-h6-letter-spacing)] leading-[var(--heading-desktop-h6-line-height)] [font-style:var(--heading-desktop-h6-font-style)]">
                  🚀 Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="flex flex-col items-center gap-2 h-auto p-3 lg:p-4 hover:bg-gray-50"
                    >
                      <div className={`p-2 rounded-lg ${action.color}`}>
                        <action.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs lg:text-sm font-medium text-center">{action.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Analytics Snapshot */}
        <Card className="w-full border-[#e4e4e4] translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:1000ms]">
          <CardHeader className="p-5 pb-4">
            <CardTitle className="font-heading-desktop-h6 font-[number:var(--heading-desktop-h6-font-weight)] text-black text-[length:var(--heading-desktop-h6-font-size)] tracking-[var(--heading-desktop-h6-letter-spacing)] leading-[var(--heading-desktop-h6-line-height)] [font-style:var(--heading-desktop-h6-font-style)]">
              📈 Analytics Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <div className="text-center">
                <div className="text-xl lg:text-2xl font-bold text-green-600 mb-1">87%</div>
                <div className="text-xs lg:text-sm text-gray-600">Task Completion</div>
                <div className="text-xs text-green-600">↑ 12% vs last week</div>
              </div>
              <div className="text-center">
                <div className="text-xl lg:text-2xl font-bold text-blue-600 mb-1">142h</div>
                <div className="text-xs lg:text-sm text-gray-600">Time Tracked</div>
                <div className="text-xs text-blue-600">↑ 8% vs last week</div>
              </div>
              <div className="text-center">
                <div className="text-xl lg:text-2xl font-bold text-purple-600 mb-1">4.8</div>
                <div className="text-xs lg:text-sm text-gray-600">Team Productivity</div>
                <div className="text-xs text-purple-600">↑ 5% vs last week</div>
              </div>
              <div className="text-center">
                <div className="text-xl lg:text-2xl font-bold text-orange-600 mb-1">$3.5K</div>
                <div className="text-xs lg:text-sm text-gray-600">Budget Burn Rate</div>
                <div className="text-xs text-orange-600">On track</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
