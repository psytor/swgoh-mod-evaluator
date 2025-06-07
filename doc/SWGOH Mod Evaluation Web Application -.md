# SWGOH Mod Evaluation Web Application - Implementation Plan

## Executive Summary

This document outlines the implementation plan for a web-based SWGOH mod evaluation tool that analyzes player mods using an efficiency-based scoring system with contextual awareness. The application will be initially self-hosted and operate entirely client-side with no backend requirements.

## Technical Architecture

### Technology Stack
- **Frontend Framework**: React 18
- **Build Tool**: Vite (fast development and building)
- **Styling**: CSS Modules + Tailwind CSS for utility classes
- **State Management**: React Context API + useReducer
- **Data Persistence**: Browser LocalStorage
- **API Calls**: Native Fetch API with async/await
- **Hosting**: Static file serving on Linux server (nginx recommended)

### Key Architecture Decisions
1. **No Backend**: All processing happens in the browser
2. **No Database**: User data stored in LocalStorage
3. **Direct API Access**: Browser makes calls directly to SWGOH API
4. **Static Deployment**: Simple HTML/JS/CSS files
5. **Offline Capable**: Once data is fetched, works without internet

## Core Features Specification

### 1. Data Input & Fetching
- **Ally Code Input**: Simple form accepting 9-digit ally codes
- **API Integration**: Direct calls to `http://frmdev:2500/player`
- **Data Caching**: Store fetched data in LocalStorage with timestamp
- **Cache Duration**: 24 hours before requiring refresh
- **Loading States**: Visual feedback during API calls

### 2. Mod Evaluation Engine
- **Efficiency Calculator**: Implements scoring system from documentation
- **Context Multipliers**: Synergy, concentration, and alignment bonuses
- **Quality Thresholds**: Different requirements by mod color
- **Recommendation Engine**: Keep/Sell/Upgrade/Favorite decisions

### 3. User Interface Components

#### Mod Card Display
- Visual representation of each mod showing:
  - Set icon (placeholder initially)
  - Slot shape (placeholder initially)
  - Primary stat
  - Secondary stats with roll counts
  - Efficiency score with color coding
  - Recommendation badge

#### Filtering & Sorting
- Filter by:
  - Recommendation type (Keep/Sell/Upgrade)
  - Mod set
  - Mod slot
  - Character equipped
  - Score ranges
- Sort by:
  - Efficiency score
  - Speed value
  - Recommendation priority

#### Settings Panel
- Customizable stat weights
- Score threshold adjustments
- Display preferences
- Cache management

### 4. Data Visualization
- **Score Breakdown**: Show how score was calculated
- **Efficiency Meter**: Visual representation of mod efficiency
- **Color Coding**:
  - Red: Sell (< threshold)
  - Yellow: Borderline
  - Green: Keep
  - Blue: Upgrade priority
  - Gold: Favorite

## Development Phases

### Phase 1: Core Functionality (Week 1-2)
1. **Project Setup**
   - Initialize React project with Vite
   - Configure build pipeline
   - Set up development environment

2. **API Integration**
   - Create API service module
   - Implement data fetching
   - Add error handling
   - Set up data decoding

3. **Evaluation Engine**
   - Port scoring algorithms from documentation
   - Implement all multiplier systems
   - Create recommendation logic
   - Add unit tests for calculations

4. **Basic UI**
   - Ally code input form
   - Simple mod list display
   - Basic scoring visualization
   - Loading/error states

### Phase 2: Enhanced UI (Week 3-4)
1. **Mod Card Components**
   - Styled card layout
   - Stat display formatting
   - Score visualization
   - Recommendation badges

2. **Filtering System**
   - Filter UI components
   - Filter logic implementation
   - Multi-filter combinations
   - Clear/reset functionality

3. **Sorting Options**
   - Sort dropdown
   - Multiple sort criteria
   - Ascending/descending toggle

4. **Responsive Design**
   - Mobile-friendly layout
   - Touch interactions
   - Viewport optimizations

### Phase 3: Advanced Features (Week 5-6)
1. **Settings System**
   - Weight customization UI
   - Threshold adjustments
   - Settings persistence
   - Reset to defaults

2. **Visual Enhancements**
   - Mod set icons
   - Slot shape graphics
   - Animated transitions
   - Hover effects

3. **Performance Optimization**
   - Lazy loading
   - Virtual scrolling for large lists
   - Memoization of calculations
   - Bundle size optimization

4. **User Experience**
   - Tooltips for calculations
   - Keyboard shortcuts
   - Bulk actions
   - Export recommendations

## File Structure
```
swgoh-mod-evaluator/
├── public/
│   ├── index.html
│   └── assets/
│       ├── mod-sets/     # Set icons
│       └── mod-slots/     # Slot shapes
├── src/
│   ├── components/
│   │   ├── ModCard/
│   │   ├── FilterPanel/
│   │   ├── SettingsPanel/
│   │   └── AllyCodeInput/
│   ├── services/
│   │   ├── api.js        # API integration
│   │   ├── storage.js    # LocalStorage management
│   │   └── evaluator.js  # Scoring engine
│   ├── utils/
│   │   ├── constants.js  # Stat mappings, thresholds
│   │   ├── formatters.js # Display formatting
│   │   └── calculations.js
│   ├── contexts/
│   │   ├── ModContext.js
│   │   └── SettingsContext.js
│   ├── App.jsx
│   └── index.jsx
├── package.json
├── vite.config.js
└── README.md
```

## API Integration Details

### Request Handler
```javascript
// Pseudo-code structure
async function fetchPlayerData(allyCode) {
  // Check cache first
  const cached = getCachedData(allyCode);
  if (cached && !isExpired(cached)) {
    return cached.data;
  }
  
  // Fetch fresh data
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      payload: { allyCode }, 
      enums: false 
    })
  });
  
  // Process and cache
  const data = await response.json();
  cacheData(allyCode, data);
  return data;
}
```

### Data Processing Pipeline
1. Fetch raw player data
2. Filter mods (only 5-dot and 6-dot)
3. Decode stat values
4. Calculate efficiency scores
5. Apply context multipliers
6. Generate recommendations
7. Sort by priority

## LocalStorage Schema
```javascript
{
  "swgoh_mod_evaluator": {
    "players": {
      "[allyCode]": {
        "data": { /* player data */ },
        "timestamp": 1234567890,
        "evaluated": { /* processed mods */ }
      }
    },
    "settings": {
      "weights": { /* custom weights */ },
      "thresholds": { /* custom thresholds */ },
      "display": { /* UI preferences */ }
    },
    "version": "1.0.0"
  }
}
```

## UI/UX Specifications

### Design Principles
1. **Clarity**: Clear visual hierarchy
2. **Efficiency**: Minimal clicks to insights
3. **Responsiveness**: Works on all devices
4. **Accessibility**: WCAG 2.1 AA compliance

### Color Palette
- **Primary**: Blue (#2563EB) - Actions
- **Success**: Green (#10B981) - Keep mods
- **Warning**: Yellow (#F59E0B) - Borderline
- **Danger**: Red (#EF4444) - Sell mods
- **Neutral**: Gray shades - UI elements

### Component Specifications

#### Mod Card
- **Size**: 300x400px desktop, full-width mobile
- **Sections**:
  - Header: Set icon, slot shape, character name
  - Primary stat: Large, prominent display
  - Secondaries: List with roll indicators
  - Score: Circular progress meter
  - Recommendation: Color-coded badge

#### Filter Panel
- **Position**: Left sidebar desktop, modal mobile
- **Filters**: Checkbox groups for each category
- **Active filters**: Shown as removable chips

## Performance Considerations

### Optimization Strategies
1. **Virtualization**: Only render visible mods
2. **Memoization**: Cache expensive calculations
3. **Debouncing**: Delay filter/search operations
4. **Code Splitting**: Lazy load settings panel
5. **Asset Optimization**: Compress images, use SVG

### Target Metrics
- Initial load: < 3 seconds
- API response handling: < 100ms
- Filter/sort operations: < 50ms
- Smooth scrolling: 60 FPS

## Deployment Configuration

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/swgoh-mod-evaluator;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Build & Deploy Script
```bash
#!/bin/bash
# Build production bundle
npm run build

# Copy to server
rsync -avz dist/ user@server:/var/www/swgoh-mod-evaluator/

# Restart nginx
ssh user@server 'sudo systemctl reload nginx'
```

## Future Enhancements

### Version 2.0 Ideas
1. **Mod Loadout Suggestions**: Recommend full sets for characters
2. **Historical Tracking**: Track mod improvements over time
3. **Guild Features**: Compare mod quality across guild
4. **Auto-farming Priorities**: Suggest which mods to farm
5. **PWA Support**: Offline mobile app experience

### Community Features
1. **Sharing**: Share mod evaluation results
2. **Statistics**: Aggregate mod quality data
3. **Guides**: In-app modding tutorials
4. **Updates**: Auto-update evaluation algorithms

## Testing Strategy

### Unit Tests
- Scoring algorithm accuracy
- API data decoding
- Filter/sort logic
- LocalStorage operations

### Integration Tests
- Full evaluation pipeline
- UI component interactions
- Cache behavior
- Error handling

### Manual Testing
- Cross-browser compatibility
- Mobile device testing
- Performance profiling
- Accessibility audit

## Security Considerations

1. **API Keys**: None required (public API)
2. **Data Privacy**: All data stored locally
3. **Input Validation**: Sanitize ally codes
4. **XSS Prevention**: Escape all user content
5. **CSP Headers**: Restrict resource loading

## Success Metrics

1. **Functionality**: All mods correctly evaluated
2. **Performance**: Sub-second evaluation time
3. **Usability**: < 5 clicks to get recommendations
4. **Reliability**: 99% uptime
5. **Adoption**: Positive user feedback

## Conclusion

This implementation plan provides a comprehensive roadmap for building the SWGOH Mod Evaluation Web Application. The phased approach allows for iterative development while maintaining focus on core functionality. The client-side architecture ensures easy deployment and sharing while respecting user privacy by keeping all data local.