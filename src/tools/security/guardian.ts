import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { glob } from 'glob';

export const TheGuardian = {
    audit: async (directoryPath: string = './') => {
        console.log(chalk.red.bold(`\n🛡️ [GUARDIAN] Initializing Security Audit: ${directoryPath}`));
        
        const vulnerabilities: any[] = [];
        const files = await glob("**/*.{ts,js,env,json}", {
            cwd: directoryPath,
            ignore: ["node_modules/**", ".git/**"],
            nodir: true,
        });

        const patterns = [
            { id: 'SEC-001', name: 'Hardcoded Secret', regex: /(AI_KEY|API_KEY|SECRET|PASSWORD|TOKEN|AUTH)\s*[:=]\s*['"][^'"]{8,}['"]/gi },
            { id: 'SEC-002', name: 'Raw Env Access', regex: /process\.env\.[A-Z_]+(?!\s*\|\|)/g },
            { id: 'SEC-003', name: 'Unsafe Eval', regex: /eval\(|new Function\(/g },
            { id: 'SEC-004', name: 'Shell Injection Risk', regex: /child_process\.exec\(|spawn\(.*shell:\s*true/g }
        ];

        for (const file of files) {
            const content = fs.readFileSync(path.join(directoryPath, file), 'utf8');
            const lines = content.split('\n');

            patterns.forEach(p => {
                lines.forEach((line, idx) => {
                    if (p.regex.test(line)) {
                        vulnerabilities.push({
                            file,
                            line: idx + 1,
                            issue: p.name,
                            snippet: line.trim()
                        });
                    }
                });
            });
        }

        if (vulnerabilities.length > 0) {
            console.log(chalk.yellow(`\n⚠️ Found ${vulnerabilities.length} security alerts:`));
            vulnerabilities.forEach(v => {
                console.log(`${chalk.red(v.issue)} in ${chalk.cyan(v.file)}:${v.line}`);
                console.log(chalk.dim(`  > ${v.snippet}`));
            });
        } else {
            console.log(chalk.green(`\n✅ No immediate surface-level vulnerabilities detected.`));
        }

        return vulnerabilities;
    }
};
