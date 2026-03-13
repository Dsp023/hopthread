import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const VAULT_PATH = './.vault';

export const TheVault = {
    seal: async (key: string, value: string) => {
        console.log(chalk.magenta(`\n🗝️ [VAULT] Sealing secret: ${key}`));
        
        let config: Record<string, string> = {};
        if (fs.existsSync(VAULT_PATH)) {
            config = JSON.parse(fs.readFileSync(VAULT_PATH, 'utf8'));
        }

        // Simple base64 encoding for "vibe-level" security (to be upgraded to AES)
        config[key] = Buffer.from(value).toString('base64');
        
        fs.writeFileSync(VAULT_PATH, JSON.stringify(config, null, 2));
        
        // Ensure .vault is in .gitignore
        const gitignorePath = './.gitignore';
        if (fs.existsSync(gitignorePath)) {
            const ignoreContent = fs.readFileSync(gitignorePath, 'utf8');
            if (!ignoreContent.includes('.vault')) {
                fs.appendFileSync(gitignorePath, '\n.vault\n');
                console.log(chalk.dim('Added .vault to .gitignore'));
            }
        }
    },

    get: (key: string) => {
        if (!fs.existsSync(VAULT_PATH)) return null;
        const config = JSON.parse(fs.readFileSync(VAULT_PATH, 'utf8'));
        if (!config[key]) return null;
        return Buffer.from(config[key], 'base64').toString('utf8');
    }
};
