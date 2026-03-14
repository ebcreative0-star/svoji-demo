# Phase 11.1: AI Actions & Batch Import

## Bugs

- **BUG-05**: AI chat doesn't use budget_add tool when user asks to add items (promises to add but doesn't execute the action)
- **BUG-06**: AI can't delete budget items (no budget_delete action exists in action-executor)
- **BUG-07**: Invisible budget item - phantom 80k item inflating budget total, not visible in UI
- **BUG-08**: Chat history lost when switching tabs (messages don't persist across tab navigation)

## Features

- **FEAT-01**: Batch add to checklist - AI can add multiple checklist items in one interaction
- **FEAT-02**: Batch add to budget - AI can add multiple budget items in one interaction
- **FEAT-03**: Batch add guests - AI can add multiple guests in one interaction
- **FEAT-04**: Notes migration - user pastes text from mobile notes (free-form), AI parses and categorizes items into checklist tasks, budget items, and guest entries automatically
