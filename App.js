import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList
} from "react-native";

const COURSES = ["Starter", "Main Course", "Dessert"];

const EMPTY_FORM = {
  name: "",
  description: "",
  course: "",
  price: ""
};

function Button({ title, onPress, variant = "primary", compact = false }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        compact ? styles.compactButton : null,
        variant === "primary" ? styles.primaryButton : null,
        variant === "secondary" ? styles.secondaryButton : null,
        variant === "danger" ? styles.dangerButton : null,
        pressed && styles.buttonPressed
      ]}
    >
      <Text
        style={
          variant === "primary"
            ? styles.primaryButtonText
            : variant === "danger"
            ? styles.dangerButtonText
            : styles.secondaryButtonText
        }
      >
        {title}
      </Text>
    </Pressable>
  );
}

function Field({ label, required, error, children }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      {children}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

function CourseSelect({ value, onChange, hasError }) {
  const [open, setOpen] = useState(false);

  return (
    <View style={[styles.pickerContainer, hasError && styles.inputError]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Select course"
        onPress={() => setOpen((previous) => !previous)}
        style={styles.selectButton}
      >
        <Text style={[styles.selectButtonText, !value && styles.selectPlaceholder]}>
          {value || "Select a course..."}
        </Text>
        <Text style={styles.selectChevron}>{open ? "▲" : "▼"}</Text>
      </Pressable>

      {open ? (
        <View style={styles.selectOptions}>
          {COURSES.map((option) => (
            <Pressable
              key={option}
              onPress={() => {
                onChange(option);
                setOpen(false);
              }}
              style={({ pressed }) => [
                styles.selectOption,
                pressed && styles.selectOptionPressed
              ]}
            >
              <Text style={styles.selectOptionText}>{option}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function NavItem({ icon, label, active, onPress }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={styles.navItem}>
      <Text style={[styles.navIcon, active && styles.navActive]}>{icon}</Text>
      <Text style={[styles.navLabel, active && styles.navActive]}>{label}</Text>
    </Pressable>
  );
}

function MenuCard({ item, index, onEdit, onDelete }) {
  return (
    <View style={styles.menuCard}>
      <View style={styles.itemNumber}>
        <Text style={styles.itemNumberText}>{index + 1}</Text>
      </View>

      <View style={styles.itemBody}>
        <View style={styles.cardTop}>
          <Text style={styles.dishName}>{item.name}</Text>
          <Text style={styles.price}>R {item.price}</Text>
        </View>

        <Text style={styles.courseBadge}>{item.course}</Text>
        <Text style={styles.description}>{item.description}</Text>

        <View style={styles.cardActions}>
          <View style={styles.actionHalf}>
            <Button title="Edit" variant="secondary" compact onPress={() => onEdit(item)} />
          </View>
          <View style={styles.actionHalf}>
            <Button title="Delete" variant="danger" compact onPress={() => onDelete(item)} />
          </View>
        </View>
      </View>
    </View>
  );
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [searchText, setSearchText] = useState("");
  const [courseFilter, setCourseFilter] = useState("All");

  const counts = useMemo(
    () => ({
      total: items.length,
      Starter: items.filter((item) => item.course === "Starter").length,
      "Main Course": items.filter((item) => item.course === "Main Course").length,
      Dessert: items.filter((item) => item.course === "Dessert").length
    }),
    [items]
  );

  const averagePrice = useMemo(() => {
    if (!items.length) return "0.00";
    const total = items.reduce((sum, item) => sum + Number(item.price), 0);
    return (total / items.length).toFixed(2);
  }, [items]);

  const visibleItems = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return items.filter((item) => {
      const matchesName = !query || item.name.toLowerCase().includes(query);
      const matchesCourse = courseFilter === "All" || item.course === courseFilter;
      return matchesName && matchesCourse;
    });
  }, [items, searchText, courseFilter]);

  const navigate = (nextScreen) => {
    setMessage("");
    setScreen(nextScreen);
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setErrors({});
  };

  const openAdd = () => {
    resetForm();
    navigate("add");
  };

  const openEdit = (item) => {
    setForm({
      name: item.name,
      description: item.description,
      course: item.course,
      price: item.price
    });
    setEditingId(item.id);
    setErrors({});
    navigate("add");
  };

  const validate = () => {
    const nextErrors = {};
    const cleanedPrice = form.price.trim().replace(",", ".");

    if (!form.name.trim()) {
      nextErrors.name = "Dish name is required.";
    } else if (form.name.trim().length < 2) {
      nextErrors.name = "Dish name must contain at least 2 characters.";
    }

    if (!form.description.trim()) {
      nextErrors.description = "Description is required.";
    } else if (form.description.trim().length < 5) {
      nextErrors.description = "Please provide a more descriptive dish summary.";
    }

    if (!form.course) {
      nextErrors.course = "Please select a course.";
    }

    if (!cleanedPrice) {
      nextErrors.price = "Price is required.";
    } else if (!/^\d+(\.\d{1,2})?$/.test(cleanedPrice) || Number(cleanedPrice) <= 0) {
      nextErrors.price = "Enter a valid price greater than R0.00.";
    }

    const duplicate = items.some(
      (item) =>
        item.id !== editingId &&
        item.name.trim().toLowerCase() === form.name.trim().toLowerCase()
    );

    if (duplicate) {
      nextErrors.name = "A menu item with this name already exists.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const saveItem = () => {
    if (!validate()) return;

    const cleanedPrice = Number(form.price.trim().replace(",", ".")).toFixed(2);

    if (editingId) {
      setItems((previous) =>
        previous.map((item) =>
          item.id === editingId
            ? {
                ...item,
                name: form.name.trim(),
                description: form.description.trim(),
                course: form.course,
                price: cleanedPrice
              }
            : item
        )
      );
      setMessage(`${form.name.trim()} was successfully updated.`);
    } else {
      const newItem = {
        id: `${Date.now()}-${Math.random()}`,
        name: form.name.trim(),
        description: form.description.trim(),
        course: form.course,
        price: cleanedPrice
      };

      setItems((previous) => [...previous, newItem]);
      setMessage(`${newItem.name} was successfully added.`);
    }

    resetForm();
    navigate("menu");
  };

  const deleteItem = (item) => {
    const remove = () => {
      setItems((previous) => previous.filter((entry) => entry.id !== item.id));
      setMessage(`${item.name} was deleted from the menu.`);
    };

    if (Platform.OS === "web") {
      const confirmed = typeof window !== "undefined"
        ? window.confirm(`Delete "${item.name}" from the menu?`)
        : true;
      if (confirmed) remove();
      return;
    }

    Alert.alert(
      "Delete menu item",
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: remove }
      ]
    );
  };

  const HomeScreen = () => (
    <ScrollView contentContainerStyle={styles.pageContent}>
      <View style={styles.hero}>
        <View style={styles.brandRow}>
          <View style={styles.logoCircle}>
            <Text style={styles.logo}>🍃</Text>
          </View>
          <View style={styles.brandText}>
            <Text style={styles.brandName}>Greenleaf</Text>
            <Text style={styles.brandTagline}>RESTAURANT MENU</Text>
          </View>
        </View>

        <Text style={styles.heroTitle}>Chef's Menu Manager</Text>
        <Text style={styles.heroSubtitle}>
          Add, edit, search, filter and manage your restaurant menu from one simple app.
        </Text>
      </View>

      <Text style={styles.sectionHeading}>Menu statistics</Text>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.totalCard]}>
          <Text style={styles.statNumber}>{counts.total}</Text>
          <Text style={styles.statLabel}>Total Items</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>R {averagePrice}</Text>
          <Text style={styles.statLabel}>Average Price</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{counts.Starter}</Text>
          <Text style={styles.statLabel}>Starters</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{counts["Main Course"]}</Text>
          <Text style={styles.statLabel}>Main Courses</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{counts.Dessert}</Text>
          <Text style={styles.statLabel}>Desserts</Text>
        </View>
      </View>

      <View style={styles.actionCard}>
        <Text style={styles.actionTitle}>Manage your menu</Text>
        <Text style={styles.actionText}>
          Create a menu item or open the menu manager to edit, delete, search and filter existing dishes.
        </Text>

        <Button title="＋  Add Menu Item" onPress={openAdd} />
        <Button title="View All Menu Items" onPress={() => navigate("menu")} variant="secondary" />
      </View>

      <View style={styles.tipCard}>
        <Text style={styles.tipIcon}>✓</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.tipTitle}>Final PoE features</Text>
          <Text style={styles.tipText}>
            CRUD management, search and filtering, live statistics, validation, feedback and a consistent mobile-friendly design.
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  const AddScreen = () => (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.pageContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.pageHeader}>
          <Text style={styles.screenTitle}>
            {editingId ? "Edit Menu Item" : "Add Menu Item"}
          </Text>
          <Text style={styles.screenSubtitle}>
            {editingId
              ? "Update the selected menu item and save your changes."
              : "Complete all required fields before saving."}
          </Text>
        </View>

        <View style={styles.formCard}>
          <Field label="Dish Name" required error={errors.name}>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="e.g. Herb Grilled Chicken"
              placeholderTextColor="#8B9688"
              onChangeText={(value) => setform ((previous) =>({...previous,name:value}))}
              autoCapitalize="words"
            />
          </Field>

          <Field label="Description" required error={errors.description}>
            <TextInput
              style={[styles.input, styles.textArea, errors.description && styles.inputError]}
              placeholder="Describe the dish and its key ingredients"
              placeholderTextColor="#8B9688"
              value={form.description}
              onChangeText={(value) => {
                setForm((previous) => ({ ...previous, description: value }));
                if (errors.description) {
                  setErrors((previous) => ({ ...previous, description: undefined }));
                }
              }}
              multiline
              textAlignVertical="top"
            />
          </Field>

          <Field label="Course" required error={errors.course}>
            <CourseSelect
              value={form.course}
              onChange={(value) => {
                setForm((previous) => ({ ...previous, course: value }));
                if (errors.course) {
                  setErrors((previous) => ({ ...previous, course: undefined }));
                }
              }}
              hasError={!!errors.course}
            />
          </Field>

          <Field label="Price (R)" required error={errors.price}>
            <TextInput
              style={[styles.input, errors.price && styles.inputError]}
              placeholder="e.g. 95.00"
              placeholderTextColor="#8B9688"
              value={form.price}
              onChangeText={(value) => {
                setForm((previous) => ({ ...previous, price: value }));
                if (errors.price) setErrors((previous) => ({ ...previous, price: undefined }));
              }}
              keyboardType="decimal-pad"
            />
          </Field>

          <View style={styles.formNote}>
            <Text style={styles.formNoteText}>* Required information</Text>
          </View>

          <View style={styles.formButtons}>
            <View style={styles.buttonHalf}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => {
                  resetForm();
                  navigate("menu");
                }}
              />
            </View>
            <View style={styles.buttonHalf}>
              <Button
                title={editingId ? "Update Item" : "Save Menu Item"}
                onPress={saveItem}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const MenuScreen = () => (
    <View style={styles.flex}>
      <View style={styles.menuTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.screenTitle}>Menu Manager</Text>
          <Text style={styles.screenSubtitle}>
            {items.length === 0
              ? "No menu items have been added yet."
              : `${visibleItems.length} of ${items.length} item${items.length === 1 ? "" : "s"} shown`}
          </Text>
        </View>
        <Pressable style={styles.compactAdd} onPress={openAdd}>
          <Text style={styles.compactAddText}>＋ Add</Text>
        </Pressable>
      </View>

      <View style={styles.searchArea}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by dish name..."
          placeholderTextColor="#8B9688"
          value={searchText}
          onChangeText={setSearchText}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {["All", ...COURSES].map((course) => (
            <Pressable
              key={course}
              onPress={() => setCourseFilter(course)}
              style={[
                styles.filterChip,
                courseFilter === course && styles.filterChipActive
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  courseFilter === course && styles.filterChipTextActive
                ]}
              >
                {course}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {(searchText || courseFilter !== "All") ? (
          <Pressable
            onPress={() => {
              setSearchText("");
              setCourseFilter("All");
            }}
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonText}>Clear search & filter</Text>
          </Pressable>
        ) : null}
      </View>

      {visibleItems.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyCircle}>
            <Text style={styles.emptyIcon}>🍽️</Text>
          </View>
          <Text style={styles.emptyTitle}>
            {items.length === 0 ? "Your menu is empty" : "No matching items"}
          </Text>
          <Text style={styles.emptyText}>
            {items.length === 0
              ? "Add your first menu item and it will appear here automatically."
              : "Try another search term or clear the filter to see all menu items."}
          </Text>
          {items.length === 0 ? (
            <View style={styles.emptyButton}>
              <Button title="＋ Add First Menu Item" onPress={openAdd} />
            </View>
          ) : (
            <Button
              title="Clear Search & Filter"
              variant="secondary"
              onPress={() => {
                setSearchText("");
                setCourseFilter("All");
              }}
            />
          )}
        </View>
      ) : (
        <FlatList
          data={visibleItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => (
            <MenuCard
              item={item}
              index={index}
              onEdit={openEdit}
              onDelete={deleteItem}
            />
          )}
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F8F2" />

      <View style={styles.container}>
        {message ? (
          <View style={styles.globalMessage}>
            <Text style={styles.globalMessageText}>✓ {message}</Text>
            <Pressable onPress={() => setMessage("")}>
              <Text style={styles.dismiss}>×</Text>
            </Pressable>
          </View>
        ) : null}

        {screen === "home" && <HomeScreen />}
        {screen === "add" && <AddScreen />}
        {screen === "menu" && <MenuScreen />}

        <View style={styles.navBar}>
          <NavItem icon="⌂" label="Home" active={screen === "home"} onPress={() => navigate("home")} />
          <NavItem icon="☷" label="Menu" active={screen === "menu"} onPress={() => navigate("menu")} />
          <NavItem icon="＋" label="Add Item" active={screen === "add"} onPress={openAdd} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F8F2" },
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: "#F5F8F2" },
  pageContent: { padding: 20, paddingBottom: 118 },

  hero: {
    backgroundColor: "#23482B",
    borderRadius: 24,
    padding: 24,
    marginBottom: 22
  },
  brandRow: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  logoCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: "#DDEBD5", alignItems: "center", justifyContent: "center"
  },
  logo: { fontSize: 25 },
  brandText: { marginLeft: 12 },
  brandName: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" },
  brandTagline: {
    color: "#BDD0B8", fontSize: 9, fontWeight: "700",
    letterSpacing: 1.3, marginTop: 2
  },
  heroTitle: { color: "#FFFFFF", fontSize: 29, fontWeight: "800", lineHeight: 35 },
  heroSubtitle: { color: "#D7E4D4", fontSize: 14, lineHeight: 21, marginTop: 8 },

  sectionHeading: { color: "#29462D", fontSize: 18, fontWeight: "800", marginBottom: 12 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20
  },
  statCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: "#DFE7DA"
  },
  totalCard: { borderColor: "#B8D0AF", backgroundColor: "#EEF5EB" },
  statNumber: { color: "#315D38", fontSize: 22, fontWeight: "800" },
  statLabel: { color: "#657062", fontSize: 12, marginTop: 4, fontWeight: "600" },

  actionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#DFE7DA",
    marginBottom: 14
  },
  actionTitle: { color: "#293E2B", fontSize: 18, fontWeight: "800" },
  actionText: { color: "#6B7568", fontSize: 13, lineHeight: 19, marginTop: 5, marginBottom: 16 },

  button: {
    minHeight: 48,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15
  },
  compactButton: { minHeight: 40 },
  primaryButton: { backgroundColor: "#315D38", marginBottom: 10 },
  primaryButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#315D38",
    marginBottom: 10
  },
  secondaryButtonText: { color: "#315D38", fontSize: 14, fontWeight: "800" },
  dangerButton: {
    backgroundColor: "#FFF7F7",
    borderWidth: 1,
    borderColor: "#C64B4B",
    marginBottom: 10
  },
  dangerButtonText: { color: "#B13D3D", fontSize: 14, fontWeight: "800" },
  buttonPressed: { opacity: 0.75 },

  tipCard: {
    backgroundColor: "#E8F2E4",
    borderRadius: 16,
    padding: 15,
    flexDirection: "row",
    alignItems: "flex-start"
  },
  tipIcon: {
    width: 27, height: 27, borderRadius: 14,
    backgroundColor: "#315D38",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 27,
    fontWeight: "800",
    marginRight: 10
  },
  tipTitle: { color: "#2D4D31", fontSize: 13, fontWeight: "800" },
  tipText: { color: "#5D6C5A", fontSize: 12, lineHeight: 18, marginTop: 3 },

  pageHeader: { marginBottom: 8 },
  screenTitle: { color: "#29462D", fontSize: 25, fontWeight: "800" },
  screenSubtitle: { color: "#6A7568", fontSize: 13, marginTop: 4, lineHeight: 19 },

  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#DFE7DA",
    marginTop: 12
  },
  field: { marginBottom: 14 },
  label: { color: "#314A34", fontSize: 14, fontWeight: "800", marginBottom: 7 },
  required: { color: "#B74646" },
  input: {
    minHeight: 50,
    backgroundColor: "#FBFCFA",
    borderWidth: 1,
    borderColor: "#D4DED0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: "#253126",
    fontSize: 15
  },
  textArea: { minHeight: 105, paddingTop: 14 },
  pickerContainer: {
    backgroundColor: "#FBFCFA",
    borderWidth: 1,
    borderColor: "#D4DED0",
    borderRadius: 12,
    overflow: "hidden"
  },
  selectButton: {
    minHeight: 52,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  selectButtonText: { color: "#2F3D31", fontSize: 14 },
  selectPlaceholder: { color: "#8B9688" },
  selectChevron: { color: "#5E6B5D", fontSize: 11 },
  selectOptions: {
    borderTopWidth: 1,
    borderTopColor: "#E1E8DE",
    backgroundColor: "#FFFFFF"
  },
  selectOption: { paddingHorizontal: 15, paddingVertical: 13 },
  selectOptionPressed: { backgroundColor: "#F1F6EE" },
  selectOptionText: { color: "#2F3D31", fontSize: 14, fontWeight: "600" },
  inputError: { borderColor: "#C74A4A", backgroundColor: "#FFF9F9" },
  errorText: { color: "#B33E3E", fontSize: 12, lineHeight: 17, marginTop: 5, fontWeight: "600" },

  formNote: { borderTopWidth: 1, borderTopColor: "#E8EDE5", paddingTop: 12, marginTop: 2 },
  formNoteText: { color: "#788273", fontSize: 11 },
  formButtons: { flexDirection: "row", gap: 10, marginTop: 14 },
  buttonHalf: { flex: 1 },

  menuTop: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center"
  },
  compactAdd: {
    backgroundColor: "#315D38",
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 10
  },
  compactAddText: { color: "#FFFFFF", fontWeight: "800", fontSize: 13 },

  searchArea: {
    paddingHorizontal: 20,
    paddingBottom: 8
  },
  searchInput: {
    minHeight: 48,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D4DED0",
    borderRadius: 13,
    paddingHorizontal: 14,
    color: "#253126",
    fontSize: 14
  },
  filterRow: { gap: 8, paddingVertical: 10 },
  filterChip: {
    borderWidth: 1,
    borderColor: "#C9D5C5",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  filterChipActive: { backgroundColor: "#315D38", borderColor: "#315D38" },
  filterChipText: { color: "#526151", fontSize: 12, fontWeight: "700" },
  filterChipTextActive: { color: "#FFFFFF" },
  clearButton: { alignSelf: "flex-start", paddingVertical: 3 },
  clearButtonText: { color: "#315D38", fontSize: 12, fontWeight: "800" },

  listContent: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 118 },
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#DFE7DA",
    flexDirection: "row"
  },
  itemNumber: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#E7F0E3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11
  },
  itemNumberText: { color: "#315D38", fontWeight: "800", fontSize: 12 },
  itemBody: { flex: 1 },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8
  },
  dishName: { flex: 1, color: "#263B29", fontSize: 17, fontWeight: "800", lineHeight: 22 },
  price: { color: "#315D38", fontSize: 15, fontWeight: "800" },
  courseBadge: {
    alignSelf: "flex-start",
    color: "#426747",
    backgroundColor: "#E8F2E4",
    fontSize: 10,
    fontWeight: "800",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 15,
    marginTop: 7,
    overflow: "hidden"
  },
  description: { color: "#657064", fontSize: 12.5, lineHeight: 18, marginTop: 8 },
  cardActions: { flexDirection: "row", gap: 8, marginTop: 12 },
  actionHalf: { flex: 1 },

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    paddingBottom: 120
  },
  emptyCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "#E5F0E0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16
  },
  emptyIcon: { fontSize: 42 },
  emptyTitle: { color: "#2D432F", fontSize: 21, fontWeight: "800" },
  emptyText: {
    color: "#6B7568",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 7,
    marginBottom: 18
  },
  emptyButton: { width: "100%" },

  globalMessage: {
    position: "absolute",
    top: 8,
    left: 16,
    right: 16,
    zIndex: 20,
    backgroundColor: "#E5F3E1",
    borderWidth: 1,
    borderColor: "#B8D8B0",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center"
  },
  globalMessageText: { color: "#2E5634", fontSize: 12, fontWeight: "700", flex: 1 },
  dismiss: { color: "#4C634C", fontSize: 23, paddingHorizontal: 5 },

  navBar: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 12,
    height: 68,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#DCE5D8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    shadowColor: "#1D3020",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 7
  },
  navItem: { alignItems: "center", justifyContent: "center", minWidth: 76, height: 55 },
  navIcon: { color: "#879184", fontSize: 22, lineHeight: 25 },
  navLabel: { color: "#879184", fontSize: 10, fontWeight: "700", marginTop: 2 },
  navActive: { color: "#315D38" }
});
