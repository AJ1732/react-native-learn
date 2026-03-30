# Native Context Menus

A context menu appears on long-press and shows a list of actions. It uses the native OS component — iOS `UIContextMenu` and the Android equivalent — giving you the system animations, haptics, and accessibility for free.

---

## Why Native Over a Custom JS Modal

| | Native (`zeego`) | Custom JS Modal |
|---|---|---|
| Animation | iOS spring physics, exact system feel | Custom, never quite matches |
| Haptic on long-press | Built-in | Manual |
| Accessibility | VoiceOver / TalkBack built-in | Manual |
| Destructive styling | Built-in red tint | Manual |
| Preview on long-press | Native peek preview | Complex |

---

## Installation

```bash
npx expo install zeego @radix-ui/react-primitive
```

**Requires a dev build** — zeego has native code. Run `npx expo run:ios` after installing.

---

## Basic Structure

```tsx
import * as ContextMenu from "zeego/context-menu";

<ContextMenu.Root>
  <ContextMenu.Trigger>
    {/* your pressable content — long-press activates the menu */}
    <Pressable>...</Pressable>
  </ContextMenu.Trigger>

  <ContextMenu.Content>
    <ContextMenu.Item key="action" onSelect={handleAction}>
      <ContextMenu.ItemTitle>Action</ContextMenu.ItemTitle>
    </ContextMenu.Item>
  </ContextMenu.Content>
</ContextMenu.Root>
```

**Rules:**
- `ContextMenu.Trigger` must have exactly one child
- Every `ContextMenu.Item` must have a unique `key` prop
- `onSelect` fires when the user taps the menu item

---

## Full Example

```tsx
import * as ContextMenu from "zeego/context-menu";
import { Share } from "react-native";

<ContextMenu.Root>
  <ContextMenu.Trigger>
    <Pressable>
      <Text>Long press me</Text>
    </Pressable>
  </ContextMenu.Trigger>

  <ContextMenu.Content>
    {/* Standard item with SF Symbol icon (iOS) */}
    <ContextMenu.Item key="save" onSelect={handleSave}>
      <ContextMenu.ItemTitle>Save</ContextMenu.ItemTitle>
      <ContextMenu.ItemIcon
        ios={{ name: "bookmark", pointSize: 16 }}
        androidIconName="ic_menu_save"
      />
    </ContextMenu.Item>

    <ContextMenu.Item key="share" onSelect={handleShare}>
      <ContextMenu.ItemTitle>Share</ContextMenu.ItemTitle>
      <ContextMenu.ItemIcon
        ios={{ name: "square.and.arrow.up", pointSize: 16 }}
        androidIconName="ic_menu_share"
      />
    </ContextMenu.Item>

    {/* Separator line */}
    <ContextMenu.Separator />

    {/* Destructive item — renders in red on iOS */}
    <ContextMenu.Item key="delete" destructive onSelect={handleDelete}>
      <ContextMenu.ItemTitle>Delete</ContextMenu.ItemTitle>
      <ContextMenu.ItemIcon
        ios={{ name: "trash", pointSize: 16 }}
        androidIconName="ic_menu_delete"
      />
    </ContextMenu.Item>
  </ContextMenu.Content>
</ContextMenu.Root>
```

---

## Icons

### iOS — SF Symbols
Pass any SF Symbol name to `ios.name`. Browse all symbols at [developer.apple.com/sf-symbols](https://developer.apple.com/sf-symbols) or use the SF Symbols Mac app.

Common ones:

| Action | SF Symbol name |
|---|---|
| Save / Bookmark | `bookmark` |
| Share | `square.and.arrow.up` |
| Delete | `trash` |
| Edit | `pencil` |
| Report / Flag | `flag` |
| Copy | `doc.on.doc` |
| Pin | `pin` |

### Android — Drawable names
Pass a built-in Android drawable name to `androidIconName`. Common ones:

| Action | Android name |
|---|---|
| Save | `ic_menu_save` |
| Share | `ic_menu_share` |
| Delete | `ic_menu_delete` |
| Edit | `ic_menu_edit` |
| Report | `ic_menu_report_image` |

---

## How It's Used in This Project

Applied to `OpportunityCard` — long-press reveals Save, Share, and Report actions:

```tsx
// features/opportunities/components/opportunity-card.tsx
<ContextMenu.Root>
  <ContextMenu.Trigger>
    <Link href={href}>...</Link>
  </ContextMenu.Trigger>
  <ContextMenu.Content>
    <ContextMenu.Item key="save" onSelect={handleSave}>...</ContextMenu.Item>
    <ContextMenu.Item key="share" onSelect={handleShare}>...</ContextMenu.Item>
    <ContextMenu.Separator />
    <ContextMenu.Item key="report" destructive onSelect={handleReport}>...</ContextMenu.Item>
  </ContextMenu.Content>
</ContextMenu.Root>
```

---

## Other zeego Menu Types

`zeego` also provides a `DropdownMenu` for tap-triggered menus (not long-press):

```tsx
import * as DropdownMenu from "zeego/dropdown-menu";

// Same API as ContextMenu — triggered on tap instead of long-press
<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    <Pressable><Text>⋯</Text></Pressable>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    ...
  </DropdownMenu.Content>
</DropdownMenu.Root>
```

Use `DropdownMenu` for action buttons (three-dot menus), `ContextMenu` for long-press on list items.

---

## Platform Notes

- **iOS** — full native `UIContextMenu` with blur background, spring animation, peek preview
- **Android** — native contextual menu, less visual fidelity than iOS
- **Simulator** — works on iOS simulator (long-press with click and hold)
- **Requires dev build** — will not work in Expo Go
