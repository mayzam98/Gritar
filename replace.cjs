const fs = require('fs');
let c = fs.readFileSync('src/core/application/GenerateWarmupRoutineUseCase.ts', 'utf8');
c = c.replace(/(\d+),\s*'',/g, (m, p1) => `${p1}, ${parseInt(p1) + 20}, '',`);
fs.writeFileSync('src/core/application/GenerateWarmupRoutineUseCase.ts', c);
