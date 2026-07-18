# Graph Report - task-app  (2026-07-19)

## Corpus Check
- 294 files · ~189,875 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1374 nodes · 2834 edges · 118 communities (84 shown, 34 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.71)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `085c2d14`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Breadcrumbs and Accordion
- Error Handling
- Modern JavaScript Utilities
- User Preferences Management
- Mobile Navigation
- Task Completion Metrics
- Development Dependencies
- Live Interaction Scripts
- Design Utilities
- Authentication Management
- Accessibility Audit Resources
- File Generation Utilities
- UI Component Libraries
- Session Management
- Design Extraction Tools
- Task Management Pages
- Sidebar Navigation
- Task Management Overview
- Event Handling Utilities
- TypeScript Configuration
- Live Server Management
- Task Dialogs
- Task Prioritization
- Combobox Components
- Category Management
- Sidebar Components
- Marketing Layouts
- Authentication Pages
- Dashboard Overview
- Task Activity Tracking
- Timezone Selection
- Legal Information Pages
- Component Registry
- Authentication Actions
- Account Management Schema
- User Preferences Settings
- Design Panel Utilities
- Button Group Components
- Form Components
- Live Annotation Management
- Task Actions
- Annotation Management
- Live Injection Scripts
- Context Menu Components
- Live Session Management
- Parameter Management
- Loading States
- User Preferences Page
- Authentication Forms
- Mock Data Utilities
- Alert Dialogs
- Skill Management Utilities
- Session Store Management
- CSP Detection Utilities
- Project Management Utilities
- Security Settings
- Drawer Components
- Task Management Utilities
- Live Server Utilities
- Session Management Utilities
- Context Management
- Loading Components
- Form Input Components
- Category Management Tools
- Navigation Menu Components
- Project Setup Overview
- Accessibility Guidelines
- Layout Components
- Pagination Components
- Dashboard Testing Utilities
- Code Review Documentation
- Toggle Components
- Database Utilities
- Tabs Components
- Code Review and Cleanup
- Proxy Configuration
- Category Management Pages
- Animation References
- Development Guidelines
- Collapsible Components
- Hover Card Components
- Global Error Handling
- Aspect Ratio Components
- Direction Management
- Date Utilities
- Carousel Components
- ESLint Configuration
- Form Resolvers
- Next.js Framework
- Next.js Configuration
- Date Picker Component
- Email Component
- Resizable Panels
- Email Resending
- CSS Animations
- Schema Validation
- PostCSS Configuration
- Code Review Report
- Coding Standards
- Current Features
- Design System
- Drizzle Configuration
- Authentication Methods
- Product Specifications
- Project README
- Database Seed
- Vitest Setup
- Product Specification
- Database Seed

## God Nodes (most connected - your core abstractions)
1. `cn()` - 346 edges
2. `Button()` - 49 edges
3. `TaskStatus` - 24 edges
4. `TaskPriority` - 24 edges
5. `handleActionError()` - 22 edges
6. `TaskFlow PRD` - 21 edges
7. `react` - 18 edges
8. `Input()` - 17 edges
9. `getSession()` - 17 edges
10. `compilerOptions` - 16 edges

## Surprising Connections (you probably didn't know these)
- `LandingPage()` --calls--> `getSession()`  [EXTRACTED]
  app/page.tsx → lib/auth/session.ts
- `CategoryBadge()` --calls--> `cn()`  [EXTRACTED]
  components/categories/category-badge.tsx → lib/utils.ts
- `CTASectionProps` --references--> `Session`  [EXTRACTED]
  components/marketing/cta-section.tsx → lib/auth/session.ts
- `EditHint()` --calls--> `cn()`  [EXTRACTED]
  components/tasks/inline-edit.tsx → lib/utils.ts
- `PriorityBadgeProps` --references--> `TaskPriority`  [EXTRACTED]
  components/tasks/priority-badge.tsx → lib/db/schema.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Phase 3 - Polish & UX** — context_features_phase_3_01_user_settings_preferences_feature_settings, context_features_phase_3_02_improve_states_feature_improve_states, context_features_phase_3_03_responsive_refinements_feature_responsive, context_features_phase_3_04_test_coverage_feature_test_coverage, context_features_phase_3_05_caching_optimistic_filters_feature_caching, context_features_phase_3_06_app_shell_redesign_feature_app_shell [EXTRACTED 1.00]
- **Phase 4 - Security Hardening** — context_features_phase_4_01_security_review_blockers_feature_security, context_features_phase_4_01a_input_sanitization_data_integrity_feature_input_sanitization, context_features_phase_4_01b_error_sanitization_logging_feature_error_sanitization [EXTRACTED 1.00]
- **Feature Workflow Actions** — feature_load_md, feature_start_md, feature_review_md, feature_test_md, feature_explain_md, feature_complete_md [EXTRACTED 0.90]
- **TaskFlow Tech Stack** — nextjs_16, react_19, tailwind_v4, shadcn_ui, neon_postgres, drizzle_orm, better_auth, resend, zod_v4, upstash_ratelimit [EXTRACTED 0.90]
- **Design System Tokens** — color_tokens, typography_scale, spacing_scale, radius_scale [EXTRACTED 0.90]
- **Code Review Findings** — code_review_blockers, code_review_suggestions, code_review_nits [EXTRACTED 0.90]
- **TaskFlow Technology Stack** — nextjs_16, react_19, tailwind_v4, shadcn_ui, neon_postgresql, drizzle_orm, better_auth, resend_email, react_hook_form, zod_v4, proxy_ts [EXTRACTED 0.95]
- **Task Management Flow** — context_features_phase_2_03_task_management, context_features_phase_2_04_category_management, context_features_phase_2_05_task_filters_sorting_grouping [EXTRACTED 0.75]

## Communities (118 total, 34 thin omitted)

### Community 0 - "Breadcrumbs and Accordion"
Cohesion: 0.22
Nodes (16): CategoryForm(), CreateCategoryDialogProps, DeleteCategoryDialogProps, EditCategoryDialogProps, ArchiveTaskDialogProps, CreateTaskDialogProps, DeleteTaskDialogProps, TaskForm() (+8 more)

### Community 1 - "Error Handling"
Cohesion: 0.11
Nodes (26): CategoryFormProps, categoryNameSchema, FormValues, ContactFormInput, contactSchema, ProfileForm(), ProfileFormProps, SecurityForm() (+18 more)

### Community 2 - "Modern JavaScript Utilities"
Cohesion: 0.05
Nodes (49): Accordion(), AccordionContent(), AccordionItem(), AccordionTrigger(), AlertAction(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent() (+41 more)

### Community 3 - "User Preferences Management"
Cohesion: 0.12
Nodes (18): NotFound(), ForgotPasswordPage(), ResetPasswordPage(), SignInPage(), SignUpPage(), VerifyEmailPage(), AuthPageSkeleton(), BrandPane() (+10 more)

### Community 4 - "Mobile Navigation"
Cohesion: 0.12
Nodes (6): CategoryItemProps, DeleteCategoryDialog(), EditCategoryDialog(), Button(), buttonVariants, Calendar()

### Community 5 - "Task Completion Metrics"
Cohesion: 0.12
Nodes (15): getInitials(), TopBar(), ThemeToggle(), DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel() (+7 more)

### Community 6 - "Development Dependencies"
Cohesion: 0.04
Nodes (45): drizzle-kit, eslint, eslint-config-next, jsdom, devDependencies, drizzle-kit, eslint, eslint-config-next (+37 more)

### Community 7 - "Live Interaction Scripts"
Cohesion: 0.18
Nodes (10): Accessibility Targets, Brand Components, Brand Personality, Color Tokens, Design Principles, Motion System, Radius Scale, Spacing Scale (+2 more)

### Community 8 - "Design Utilities"
Cohesion: 0.10
Nodes (21): ComboboxChip(), ComboboxChips(), ComboboxChipsInput(), ComboboxClear(), ComboboxContent(), ComboboxEmpty(), ComboboxGroup(), ComboboxInput() (+13 more)

### Community 9 - "Authentication Management"
Cohesion: 0.19
Nodes (18): forgotPasswordAction(), getClientIp(), resetPasswordAction(), signInAction(), signUpAction(), updatePasswordAction(), ForgotPasswordInput, forgotPasswordSchema (+10 more)

### Community 10 - "Accessibility Audit Resources"
Cohesion: 0.18
Nodes (10): LandingPage(), CTASection(), CTASectionProps, FeatureRow(), FeatureRowProps, FeaturesSection(), MacBrowserFrameProps, Footer() (+2 more)

### Community 11 - "File Generation Utilities"
Cohesion: 0.07
Nodes (15): CategoryBadge(), CategoryBadgeProps, ButtonGroup(), ButtonGroupSeparator(), ButtonGroupText(), buttonGroupVariants, Checkbox(), HoverCardContent() (+7 more)

### Community 12 - "UI Component Libraries"
Cohesion: 0.05
Nodes (37): @base-ui/react, @better-auth/drizzle-adapter, class-variance-authority, cmdk, date-fns, input-otp, lucide-react, @neondatabase/serverless (+29 more)

### Community 13 - "Session Management"
Cohesion: 0.08
Nodes (34): getInitials(), SidebarFooter(), navItems, Sidebar(), SidebarContent(), SidebarContext, SidebarContextProps, SidebarFooter() (+26 more)

### Community 14 - "Design Extraction Tools"
Cohesion: 0.21
Nodes (11): BackToSignInLink(), ResetPasswordFormInput, resetPasswordFormSchema, SuccessState(), SuccessStateProps, VerifyEmailHandler(), Alert(), AlertDescription() (+3 more)

### Community 15 - "Task Management Pages"
Cohesion: 0.06
Nodes (35): { GET, POST }, auth, NOTE: Only pass the auth-related tables to the adapter., accounts, sessions, users, verifications, sendPasswordResetEmail() (+27 more)

### Community 16 - "Sidebar Navigation"
Cohesion: 0.32
Nodes (10): CreateTaskDialog(), TaskEmptyStateProps, Empty(), EmptyContent(), EmptyDescription(), EmptyHeader(), EmptyMedia(), emptyMediaVariants (+2 more)

### Community 17 - "Task Management Overview"
Cohesion: 0.11
Nodes (28): Authentication Flow, better-auth, Category Management, Context7 MCP, TaskFlow PRD, Dashboard Overview, drizzle-orm, Neon MCP (+20 more)

### Community 18 - "Event Handling Utilities"
Cohesion: 0.21
Nodes (10): getInitials(), MobileNav(), navItems, Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount() (+2 more)

### Community 19 - "TypeScript Configuration"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 20 - "Live Server Management"
Cohesion: 0.27
Nodes (7): DividerWithText(), DividerWithTextProps, GoogleAuthButton(), GoogleAuthButtonProps, SignUpFormInput, SignUpFormProps, signUpFormSchema

### Community 21 - "Task Dialogs"
Cohesion: 0.11
Nodes (20): ArchiveTaskDialog(), DeleteTaskDialog(), EditTaskDialog(), descriptionSchema, dueDateSchema, EditHint(), InlineCategoryEdit(), InlineDescriptionEdit() (+12 more)

### Community 22 - "Task Prioritization"
Cohesion: 0.13
Nodes (18): TimezoneCombobox(), TimezoneComboboxProps, Command(), CommandDialog(), CommandEmpty(), CommandGroup(), CommandInput(), CommandItem() (+10 more)

### Community 23 - "Combobox Components"
Cohesion: 0.09
Nodes (21): Account, accountsRelations, categoriesRelations, NewAccount, NewCategory, NewRateLimit, NewSession, NewTask (+13 more)

### Community 24 - "Category Management"
Cohesion: 0.10
Nodes (28): dateFormatOptions, formatDatePreview(), PreferencesForm(), PreferencesFormProps, sortOptions, dueDateLabels, dueDateOptions, groupByOptions (+20 more)

### Community 25 - "Sidebar Components"
Cohesion: 0.18
Nodes (15): DashboardPage(), CategoryBreakdown(), CategoryBreakdownProps, DashboardEmptyState(), metrics, MetricsStrip(), MetricsStripProps, activeTaskStatusCondition() (+7 more)

### Community 26 - "Marketing Layouts"
Cohesion: 0.11
Nodes (11): metadata, metadata, metadata, metadata, toc, metadata, toc, ContactForm() (+3 more)

### Community 27 - "Authentication Pages"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 28 - "Dashboard Overview"
Cohesion: 0.21
Nodes (15): UpcomingTasksProps, EditTaskDialogProps, GroupedTask, priorityConfig, TaskCard(), TaskCardProps, TaskDetailViewProps, TaskListTask (+7 more)

### Community 29 - "Task Activity Tracking"
Cohesion: 0.19
Nodes (10): TaskList(), TaskListProps, Task, formatDueDateBucketLabel(), formatStatusLabel(), groupTasks(), TaskGroup, TaskWithCategory (+2 more)

### Community 30 - "Timezone Selection"
Cohesion: 0.23
Nodes (10): AppShellProps, MobileNavProps, SidebarFooterProps, Sidebar(), SidebarProps, TopBarProps, Sheet(), AuthSession (+2 more)

### Community 31 - "Legal Information Pages"
Cohesion: 0.27
Nodes (8): SheetClose(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle(), SheetTrigger()

### Community 32 - "Component Registry"
Cohesion: 0.18
Nodes (12): Item(), ItemActions(), ItemContent(), ItemDescription(), ItemFooter(), ItemGroup(), ItemHeader(), ItemMedia() (+4 more)

### Community 33 - "Authentication Actions"
Cohesion: 0.16
Nodes (15): CompletionTrend(), CompletionTrendProps, WeeklyVelocity(), WeeklyVelocityProps, ChartConfig, ChartContext, ChartContextProps, ChartLegendContent() (+7 more)

### Community 34 - "Account Management Schema"
Cohesion: 0.16
Nodes (20): createCategoryAction(), deleteCategoryAction(), updateCategoryAction(), archiveTaskAction(), createTaskAction(), deleteTaskAction(), toggleTaskCompletionAction(), updateTaskAction() (+12 more)

### Community 35 - "User Preferences Settings"
Cohesion: 0.58
Nodes (8): font(), header(), make_categories(), make_dashboard(), make_og(), make_tasks(), rounded_rect(), txt()

### Community 36 - "Design Panel Utilities"
Cohesion: 0.38
Nodes (5): DashboardPreview(), HeroSection(), HeroSectionProps, NavbarProps, Session

### Community 37 - "Button Group Components"
Cohesion: 0.33
Nodes (5): GroupedTaskList(), GroupedTaskListProps, TaskGroup, TaskGroupHeader(), TaskGroupHeaderProps

### Community 38 - "Form Components"
Cohesion: 0.12
Nodes (11): CategorySkeleton(), TaskDetailSkeleton(), TaskSkeleton(), Card(), CardAction(), CardContent(), CardDescription(), CardFooter() (+3 more)

### Community 39 - "Live Annotation Management"
Cohesion: 0.33
Nodes (13): priorityConfig, UpcomingTasks(), TaskDetailView(), TaskRow(), DueDateBucket, formatDate(), formatRelativeDate(), fromUserTimezone() (+5 more)

### Community 40 - "Task Actions"
Cohesion: 0.10
Nodes (26): metadata, SettingsPage(), AppearanceForm(), AppearanceFormProps, themes, updatePreferencesAction(), updateProfileAction(), mockRequireUserId (+18 more)

### Community 41 - "Annotation Management"
Cohesion: 0.11
Nodes (18): TaskFormProps, CreateTaskInput, createTaskSchema, dueDateFilterValues, groupByValues, sortFieldValues, sortOrderValues, TaskFilterInput (+10 more)

### Community 42 - "Live Injection Scripts"
Cohesion: 0.12
Nodes (11): Menubar(), MenubarCheckboxItem(), MenubarContent(), MenubarItem(), MenubarLabel(), MenubarRadioItem(), MenubarSeparator(), MenubarShortcut() (+3 more)

### Community 43 - "Context Menu Components"
Cohesion: 0.43
Nodes (5): ToggleGroup(), ToggleGroupContext, ToggleGroupItem(), Toggle(), toggleVariants

### Community 44 - "Live Session Management"
Cohesion: 0.12
Nodes (23): TaskDetailPage(), TaskDetailPageProps, TaskEmptyState(), TaskListLoader(), TaskListLoaderProps, getDashboardData(), getCategoriesForUser(), getTaskById() (+15 more)

### Community 45 - "Parameter Management"
Cohesion: 0.12
Nodes (10): ContextMenuCheckboxItem(), ContextMenuContent(), ContextMenuItem(), ContextMenuLabel(), ContextMenuRadioItem(), ContextMenuSeparator(), ContextMenuShortcut(), ContextMenuSubContent() (+2 more)

### Community 46 - "Loading States"
Cohesion: 0.40
Nodes (5): TaskFiltersProps, CategoriesContext, CategoriesContextValue, CategoriesProvider(), Category

### Community 47 - "User Preferences Page"
Cohesion: 0.40
Nodes (4): Explain Action, Files Changed, How It All Connects, Output Format

### Community 48 - "Authentication Forms"
Cohesion: 0.15
Nodes (14): CategoriesPage(), CategoryEmptyState(), CategoryItem(), CategoryList(), CategoryListProps, CreateCategoryDialog(), CategoryWithTaskCount, getCategories() (+6 more)

### Community 49 - "Mock Data Utilities"
Cohesion: 0.09
Nodes (23): CalendarDayButton(), Carousel(), CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps, CarouselItem(), CarouselNext() (+15 more)

### Community 50 - "Alert Dialogs"
Cohesion: 0.50
Nodes (4): priorityColors, PriorityDonut(), PriorityDonutProps, PriorityDistribution

### Community 51 - "Skill Management Utilities"
Cohesion: 0.50
Nodes (3): PriorityBadge(), PriorityBadgeProps, priorityConfig

### Community 52 - "Session Store Management"
Cohesion: 0.50
Nodes (3): StatusBadge(), StatusBadgeProps, statusConfig

### Community 53 - "CSP Detection Utilities"
Cohesion: 0.67
Nodes (3): ActivityEvent, deriveEvents(), TaskActivityTimeline()

### Community 55 - "Security Settings"
Cohesion: 0.33
Nodes (7): AuthenticatedLayout(), TasksPage(), TasksPageProps, AppShell(), requireAuth(), getCategoriesForUser(), getUserTimezone()

### Community 60 - "Context Management"
Cohesion: 0.29
Nodes (7): ColorPicker(), ColorPickerProps, CATEGORY_COLORS, CreateCategoryInput, createCategorySchema, UpdateCategoryInput, updateCategorySchema

### Community 61 - "Loading Components"
Cohesion: 0.22
Nodes (9): NavigationMenu(), NavigationMenuContent(), NavigationMenuIndicator(), NavigationMenuItem(), NavigationMenuLink(), NavigationMenuList(), NavigationMenuTrigger(), navigationMenuTriggerStyle (+1 more)

### Community 62 - "Form Input Components"
Cohesion: 0.20
Nodes (10): Project Initialization & Foundation Setup, Neon + Drizzle Setup, Schema Generation & Migration, Better Auth Core Setup, Resend Email Integration, Auth Pages UI, Dashboard Overview, Task Management (CRUD) (+2 more)

### Community 63 - "Category Management Tools"
Cohesion: 0.31
Nodes (9): Accessibility Guidelines (WCAG), UI/UX Pro Max Skill, Animation Guidelines, Charts & Data Guidelines, Forms & Feedback Guidelines, Navigation Patterns, Performance Guidelines, Touch & Interaction Guidelines (+1 more)

### Community 64 - "Navigation Menu Components"
Cohesion: 0.22
Nodes (9): feature skill, Feature Actions, feature complete action, feature explain action, feature load action, feature review action, feature start action, feature test action (+1 more)

### Community 65 - "Project Setup Overview"
Cohesion: 0.28
Nodes (5): geistMono, inter, metadata, ThemeProvider(), Toaster()

### Community 66 - "Accessibility Guidelines"
Cohesion: 0.22
Nodes (7): Pagination(), PaginationContent(), PaginationEllipsis(), PaginationLink(), PaginationLinkProps, PaginationNext(), PaginationPrevious()

### Community 68 - "Layout Components"
Cohesion: 0.29
Nodes (8): Security Review Blockers (P4-F1), Security Hardening, Input Sanitization & Data Integrity (P4-F1a), Input Sanitization, Error Sanitization & Logging (P4-F1b), Error Message Sanitization, Code Review Remediation (P6), Preflight Checklist

### Community 69 - "Pagination Components"
Cohesion: 0.25
Nodes (7): mockFindFirst, mockGetCurrentUserId, mockReturning, mockRevalidateTag, mockSet, mockValues, mockWhere

### Community 71 - "Dashboard Testing Utilities"
Cohesion: 0.15
Nodes (11): mockCategoryGroupBy, mockCategoryWhere, mockFindFirst, mockFindMany, mockGroupBy, { mockInArray }, mockLeftJoin, mockOrderBy (+3 more)

### Community 72 - "Code Review Documentation"
Cohesion: 0.29
Nodes (6): Code Review Blockers, Code Review Nits, code-review-report.md (2026-04-29), Code Review Suggestions, @upstash/ratelimit, @upstash/ratelimit

### Community 73 - "Toggle Components"
Cohesion: 0.29
Nodes (6): db, mockFindFirst, mockReturning, mockSet, mockValues, mockWhere

### Community 74 - "Database Utilities"
Cohesion: 0.40
Nodes (5): Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger()

### Community 75 - "Tabs Components"
Cohesion: 0.33
Nodes (6): Rate Limiting Infrastructure, Code Review Suggestions, Type Consolidation, Import Cleanup & Config, Data Layer & Action Cleanup, Auth Security & React Pattern Fixes, Streaming & Suspense Performance

### Community 76 - "Code Review and Cleanup"
Cohesion: 0.21
Nodes (9): limiters, noopLimiter, RateLimiter, RateLimitResult, AUTH_PATHS, config, proxy(), PUBLIC_PATHS (+1 more)

### Community 78 - "Proxy Configuration"
Cohesion: 0.40
Nodes (5): Marketing Landing Page, Public Pages, Auth Pages Redesign, App Shell Redesign, Task Page Redesign

### Community 79 - "Category Management Pages"
Cohesion: 0.40
Nodes (4): getCurrentUserId, getSession, requireAuth, requireUserId

### Community 82 - "Animation References"
Cohesion: 0.83
Nodes (4): Branching Strategy, Commit Conventions, AI Interaction Guidelines, AI Interaction Workflow

### Community 84 - "Development Guidelines"
Cohesion: 0.50
Nodes (3): plugin, $schema, .opencode/plugins/graphify.js

### Community 123 - "Database Seed"
Cohesion: 0.50
Nodes (4): MockCategory, MockTask, relativeDate(), seed()

## Knowledge Gaps
- **401 isolated node(s):** `$schema`, `.opencode/plugins/graphify.js`, `metadata`, `TaskDetailPageProps`, `TasksPageProps` (+396 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **34 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Modern JavaScript Utilities` to `Breadcrumbs and Accordion`, `Error Handling`, `Mobile Navigation`, `Task Completion Metrics`, `Design Utilities`, `Accessibility Audit Resources`, `File Generation Utilities`, `Session Management`, `Design Extraction Tools`, `Sidebar Navigation`, `Event Handling Utilities`, `Task Dialogs`, `Task Prioritization`, `Category Management`, `Dashboard Overview`, `Timezone Selection`, `Legal Information Pages`, `Component Registry`, `Authentication Actions`, `Button Group Components`, `Form Components`, `Live Annotation Management`, `Task Actions`, `Live Injection Scripts`, `Context Menu Components`, `Parameter Management`, `Authentication Forms`, `Mock Data Utilities`, `Skill Management Utilities`, `Session Store Management`, `CSP Detection Utilities`, `Security Settings`, `Context Management`, `Loading Components`, `Accessibility Guidelines`, `Database Utilities`?**
  _High betweenness centrality (0.400) - this node is a cross-community bridge._
- **Why does `dependencies` connect `UI Component Libraries` to `Next.js Configuration`, `Development Dependencies`, `Date Picker Component`, `Resizable Panels`, `Email Resending`, `Code Review Documentation`, `Schema Validation`, `PostCSS Configuration`, `Code Review Report`, `Coding Standards`, `Current Features`, `Task Management Overview`, `Mock Data Utilities`, `Design System`, `Global Error Handling`?**
  _High betweenness centrality (0.213) - this node is a cross-community bridge._
- **Why does `react` connect `Mock Data Utilities` to `Authentication Actions`, `Context Menu Components`, `UI Component Libraries`, `Session Management`, `Task Management Pages`?**
  _High betweenness centrality (0.212) - this node is a cross-community bridge._
- **What connects `$schema`, `.opencode/plugins/graphify.js`, `metadata` to the rest of the system?**
  _401 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Error Handling` be split into smaller, more focused modules?**
  _Cohesion score 0.10873440285204991 - nodes in this community are weakly interconnected._
- **Should `Modern JavaScript Utilities` be split into smaller, more focused modules?**
  _Cohesion score 0.05144230769230769 - nodes in this community are weakly interconnected._
- **Should `User Preferences Management` be split into smaller, more focused modules?**
  _Cohesion score 0.12258064516129032 - nodes in this community are weakly interconnected._