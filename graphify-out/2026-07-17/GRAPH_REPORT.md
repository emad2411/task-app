# Graph Report - C:\Users\Emad.LAPTOP-C995LHVB\Desktop\task-app  (2026-07-17)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1842 nodes · 3997 edges · 121 communities (93 shown, 28 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 53 edges (avg confidence: 0.7)
- Token cost: 4,468 input · 1,051 output

## Graph Freshness
- Built from commit: `261fe6a4`
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
- Feature Management
- Layout Components
- Pagination Components
- Live Completion Management
- Dashboard Testing Utilities
- Code Review Documentation
- Toggle Components
- Database Utilities
- Tabs Components
- Code Review and Cleanup
- Rate Limiting Utilities
- Proxy Configuration
- Category Management Pages
- Marketing and Auth Pages
- Session Management Utilities
- Animation References
- Loading Indicators
- Development Guidelines
- Hover Card Components
- Keyboard Shortcuts Hook
- Graph Utilities
- Delight References
- Distill References
- Pattern Extraction
- Utility Functions
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
- Authentication Methods
- Product Specifications
- Database Seed

## God Nodes (most connected - your core abstractions)
1. `cn()` - 346 edges
2. `Button()` - 49 edges
3. `TaskStatus` - 24 edges
4. `TaskPriority` - 24 edges
5. `handleActionError()` - 22 edges
6. `TaskFlow PRD` - 21 edges
7. `handleKeyDown()` - 19 edges
8. `handleClick()` - 18 edges
9. `resumeSession()` - 18 edges
10. `react` - 18 edges

## Surprising Connections (you probably didn't know these)
- `useScrollReveal()` --indirect_call--> `el()`  [INFERRED]
  hooks/use-scroll-reveal.ts → .agents/skills/impeccable/scripts/live-browser.js
- `SidebarProvider()` --indirect_call--> `handleKeyDown()`  [INFERRED]
  components/ui/sidebar.tsx → .agents/skills/impeccable/scripts/live-browser.js
- `LandingPage()` --calls--> `getSession()`  [EXTRACTED]
  app/page.tsx → lib/auth/session.ts
- `CategoryBadge()` --calls--> `cn()`  [EXTRACTED]
  components/categories/category-badge.tsx → lib/utils.ts
- `EditHint()` --calls--> `cn()`  [EXTRACTED]
  components/tasks/inline-edit.tsx → lib/utils.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Feature Workflow Actions** — feature_load_md, feature_start_md, feature_review_md, feature_test_md, feature_explain_md, feature_complete_md [EXTRACTED 0.90]
- **Animation Categories** — animation_reference [INFERRED 0.75]
- **Craft Flow Required References** — agents_skills_impeccable_reference_craft, agents_skills_impeccable_reference_audit, agents_skills_impeccable_reference_critique, agents_skills_impeccable_reference_color_and_contrast, agents_skills_impeccable_reference_interaction_design, agents_skills_impeccable_reference_layout, agents_skills_impeccable_reference_clarify [EXTRACTED 0.90]
- **Critique Dual Assessment System** — agents_skills_impeccable_reference_critique, agents_skills_impeccable_reference_cognitive_load, agents_skills_impeccable_reference_heuristics_scoring [EXTRACTED 0.95]
- **Impeccable Live Mode Script Ecosystem** — agents_skills_impeccable_reference_live_mjs, agents_skills_impeccable_reference_live_poll_mjs, agents_skills_impeccable_reference_live_wrap_mjs, agents_skills_impeccable_reference_live_accept_mjs, agents_skills_impeccable_reference_live_complete_mjs, agents_skills_impeccable_reference_live_status_mjs, agents_skills_impeccable_reference_live_resume_mjs, agents_skills_impeccable_reference_live_server_mjs, agents_skills_impeccable_reference_live_inject_mjs, detect_csp_mjs [EXTRACTED 0.90]
- **Impeccable Design Reference Suite** — agents_skills_impeccable_reference_motion_design, agents_skills_impeccable_reference_onboard, agents_skills_impeccable_reference_optimize, agents_skills_impeccable_reference_overdrive, agents_skills_impeccable_reference_personas, agents_skills_impeccable_reference_polish, agents_skills_impeccable_reference_product, agents_skills_impeccable_reference_quieter, agents_skills_impeccable_reference_responsive_design, agents_skills_impeccable_reference_shape, agents_skills_impeccable_reference_spatial_design, agents_skills_impeccable_reference_teach, agents_skills_impeccable_reference_typeset, agents_skills_impeccable_reference_typography, agents_skills_impeccable_reference_ux_writing [EXTRACTED 0.85]
- **TaskFlow Tech Stack** — nextjs_16, react_19, tailwind_v4, shadcn_ui, neon_postgres, drizzle_orm, better_auth, resend, zod_v4, upstash_ratelimit [EXTRACTED 0.90]
- **Design System Tokens** — color_tokens, typography_scale, spacing_scale, radius_scale [EXTRACTED 0.90]
- **Code Review Findings** — code_review_blockers, code_review_suggestions, code_review_nits [EXTRACTED 0.90]
- **TaskFlow Technology Stack** — nextjs_16, react_19, tailwind_v4, shadcn_ui, neon_postgresql, drizzle_orm, better_auth, resend_email, react_hook_form, zod_v4, proxy_ts [EXTRACTED 0.95]
- **Task Management Flow** — context_features_phase_2_03_task_management, context_features_phase_2_04_category_management, context_features_phase_2_05_task_filters_sorting_grouping [EXTRACTED 0.75]

## Communities (121 total, 28 thin omitted)

### Community 0 - "Breadcrumbs and Accordion"
Cohesion: 0.04
Nodes (59): Accordion(), AccordionContent(), AccordionItem(), AccordionTrigger(), AlertAction(), AlertTitle(), Breadcrumb(), BreadcrumbEllipsis() (+51 more)

### Community 1 - "Error Handling"
Cohesion: 0.08
Nodes (33): CategoryForm(), CategoryItemProps, CreateCategoryDialogProps, DeleteCategoryDialog(), DeleteCategoryDialogProps, EditCategoryDialog(), EditCategoryDialogProps, ArchiveTaskDialogProps (+25 more)

### Community 2 - "Modern JavaScript Utilities"
Cohesion: 0.09
Nodes (52): ae(), be(), bt(), Ce(), Ct(), de(), dt(), _e() (+44 more)

### Community 3 - "User Preferences Management"
Cohesion: 0.05
Nodes (47): dateFormatOptions, formatDatePreview(), PreferencesForm(), PreferencesFormProps, sortOptions, dueDateLabels, dueDateOptions, groupByOptions (+39 more)

### Community 4 - "Mobile Navigation"
Cohesion: 0.07
Nodes (34): getInitials(), MobileNav(), navItems, getInitials(), TopBar(), ThemeToggle(), Avatar(), AvatarBadge() (+26 more)

### Community 5 - "Task Completion Metrics"
Cohesion: 0.07
Nodes (39): CompletionTrend(), CompletionTrendProps, priorityColors, PriorityDonut(), PriorityDonutProps, WeeklyVelocity(), WeeklyVelocityProps, Carousel() (+31 more)

### Community 6 - "Development Dependencies"
Cohesion: 0.05
Nodes (44): drizzle-kit, eslint, eslint-config-next, jsdom, devDependencies, drizzle-kit, eslint, eslint-config-next (+36 more)

### Community 7 - "Live Interaction Scripts"
Cohesion: 0.07
Nodes (41): Accessibility Targets, Impeccable Live Mode Reference, live-accept.mjs Accept Script, live-complete.mjs Completion Script, live-inject.mjs Injection Script, live.mjs Boot Script, Interactive Live Variant Mode, live-poll.mjs Poll Script (+33 more)

### Community 8 - "Design Utilities"
Cohesion: 0.09
Nodes (47): bufferToBase64(), buildCollapsible(), buildColorModels(), buildDesignHeader(), buildListHtml(), buildRadiiModels(), buildTypographyModels(), captureElementToBlob() (+39 more)

### Community 9 - "Authentication Management"
Cohesion: 0.07
Nodes (34): { GET, POST }, NOTE: Only pass the auth-related tables to the adapter., accounts, sessions, users, verifications, sendPasswordResetEmail(), SendPasswordResetEmailOptions (+26 more)

### Community 10 - "Accessibility Audit Resources"
Cohesion: 0.06
Nodes (41): Accessibility Audit, Audit Reference, Audit Dimensions (5), Bolder Reference, Bolder Amplification Strategy, Brand Reference, Brand Register, Clarify Reference (+33 more)

### Community 11 - "File Generation Utilities"
Cohesion: 0.11
Nodes (38): hasGeneratedHeader(), HEADER_MARKERS, isGeneratedFile(), isGitIgnored(), acceptCli(), argVal(), deindentContent(), detectCommentSyntax() (+30 more)

### Community 12 - "UI Component Libraries"
Cohesion: 0.05
Nodes (37): @base-ui/react, @better-auth/drizzle-adapter, class-variance-authority, cmdk, date-fns, input-otp, lucide-react, @neondatabase/serverless (+29 more)

### Community 13 - "Session Management"
Cohesion: 0.12
Nodes (29): captureAndEmit(), checkpointPayload(), clearHandled(), clearScrollY(), clearSession(), compileShader(), cycleVariant(), extractContext() (+21 more)

### Community 14 - "Design Extraction Tools"
Cohesion: 0.16
Nodes (31): buildColor(), CANONICAL_SECTIONS, collectBullets(), collectColorValues(), collectParagraphs(), detectFormat(), extractColors(), extractComponents() (+23 more)

### Community 15 - "Task Management Pages"
Cohesion: 0.11
Nodes (24): TasksPage(), TasksPageProps, TaskDetailPage(), TaskDetailPageProps, TaskEmptyState(), TaskListLoader(), TaskListLoaderProps, TaskList() (+16 more)

### Community 16 - "Sidebar Navigation"
Cohesion: 0.12
Nodes (22): CategoryBadge(), CategoryBadgeProps, AppShellProps, MobileNavProps, getInitials(), SidebarFooter(), SidebarFooterProps, navItems (+14 more)

### Community 17 - "Task Management Overview"
Cohesion: 0.11
Nodes (28): Authentication Flow, Better Auth, Category Management, Context7 MCP, TaskFlow PRD, Dashboard Overview, Drizzle ORM, Neon MCP (+20 more)

### Community 18 - "Event Handling Utilities"
Cohesion: 0.18
Nodes (25): cleanup(), closeTunePopover(), connectSSE(), desc(), handleClick(), handleDiscard(), handleKeyDown(), handleMouseMove() (+17 more)

### Community 19 - "TypeScript Configuration"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 20 - "Live Server Management"
Cohesion: 0.13
Nodes (25): acknowledgePendingEvent(), annotRoot, args, broadcast(), CONTEXT_DIR, createRequestHandler(), { detectScript, sessionPath, livePath }, __dirname (+17 more)

### Community 21 - "Task Dialogs"
Cohesion: 0.09
Nodes (25): ArchiveTaskDialog(), DeleteTaskDialog(), EditTaskDialog(), EditTaskDialogProps, descriptionSchema, dueDateSchema, EditHint(), InlineCategoryEdit() (+17 more)

### Community 22 - "Task Prioritization"
Cohesion: 0.14
Nodes (20): UpcomingTasksProps, GroupedTask, GroupedTaskList(), GroupedTaskListProps, TaskGroup, PriorityBadge(), PriorityBadgeProps, priorityConfig (+12 more)

### Community 23 - "Combobox Components"
Cohesion: 0.09
Nodes (22): ComboboxChip(), ComboboxChips(), ComboboxChipsInput(), ComboboxClear(), ComboboxContent(), ComboboxEmpty(), ComboboxGroup(), ComboboxInput() (+14 more)

### Community 24 - "Category Management"
Cohesion: 0.15
Nodes (12): CategoryItem(), CategoryList(), CategoryListProps, CategoryWithTaskCount, getCategories(), getCategoryById(), mockFindFirst, mockFindMany (+4 more)

### Community 25 - "Sidebar Components"
Cohesion: 0.09
Nodes (25): Sidebar(), SidebarContent(), SidebarContext, SidebarContextProps, SidebarFooter(), SidebarGroup(), SidebarGroupAction(), SidebarGroupContent() (+17 more)

### Community 26 - "Marketing Layouts"
Cohesion: 0.13
Nodes (15): LandingPage(), CTASection(), CTASectionProps, DashboardPreview(), FeatureRow(), FeatureRowProps, FeaturesSection(), MacBrowserFrameProps (+7 more)

### Community 27 - "Authentication Pages"
Cohesion: 0.11
Nodes (18): NotFound(), ForgotPasswordPage(), ResetPasswordPage(), SignInPage(), SignUpPage(), VerifyEmailPage(), AuthPageSkeleton(), BrandPane() (+10 more)

### Community 28 - "Dashboard Overview"
Cohesion: 0.17
Nodes (18): DashboardPage(), CategoryBreakdown(), CategoryBreakdownProps, DashboardEmptyState(), metrics, MetricsStrip(), MetricsStripProps, CategoryBreakdownItem (+10 more)

### Community 29 - "Task Activity Tracking"
Cohesion: 0.21
Nodes (18): priorityConfig, UpcomingTasks(), ActivityEvent, deriveEvents(), TaskActivityTimeline(), TaskDetailView(), TaskRow(), Badge() (+10 more)

### Community 30 - "Timezone Selection"
Cohesion: 0.13
Nodes (18): TimezoneCombobox(), TimezoneComboboxProps, Command(), CommandDialog(), CommandEmpty(), CommandGroup(), CommandInput(), CommandItem() (+10 more)

### Community 31 - "Legal Information Pages"
Cohesion: 0.11
Nodes (11): metadata, metadata, metadata, metadata, toc, metadata, toc, ContactForm() (+3 more)

### Community 32 - "Component Registry"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 33 - "Authentication Actions"
Cohesion: 0.18
Nodes (19): forgotPasswordAction(), getClientIp(), resetPasswordAction(), signInAction(), signUpAction(), updatePasswordAction(), auth, ForgotPasswordInput (+11 more)

### Community 34 - "Account Management Schema"
Cohesion: 0.09
Nodes (21): Account, accountsRelations, categoriesRelations, NewAccount, NewCategory, NewRateLimit, NewSession, NewTask (+13 more)

### Community 35 - "User Preferences Settings"
Cohesion: 0.15
Nodes (16): AppearanceForm(), AppearanceFormProps, themes, updatePreferencesAction(), updateProfileAction(), mockRequireUserId, mockRevalidateTag, mockUpdateUser (+8 more)

### Community 36 - "Design Panel Utilities"
Cohesion: 0.20
Nodes (19): barPaletteForTheme(), buildParamsPanel(), defangOutsideHandlers(), designPanelCss(), detectPageTheme(), formatRangeValue(), init(), initActionPicker() (+11 more)

### Community 37 - "Button Group Components"
Cohesion: 0.13
Nodes (17): ButtonGroup(), ButtonGroupSeparator(), ButtonGroupText(), buttonGroupVariants, Item(), ItemActions(), ItemContent(), ItemDescription() (+9 more)

### Community 38 - "Form Components"
Cohesion: 0.28
Nodes (12): CategoryFormProps, categoryNameSchema, FormValues, ContactFormInput, contactSchema, ProfileFormProps, Field(), FieldError() (+4 more)

### Community 39 - "Live Annotation Management"
Cohesion: 0.20
Nodes (16): firstExisting(), getDesignSidecarCandidates(), getDesignSidecarPath(), getImpeccableDir(), getLegacyLiveConfigPath(), getLegacyLiveServerPath(), getLiveAnnotationsDir(), getLiveConfigPath() (+8 more)

### Community 40 - "Task Actions"
Cohesion: 0.18
Nodes (18): createCategoryAction(), deleteCategoryAction(), updateCategoryAction(), archiveTaskAction(), createTaskAction(), deleteTaskAction(), toggleTaskCompletionAction(), updateTaskAction() (+10 more)

### Community 41 - "Annotation Management"
Cohesion: 0.23
Nodes (16): beginEditPin(), buildAnnotationsForCapture(), buildPinElement(), cancelEditingPin(), clearAnnotations(), finalizeEditingPin(), initAnnotOverlay(), localCoords() (+8 more)

### Community 42 - "Live Injection Scripts"
Cohesion: 0.23
Nodes (15): appendOriginToDirective(), buildTagBlock(), commentClose(), commentOpen(), CONFIG_PATH, __dirname, findCspMetaTags(), getAttr() (+7 more)

### Community 43 - "Context Menu Components"
Cohesion: 0.12
Nodes (10): ContextMenuCheckboxItem(), ContextMenuContent(), ContextMenuItem(), ContextMenuLabel(), ContextMenuRadioItem(), ContextMenuSeparator(), ContextMenuShortcut(), ContextMenuSubContent() (+2 more)

### Community 44 - "Live Session Management"
Cohesion: 0.25
Nodes (12): getLegacyLiveSessionsDir(), readLiveServerInfo(), completeCli(), completeThroughServer(), parseArgs(), readServerInfo(), parseArgs(), resumeCli() (+4 more)

### Community 45 - "Parameter Management"
Cohesion: 0.24
Nodes (13): applyParamDefaults(), applyParamValue(), closedClipPath(), getVisibleVariantEl(), hideParamsPanel(), openTunePopover(), parseVariantParams(), popoverDirection() (+5 more)

### Community 46 - "Loading States"
Cohesion: 0.21
Nodes (4): CategorySkeleton(), TaskDetailSkeleton(), TaskSkeleton(), Skeleton()

### Community 47 - "User Preferences Page"
Cohesion: 0.27
Nodes (9): metadata, SettingsPage(), getUserPreferences(), upsertUserPreferences(), mockFindFirst, mockOnConflictDoUpdate, mockReturning, mockValues (+1 more)

### Community 48 - "Authentication Forms"
Cohesion: 0.23
Nodes (10): BackToSignInLink(), ResetPasswordFormInput, resetPasswordFormSchema, SuccessState(), SuccessStateProps, VerifyEmailHandler(), Alert(), AlertDescription() (+2 more)

### Community 49 - "Mock Data Utilities"
Cohesion: 0.25
Nodes (7): mockFindFirst, mockGetCurrentUserId, mockReturning, mockRevalidateTag, mockSet, mockValues, mockWhere

### Community 50 - "Alert Dialogs"
Cohesion: 0.15
Nodes (9): AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader(), AlertDialogMedia(), AlertDialogOverlay() (+1 more)

### Community 51 - "Skill Management Utilities"
Cohesion: 0.30
Nodes (11): buildTargetNames(), cleanSkillsLock(), cleanup(), DEPRECATED_NAMES, findProjectRoot(), findSkillsDirs(), HARNESS_DIRS, isImpeccableSkill() (+3 more)

### Community 52 - "Session Store Management"
Cohesion: 0.26
Nodes (9): applyEvent(), baseSnapshot(), COMPLETED_PHASES, getJournalPath(), getSnapshotPath(), rebuildSnapshotFromJournal(), safeSessionId(), toPendingEvent() (+1 more)

### Community 53 - "CSP Detection Utilities"
Cohesion: 0.36
Nodes (10): detectCsp(), INLINE_HEADER_SIGNALS, LAYOUT_EXTS, MONOREPO_HELPER_SIGNALS, NUXT_ROUTE_RULES_SIGNALS, NUXT_SECURITY_SIGNALS, SCAN_EXTS, SKIP_DIRS (+2 more)

### Community 54 - "Project Management Utilities"
Cohesion: 0.25
Nodes (9): __dirname, findHarnessDirs(), generatePinnedSkill(), HARNESS_DIRS, loadCommandMetadata(), pin(), root, unpin() (+1 more)

### Community 55 - "Security Settings"
Cohesion: 0.20
Nodes (9): ProfileForm(), SecurityForm(), SecurityFormInput, securityFormSchema, NavItem, navItems, PreferencesData, SettingsTabs() (+1 more)

### Community 56 - "Drawer Components"
Cohesion: 0.18
Nodes (6): DrawerContent(), DrawerDescription(), DrawerFooter(), DrawerHeader(), DrawerOverlay(), DrawerTitle()

### Community 57 - "Task Management Utilities"
Cohesion: 0.25
Nodes (8): Task, formatDueDateBucketLabel(), formatStatusLabel(), groupTasks(), TaskGroup, TaskWithCategory, categoryPersonal, categoryWork

### Community 58 - "Live Server Utilities"
Cohesion: 0.38
Nodes (9): __dirname, ensureServerRunning(), globToRegex(), globToRegex(), resolveFiles(), liveCli(), runScript(), safeParse() (+1 more)

### Community 59 - "Session Management Utilities"
Cohesion: 0.25
Nodes (15): actionLabel(), buildConfigureRow(), buildConfirmedRow(), buildCyclingRow(), buildDots(), buildGeneratingRow(), buildSavingRow(), el() (+7 more)

### Community 60 - "Context Management"
Cohesion: 0.31
Nodes (9): cli(), DESIGN_NAMES, FALLBACK_DIRS, firstExisting(), LEGACY_NAMES, loadContext(), PRODUCT_NAMES, resolveContextDir() (+1 more)

### Community 61 - "Loading Components"
Cohesion: 0.27
Nodes (7): Card(), CardAction(), CardContent(), CardDescription(), CardFooter(), CardHeader(), CardTitle()

### Community 62 - "Form Input Components"
Cohesion: 0.24
Nodes (7): DividerWithText(), DividerWithTextProps, GoogleAuthButton(), GoogleAuthButtonProps, SignUpFormInput, SignUpFormProps, signUpFormSchema

### Community 63 - "Category Management Tools"
Cohesion: 0.29
Nodes (7): ColorPicker(), ColorPickerProps, CATEGORY_COLORS, CreateCategoryInput, createCategorySchema, UpdateCategoryInput, updateCategorySchema

### Community 64 - "Navigation Menu Components"
Cohesion: 0.22
Nodes (9): NavigationMenu(), NavigationMenuContent(), NavigationMenuIndicator(), NavigationMenuItem(), NavigationMenuLink(), NavigationMenuList(), NavigationMenuTrigger(), navigationMenuTriggerStyle (+1 more)

### Community 65 - "Project Setup Overview"
Cohesion: 0.20
Nodes (10): Project Initialization & Foundation Setup, Neon + Drizzle Setup, Schema Generation & Migration, Better Auth Core Setup, Resend Email Integration, Auth Pages UI, Dashboard Overview, Task Management (CRUD) (+2 more)

### Community 66 - "Accessibility Guidelines"
Cohesion: 0.31
Nodes (9): Accessibility Guidelines (WCAG), UI/UX Pro Max Skill, Animation Guidelines, Charts & Data Guidelines, Forms & Feedback Guidelines, Navigation Patterns, Performance Guidelines, Touch & Interaction Guidelines (+1 more)

### Community 67 - "Feature Management"
Cohesion: 0.22
Nodes (9): feature skill, Feature Actions, feature complete action, feature explain action, feature load action, feature review action, feature start action, feature test action (+1 more)

### Community 68 - "Layout Components"
Cohesion: 0.28
Nodes (5): geistMono, inter, metadata, ThemeProvider(), Toaster()

### Community 69 - "Pagination Components"
Cohesion: 0.22
Nodes (7): Pagination(), PaginationContent(), PaginationEllipsis(), PaginationLink(), PaginationLinkProps, PaginationNext(), PaginationPrevious()

### Community 70 - "Live Completion Management"
Cohesion: 0.50
Nodes (6): completionAckForAcceptResult(), completionTypeForAcceptResult(), buildPollReplyPayload(), pollCli(), postReply(), readServerInfo()

### Community 71 - "Dashboard Testing Utilities"
Cohesion: 0.25
Nodes (6): mockFindFirst, mockFindMany, mockGroupBy, mockSelect, mockSelectFrom, mockSelectWhere

### Community 72 - "Code Review Documentation"
Cohesion: 0.29
Nodes (6): Code Review Blockers, Code Review Nits, code-review-report.md (2026-04-29), Code Review Suggestions, @upstash/ratelimit, Upstash Ratelimit

### Community 73 - "Toggle Components"
Cohesion: 0.43
Nodes (5): ToggleGroup(), ToggleGroupContext, ToggleGroupItem(), Toggle(), toggleVariants

### Community 74 - "Database Utilities"
Cohesion: 0.29
Nodes (6): db, mockFindFirst, mockReturning, mockSet, mockValues, mockWhere

### Community 75 - "Tabs Components"
Cohesion: 0.40
Nodes (5): Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger()

### Community 76 - "Code Review and Cleanup"
Cohesion: 0.33
Nodes (6): Rate Limiting Infrastructure, Code Review Suggestions, Type Consolidation, Import Cleanup & Config, Data Layer & Action Cleanup, Auth Security & React Pattern Fixes, Streaming & Suspense Performance

### Community 77 - "Rate Limiting Utilities"
Cohesion: 0.33
Nodes (4): limiters, noopLimiter, RateLimiter, RateLimitResult

### Community 78 - "Proxy Configuration"
Cohesion: 0.53
Nodes (5): AUTH_PATHS, config, proxy(), PUBLIC_PATHS, STATIC_PATHS

### Community 79 - "Category Management Pages"
Cohesion: 0.27
Nodes (9): CategoriesPage(), AuthenticatedLayout(), CategoryEmptyState(), CreateCategoryDialog(), AppShell(), requireAuth(), requireUserId(), getCategoriesForUser() (+1 more)

### Community 80 - "Marketing and Auth Pages"
Cohesion: 0.40
Nodes (5): Marketing Landing Page, Public Pages, Auth Pages Redesign, App Shell Redesign, Task Page Redesign

### Community 81 - "Session Management Utilities"
Cohesion: 0.40
Nodes (4): getCurrentUserId, getSession, requireAuth, requireUserId

### Community 82 - "Animation References"
Cohesion: 0.50
Nodes (4): animate reference, impeccable skill, Animation Reference, Impeccable

### Community 84 - "Development Guidelines"
Cohesion: 0.83
Nodes (4): Branching Strategy, Commit Conventions, AI Interaction Guidelines, AI Interaction Workflow

## Knowledge Gaps
- **449 isolated node(s):** `DEPRECATED_NAMES`, `HARNESS_DIRS`, `SKILL_FINGERPRINTS`, `CANONICAL_SECTIONS`, `NUXT_ROUTE_RULES_SIGNALS` (+444 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Breadcrumbs and Accordion` to `Error Handling`, `User Preferences Management`, `Mobile Navigation`, `Task Completion Metrics`, `Sidebar Navigation`, `Task Dialogs`, `Task Prioritization`, `Combobox Components`, `Category Management`, `Sidebar Components`, `Marketing Layouts`, `Task Activity Tracking`, `Timezone Selection`, `User Preferences Settings`, `Button Group Components`, `Form Components`, `Context Menu Components`, `Loading States`, `Authentication Forms`, `Alert Dialogs`, `Security Settings`, `Drawer Components`, `Loading Components`, `Category Management Tools`, `Navigation Menu Components`, `Pagination Components`, `Toggle Components`, `Tabs Components`, `Category Management Pages`, `Loading Indicators`, `Hover Card Components`?**
  _High betweenness centrality (0.369) - this node is a cross-community bridge._
- **Why does `SidebarProvider()` connect `Task Completion Metrics` to `Breadcrumbs and Accordion`, `Sidebar Components`, `Event Handling Utilities`?**
  _High betweenness centrality (0.219) - this node is a cross-community bridge._
- **Why does `handleKeyDown()` connect `Event Handling Utilities` to `Design Panel Utilities`, `Task Completion Metrics`, `Design Utilities`, `Annotation Management`, `Session Management`, `Session Management Utilities`?**
  _High betweenness centrality (0.209) - this node is a cross-community bridge._
- **What connects `DEPRECATED_NAMES`, `HARNESS_DIRS`, `SKILL_FINGERPRINTS` to the rest of the system?**
  _449 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Breadcrumbs and Accordion` be split into smaller, more focused modules?**
  _Cohesion score 0.03981481481481482 - nodes in this community are weakly interconnected._
- **Should `Error Handling` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._
- **Should `Modern JavaScript Utilities` be split into smaller, more focused modules?**
  _Cohesion score 0.09224318658280922 - nodes in this community are weakly interconnected._