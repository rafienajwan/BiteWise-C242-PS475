const { readdirSync } = require('fs');
const { join } = require('path');
const { spawnSync } = require('child_process');

function collectJavaScriptFiles(directory) {
    const files = [];

    for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const fullPath = join(directory, entry.name);

        if (entry.isDirectory()) {
            files.push(...collectJavaScriptFiles(fullPath));
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
            files.push(fullPath);
        }
    }

    return files;
}

const files = [
    ...collectJavaScriptFiles(join(__dirname, '..', 'src'))
];

for (const file of files) {
    const result = spawnSync(process.execPath, ['--check', file], {
        encoding: 'utf8',
        stdio: 'inherit',
    });

    if (result.status !== 0) {
        process.exit(result.status || 1);
    }
}

console.log(`Syntax check passed for ${files.length} JavaScript files.`);
