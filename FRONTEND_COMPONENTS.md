# Frontend Component Documentation

## Overview
This document provides detailed information about the frontend components implemented for the Above Sky Calendar application.

## Component Architecture

All components follow Angular 17's standalone component pattern with:
- TypeScript for type safety
- RxJS for reactive programming
- Service layer for API communication
- Responsive CSS design
- CommonModule, FormsModule, and RouterModule imports

## Components

### 1. Rewards Component

**Location:** `frontend/src/app/components/rewards/`

**Route:** `/rewards`

**Purpose:** Manage the family rewards system where users can browse, search, and redeem rewards using their earned points.

**Features:**
- Display all available rewards in a responsive grid
- Filter rewards by category
- Search rewards by name or description
- View current points balance
- Redeem rewards with confirmation modal
- View redemption history
- Real-time affordability check

**Key Methods:**
- `loadRewards()` - Fetches all active rewards from API
- `loadUserPoints()` - Retrieves current user's point balance
- `openRedeemModal(reward)` - Opens confirmation modal for redemption
- `confirmRedemption()` - Processes reward redemption
- `applyFilters()` - Filters rewards based on search and category

**API Integration:**
- `GET /api/rewards` - Fetch all rewards
- `POST /api/members/{memberId}/rewards/{rewardId}/redeem` - Redeem reward
- `GET /api/members/{memberId}/rewards/history` - Get redemption history

---

### 2. Meals Component

**Location:** `frontend/src/app/components/meals/`

**Route:** `/meals`

**Purpose:** Plan and organize family meals for the week with a visual calendar grid.

**Features:**
- 7-day weekly meal planner
- Organize meals by type (breakfast, lunch, dinner, snack)
- Create new meals quickly
- Navigate between weeks
- Visual grid showing all meals
- Delete meals

**Key Methods:**
- `loadWeeklyMeals()` - Fetches meals for current week
- `organizeWeeklyMeals()` - Organizes meals into grid structure
- `getMealsByType(dayIndex, mealType)` - Retrieves meals for specific day/type
- `previousWeek()` / `nextWeek()` - Navigate weeks
- `createMeal()` - Creates new meal
- `deleteMeal(id)` - Deletes meal

**API Integration:**
- `GET /api/meals` - Fetch all meals
- `POST /api/meals` - Create meal
- `PUT /api/meals/{id}` - Update meal
- `DELETE /api/meals/{id}` - Delete meal

---

### 3. Photos Component

**Location:** `frontend/src/app/components/photos/`

**Route:** `/photos`

**Purpose:** Share and view family photos in a gallery with lightbox viewer.

**Features:**
- Responsive photo grid layout
- Upload photos via URL
- Full-screen lightbox viewer
- Image navigation (previous/next)
- Keyboard shortcuts (←, →, ESC)
- Photo captions
- Delete photos

**Key Methods:**
- `loadPhotos()` - Fetches all photos
- `openLightbox(index)` - Opens photo in lightbox
- `previousPhoto()` / `nextPhoto()` - Navigate photos in lightbox
- `uploadPhoto()` - Uploads new photo
- `deletePhoto(id)` - Deletes photo
- `handleKeydown(event)` - Handles keyboard navigation

**API Integration:**
- `GET /api/photos` - Fetch all photos
- `POST /api/photos` - Upload photo
- `PUT /api/photos/{id}` - Update photo
- `DELETE /api/photos/{id}` - Delete photo

---

### 4. Lists Component

**Location:** `frontend/src/app/components/lists/`

**Route:** `/lists`

**Purpose:** Manage shared family lists (shopping, todo, packing, custom).

**Features:**
- Create multiple list types
- Add/remove list items
- Check off completed items
- Split-view design (list overview + detail panel)
- Shared list indicators
- Quick item addition
- Real-time updates

**Key Methods:**
- `loadLists()` - Fetches all lists
- `selectList(list)` - Opens list detail view
- `createList()` - Creates new list
- `addItem()` - Adds item to current list
- `toggleItem(item)` - Marks item as checked/unchecked
- `deleteItem(id)` / `deleteList(id)` - Delete operations

**API Integration:**
- `GET /api/lists` - Fetch all lists
- `POST /api/lists` - Create list
- `PUT /api/lists/{id}` - Update list
- `DELETE /api/lists/{id}` - Delete list
- `GET /api/lists/{id}/items` - Fetch list items
- `POST /api/lists/{id}/items` - Add item
- `PATCH /api/lists/{id}/items/{itemId}` - Update item
- `DELETE /api/lists/{id}/items/{itemId}` - Delete item

---

### 5. Calendar Component

**Location:** `frontend/src/app/components/calendar/`

**Route:** `/calendar`

**Purpose:** View and manage family events in a monthly calendar view.

**Features:**
- Monthly calendar grid
- Month navigation
- Day selection for event creation
- Visual event indicators
- Today highlighting
- Event creation modal
- Event deletion
- Multi-event days

**Key Methods:**
- `generateCalendar()` - Builds calendar grid for current month
- `loadEvents()` - Fetches all events
- `selectDate(date)` - Opens event creation modal
- `createEvent()` - Creates new event
- `getEventsForDate(date)` - Retrieves events for specific date
- `deleteEvent(id)` - Deletes event

**API Integration:**
- `GET /api/events` - Fetch all events
- `POST /api/events` - Create event
- `PUT /api/events/{id}` - Update event
- `DELETE /api/events/{id}` - Delete event

---

### 6. Dashboard Component

**Location:** `frontend/src/app/components/dashboard/`

**Route:** `/dashboard`

**Purpose:** Central hub with quick access to all features and upcoming events.

**Features:**
- Feature cards for navigation
- Quick access icons
- Upcoming events list
- Event creation
- Responsive grid layout

**Key Methods:**
- `loadEvents()` - Fetches upcoming events
- `createEvent()` - Creates new event
- `deleteEvent(id)` - Deletes event
- `logout()` - Logs out user

---

### 7. Tasks Component

**Location:** `frontend/src/app/components/tasks/`

**Route:** `/tasks`

**Purpose:** Manage family tasks and chores with reward points integration.

**Features:**
- Task creation with priority and status
- Filter by status
- Complete tasks
- Reward points display
- Delete tasks
- Status badges

**Key Methods:**
- `loadTasks()` - Fetches all tasks
- `applyFilter()` - Filters tasks by status
- `createTask()` - Creates new task
- `completeTask(task)` - Marks task as completed
- `deleteTask(id)` - Deletes task

**API Integration:**
- `GET /api/tasks` - Fetch all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/{id}` - Update task
- `POST /api/tasks/{id}/complete` - Complete task
- `DELETE /api/tasks/{id}` - Delete task

---

## Common Patterns

### Component Structure
```typescript
@Component({
  selector: 'app-component-name',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './component.html',
  styleUrls: ['./component.css']
})
export class ComponentName implements OnInit {
  // Properties
  // Constructor with service injection
  // ngOnInit() lifecycle hook
  // Methods
}
```

### Service Injection
All components inject required services via constructor:
```typescript
constructor(
  private service: Service,
  private authService: AuthService
) {}
```

### Error Handling
```typescript
this.service.method().subscribe({
  next: (data) => {
    // Success handling
  },
  error: (error) => {
    console.error('Error:', error);
    alert('User-friendly error message');
  }
});
```

### Navigation Bar
All pages include a consistent navigation bar:
```html
<nav class="navbar">
  <div class="navbar-brand">Above Sky Calendar</div>
  <div class="navbar-menu">
    <!-- Route links -->
  </div>
</nav>
```

## Responsive Design

All components implement responsive breakpoints:
- Desktop: > 768px (full layout)
- Tablet: 768px (adjusted grid)
- Mobile: < 768px (stacked/single column)

## Styling Conventions

- CSS files use consistent color scheme
- Primary color: `#3498db` (blue)
- Secondary color: `#95a5a6` (gray)
- Success: `#27ae60` (green)
- Warning: `#f39c12` (orange)
- Danger: `#e74c3c` (red)
- Background: `#f5f5f5` (light gray)
- Text: `#2c3e50` (dark blue-gray)

## Future Enhancements

### Priority Enhancements
1. **Recipe Manager** - Advanced recipe storage with ingredients and instructions
2. **Shopping List Generator** - Auto-generate from meal plans
3. **Photo Albums** - Organize photos into collections
4. **Comment System** - Add comments to photos
5. **Recurring Events** - Advanced recurring event patterns
6. **Week/Day Views** - Alternative calendar views
7. **Kanban Board** - Task management board view
8. **Task Templates** - Pre-built task templates
9. **Dashboard Widgets** - Customizable widget system
10. **Dark Mode** - Theme switching

### Advanced Features
- Drag and drop functionality
- Real-time collaboration
- Push notifications
- Offline support
- Advanced filtering and search
- Data export/import
- User preferences
- Achievement badges
- Leaderboards
- Activity feed

## Testing

### Unit Testing
Each component should have corresponding `.spec.ts` file for unit tests:
- Component initialization
- Method functionality
- Form validation
- Error handling

### Integration Testing
Test component interaction with services and API:
- API calls
- Data flow
- State management
- Navigation

### E2E Testing
Test complete user flows:
- User login
- Create/edit/delete operations
- Navigation between pages
- Form submissions

## Contributing

When adding new components:
1. Follow the existing component structure
2. Use TypeScript interfaces for type safety
3. Implement error handling
4. Add loading and empty states
5. Ensure responsive design
6. Include proper navigation
7. Document in this file
8. Add unit tests
9. Update README.md

## Support

For issues or questions about components:
1. Check component code and comments
2. Review API documentation
3. Check browser console for errors
4. Review network tab for API issues
5. Contact development team
