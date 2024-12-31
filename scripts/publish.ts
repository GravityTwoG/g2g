import path from 'path';
import { spawn } from 'child_process';
import { randomUUID } from 'crypto';
import { readFile, readdir } from 'fs/promises';
import simpleGit, { SimpleGit } from 'simple-git';

const git: SimpleGit = simpleGit();

async function publish(): Promise<void> {
  const { current: currentBranch } = await git.status();

  if (!currentBranch) {
    throw new Error('Could not get current branch');
  }

  const packageFolders: string[] = await readdir(path.resolve('./packages'));
  for (const packageFolderName of packageFolders) {
    if (packageFolderName.startsWith('.')) {
      continue;
    }

    const packageJsonPath = path.resolve(
      './packages/',
      packageFolderName,
      './package.json',
    );
    const packageJson: Record<string, string> = JSON.parse(
      await readFile(packageJsonPath, 'utf-8'),
    );

    const mainBranch = 'master';
    let packageTag = 'latest';
    if (currentBranch !== mainBranch) {
      packageTag = currentBranch.replace(/\//g, '-');
    }

    let packageVersion: string =
      (packageJson.version as string).match(
        /^([0-9]+\.[0-9]+\.[0-9]+)/g,
      )?.[0] ?? packageJson.version;
    if (currentBranch !== mainBranch) {
      packageVersion += `-${packageTag}-${randomUUID()}`;
    }

    await new Promise<void>((resolve) => {
      const process = spawn(
        'yarn',
        ['publish', '--tag', packageTag, '--new-version', packageVersion],
        {
          cwd: path.resolve('./packages', packageFolderName),
          stdio: 'inherit',
          shell: true,
        },
      );

      process.on('close', () => resolve());
    });

    console.log(`npm i ${packageJson.name}@${packageVersion}`);
  }
}

publish();
