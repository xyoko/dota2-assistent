import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

// handleToggleFavorite
content = content.replace(
  "const handleToggleFavorite = (heroId: string) => {",
  "const handleToggleFavorite = useCallback((heroId: string) => {"
);
content = content.replace(
  "setFavorites(StorageService.getFavorites());\n  };",
  "setFavorites(StorageService.getFavorites());\n  }, []);"
);

// handleOpenPip
content = content.replace(
  "const handleOpenPip = async (targetHero?: HeroData) => {",
  "const handleOpenPip = useCallback(async (targetHero?: HeroData) => {"
);
content = content.replace(
  "setIsPipOpen(true);\n      }\n    }\n  };",
  "setIsPipOpen(true);\n      }\n    }\n  }, [selectedHero]);"
);

// Add useCallback to imports if missing
if (!content.includes('useCallback')) {
  content = content.replace("import React, { useState, useMemo, Suspense, useEffect } from 'react';", "import React, { useState, useMemo, useCallback, Suspense, useEffect } from 'react';");
}

fs.writeFileSync('src/App.tsx', content);
