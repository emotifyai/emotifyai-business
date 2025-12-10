# @emotifyai/ui

Shared UI component library for EmotifyAI applications.

## Components

### Button
Basic button component with variants and sizes.

### Card
Card container with header, content, and footer sections.

### Badge
Small status or label component.

### Alert
Alert component for notifications and messages.

### Progress
Progress bar component for showing completion status.

### Loading Components
- `LoadingSpinner` - Animated loading spinner
- `PageLoading` - Full page loading component with message

### Skeleton
Placeholder component for loading states.

### Toast
Toast notification system with provider and hook.

## Usage

```tsx
import { Button, Card, Badge } from '@emotifyai/ui'

function MyComponent() {
  return (
    <Card>
      <Button variant="primary">
        Click me
      </Button>
      <Badge>New</Badge>
    </Card>
  )
}
```

## Theming

The components use Tailwind CSS classes and follow the EmotifyAI design system.