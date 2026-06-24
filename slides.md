---
theme: default
addons:
  - ./
audience: live
---

# Audience Filter Addon Demo

Test presentation for the audience filter addon

---

## Visible for Everyone

This slide has no `showFor` or `hideFor` and is always visible.

---
showFor: live
---

## Live Audience Only

This slide is only visible when `AUDIENCE=live`.

---
hideFor: beginners
---

## Hidden from Beginners

This slide is visible for everyone except `beginners`.

---
showFor: architects,leads
---

## For Architects and Leads

This slide is only visible for `architects` or `leads`.

---

## Also Visible for Everyone

Another slide without audience restrictions.

---

# Thank You

End of demo presentation
