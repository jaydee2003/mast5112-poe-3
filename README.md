# Greenleaf Menu Manager — MAST5112 Final PoE

This project continues the React Native / Expo Chef's Menu Manager application from Part 2.

## Final PoE features

### 1. Manage Menu Items — 25 marks
- Add menu items.
- Edit existing menu items.
- Update name, description, course and price.
- Delete menu items with confirmation.
- Changes are reflected immediately.

### 2. Search and Filter — 20 marks
- Search menu items by name.
- Filter by Starter, Main Course or Dessert.
- Clear the search and filter to display all items again.
- Results update immediately.

### 3. Display Menu Statistics — 20 marks
- Total number of menu items.
- Average price of all menu items.
- Number of Starters.
- Number of Main Courses.
- Number of Desserts.
- Statistics update automatically when items are added, edited or deleted.

### 4. Application Enhancements — 20 marks
- Reusable Button, Field, CourseSelect, NavItem and MenuCard components.
- Reusable validation and filtering logic.
- Meaningful variable and function names.
- Consistent Greenleaf visual design.
- Improved validation and user feedback.
- Cleaner layout and code organisation.
- Responsive Expo web support.

### 5. User Experience — 10 marks
- Clear bottom navigation.
- Consistent buttons, cards and form controls.
- Helpful success, validation and delete-confirmation feedback.
- Empty states and no-results states.
- Accessible button labels.

## Part 2 → Final PoE changelog

### Functionality added
- Added edit functionality for existing menu items.
- Added update functionality for menu item details.
- Added delete functionality with confirmation.
- Added name search.
- Added course filtering.
- Added clear-search/filter control.
- Added average menu price statistic.
- Added live course statistics.
- Added immediate UI updates after CRUD operations.

### Refactoring and improvements
- Reused common Button, Field, CourseSelect, NavItem and MenuCard components.
- Centralised form state and validation.
- Improved duplicate-name validation.
- Improved user feedback after add, update and delete actions.
- Improved empty and no-results states.
- Improved menu card actions and navigation.
- Fixed the menu-list implementation so `FlatList` is explicitly imported and used.
- Updated the project version to 2.0.0.

## How to run

1. Open the `Greenleaf_Menu_Manager_Final` folder in VS Code.
2. Open a terminal in the project folder.
3. Run:

```bash
npm install
npm start
```

4. For the web version, press `w` in the Expo terminal.
5. For a phone, open Expo Go and scan the QR code when the network permits it.

## Suggested demonstration order

For the required 5–8 minute video:

1. Open the dashboard and show the statistics.
2. Add three menu items — one Starter, one Main Course and one Dessert.
3. Return to Menu Manager and show the updated statistics.
4. Edit one item and change its price/course/description.
5. Search for a dish by name.
6. Filter by course.
7. Clear the search/filter.
8. Delete one item and show that the list and statistics update.
9. Finish by showing the dashboard and overall application.

## Submission checklist

- [ ] Application runs successfully.
- [ ] Latest code is uploaded to GitHub.
- [ ] README includes the changelog.
- [ ] 5–8 minute demonstration video is recorded.
- [ ] Video is uploaded to YouTube as Unlisted.
- [ ] YouTube link is included in the final submission.
- [ ] GitHub repository link is included in the final submission.
