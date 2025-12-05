export type RepositoryState = {
    branches: Record<string, string>; // branch name -> commit hash
    currentBranch: string;
    commits: {
        hash: string;
        message: string;
        parents: string[];
        branch: string; // created on this branch
        timestamp: number;
    }[];
    HEAD: string | null; // commit hash or null if empty
    staging: string[];
    workingDirectory: string[]; // Untracked/Modified files
    remotes: Record<string, string>; // name -> url
    remoteBranches: Record<string, string>; // origin/main -> hash
    tags: Record<string, string>; // tag name -> hash
    stash: { hash: string; message: string; branch: string }[];
    config: { userName: string; userEmail: string };
};

export const initialRepositoryState: RepositoryState = {
    branches: { 'main': '' },
    currentBranch: 'main',
    commits: [],
    HEAD: null,
    staging: [],
    workingDirectory: [],
    remotes: {},
    remoteBranches: {},
    tags: {},
    stash: [],
    config: { userName: '', userEmail: '' }
};

export type ExecutionResult = {
    success: boolean;
    output: string;
    isError: boolean;
    newState?: RepositoryState;
};

export function executeGitCommand(input: string, expectedCommand: string, currentState: RepositoryState = initialRepositoryState): ExecutionResult {
    const trimmedInput = input.trim();
    const normalizedInput = trimmedInput.replace(/\s+/g, ' ');
    const normalizedExpected = expectedCommand.replace(/\s+/g, ' ');

    // 完全一致（引用符の正規化を含む）
    const inputQuoteNormalized = normalizedInput.replace(/"/g, "'");
    const expectedQuoteNormalized = normalizedExpected.replace(/"/g, "'");

    let newState = JSON.parse(JSON.stringify(currentState)); // Deep copy
    let output = '';
    let success = false;
    let isError = false;

    // Check if command matches expected (for quiz success)
    const isExpected = inputQuoteNormalized === expectedQuoteNormalized;

    const args = normalizedInput.split(' ');
    const cmd = args[0];
    const subCmd = args[1];

    // Handle non-git commands (like touch)
    if (cmd === 'touch') {
        if (args[1]) {
            const fileName = args[1];
            if (!newState.workingDirectory.includes(fileName) && !newState.staging.includes(fileName)) {
                newState.workingDirectory.push(fileName);
            }
            output = '';
            success = true;
        } else {
            output = 'usage: touch <file>';
            isError = true;
        }
        return { success, output, isError, newState };
    }

    if (cmd !== 'git') {
        return {
            success: false,
            output: `'${cmd}' は、内部コマンドまたは外部コマンド、\n操作可能なプログラムまたはバッチ ファイルとして認識されていません。`,
            isError: true,
            newState: currentState
        };
    }

    if (cmd === 'git') {
        if (subCmd === 'init') {
            if (args[2]) {
                output = `Initialized empty Git repository in /project/${args[2]}/.git/`;
            } else {
                newState = { ...initialRepositoryState };
                output = 'Initialized empty Git repository in /project/.git/';
            }
            success = true;

        } else if (subCmd === 'clone') {
            const url = args[2];
            const dir = args[3] || 'repo';
            newState = { ...initialRepositoryState };
            newState.remotes['origin'] = url;
            // Simulate cloning by adding a commit and branch
            const newHash = 'a1b2c3d';
            newState.commits.push({
                hash: newHash,
                message: 'Initial commit from remote',
                parents: [],
                branch: 'main',
                timestamp: Date.now()
            });
            newState.branches['main'] = newHash;
            newState.remoteBranches['origin/main'] = newHash;
            newState.HEAD = newHash;
            newState.currentBranch = 'main';
            output = `Cloning into '${dir}'...\nremote: Enumerating objects: 10, done.\nremote: Total 10 (delta 1), reused 10 (delta 1), pack-reused 0`;
            success = true;

        } else if (subCmd === 'add') {
            if (args[2] === '.') {
                // Add all from working directory
                if (newState.workingDirectory.length > 0) {
                    newState.staging.push(...newState.workingDirectory);
                    newState.workingDirectory = [];
                    output = '';
                    success = true;
                } else {
                    output = ''; // Nothing to add is not always an error, but let's say silent success
                    success = true;
                }
            } else if (args[2]) {
                const fileName = args[2];
                const wdIndex = newState.workingDirectory.indexOf(fileName);
                if (wdIndex !== -1) {
                    newState.staging.push(fileName);
                    newState.workingDirectory.splice(wdIndex, 1);
                    output = '';
                    success = true;
                } else if (newState.staging.includes(fileName)) {
                    output = ''; // Already staged
                    success = true;
                } else {
                    // Fallback: allow adding even if not in WD (simulating creation)
                    newState.staging.push(fileName);
                    output = '';
                    success = true;
                }
            } else {
                output = 'Nothing specified, nothing added.';
                isError = true;
            }

        } else if (subCmd === 'commit') {
            const msgIndex = args.indexOf('-m');
            const message = msgIndex !== -1 ? args.slice(msgIndex + 1).join(' ').replace(/['"]/g, '') : 'Commit message';

            if (newState.staging.length === 0 && !args.includes('-a') && !args.includes('-am')) {
                output = 'nothing to commit, working tree clean';
                isError = true;
            } else {
                const newHash = Math.random().toString(36).substring(2, 9);
                const parent = newState.HEAD ? [newState.HEAD] : [];

                newState.commits.push({
                    hash: newHash,
                    message: message,
                    parents: parent,
                    branch: newState.currentBranch,
                    timestamp: Date.now()
                });

                newState.HEAD = newHash;
                newState.branches[newState.currentBranch] = newHash;
                newState.staging = [];

                output = `[${newState.currentBranch} ${newHash}] ${message}`;
                success = true;
            }

        } else if (subCmd === 'status') {
            output = `On branch ${newState.currentBranch}\n`;
            let hasChanges = false;

            if (newState.staging.length > 0) {
                hasChanges = true;
                output += `Changes to be committed:\n  (use "git restore --staged <file>..." to unstage)\n`;
                newState.staging.forEach((file: string) => {
                    output += `\tnew file:   ${file}\n`;
                });
            }

            if (newState.workingDirectory.length > 0) {
                hasChanges = true;
                output += `\nUntracked files:\n  (use "git add <file>..." to include in what will be committed)\n`;
                newState.workingDirectory.forEach((file: string) => {
                    output += `\t${file}\n`;
                });
            }

            if (!hasChanges) {
                output += `nothing to commit, working tree clean`;
            }
            success = true;

        } else if (subCmd === 'log') {
            const logCommits = [...newState.commits].reverse();

            if (args.includes('--oneline')) {
                output = logCommits.map((c: any) => `${c.hash} ${c.message}`).join('\n');
            } else {
                output = logCommits.map((c: any) => `commit ${c.hash}\nAuthor: ${newState.config.userName || 'User'} <${newState.config.userEmail || 'user@example.com'}>\nDate:   ${new Date(c.timestamp).toDateString()}\n\n    ${c.message}`).join('\n\n');
            }
            success = true;

        } else if (subCmd === 'branch') {
            if (args[2] === '-d') {
                const branchName = args[3];
                if (newState.branches[branchName]) {
                    if (newState.currentBranch === branchName) {
                        output = `error: Cannot delete branch '${branchName}' checked out at '/project'`;
                        isError = true;
                    } else {
                        delete newState.branches[branchName];
                        output = `Deleted branch ${branchName} (was ${newState.HEAD}).`;
                        success = true;
                    }
                } else {
                    output = `error: branch '${branchName}' not found.`;
                    isError = true;
                }
            } else if (args[2] && !args[2].startsWith('-')) {
                const branchName = args[2];
                if (!newState.branches[branchName]) {
                    newState.branches[branchName] = newState.HEAD || '';
                    output = '';
                    success = true;
                } else {
                    output = `fatal: A branch named '${branchName}' already exists.`;
                    isError = true;
                }
            } else {
                output = Object.keys(newState.branches).map(b =>
                    b === newState.currentBranch ? `* ${b}` : `  ${b}`
                ).join('\n');
                success = true;
            }

        } else if (subCmd === 'checkout') {
            if (args[2] === '-b') {
                const branchName = args[3];
                if (!newState.branches[branchName]) {
                    newState.branches[branchName] = newState.HEAD || '';
                    newState.currentBranch = branchName;
                    output = `Switched to a new branch '${branchName}'`;
                    success = true;
                } else {
                    output = `fatal: A branch named '${branchName}' already exists.`;
                    isError = true;
                }
            } else {
                const branchName = args[2];
                if (newState.branches[branchName]) {
                    newState.currentBranch = branchName;
                    newState.HEAD = newState.branches[branchName];
                    output = `Switched to branch '${branchName}'`;
                    success = true;
                } else {
                    output = `error: pathspec '${branchName}' did not match any file(s) known to git`;
                    isError = true;
                }
            }

        } else if (subCmd === 'merge') {
            const branchName = args[2];
            if (newState.branches[branchName]) {
                const newHash = Math.random().toString(36).substring(2, 9);
                const parent1 = newState.HEAD;
                const parent2 = newState.branches[branchName];

                newState.commits.push({
                    hash: newHash,
                    message: `Merge branch '${branchName}'`,
                    parents: parent1 ? [parent1, parent2].filter(Boolean) as string[] : [],
                    branch: newState.currentBranch,
                    timestamp: Date.now()
                });

                newState.HEAD = newHash;
                newState.branches[newState.currentBranch] = newHash;

                output = `Merge made by the 'ort' strategy.`;
                success = true;
            } else {
                output = `merge: ${branchName} - not something we can merge`;
                isError = true;
            }

        } else if (subCmd === 'pull') {
            // Simulate pulling updates
            const newHash = Math.random().toString(36).substring(2, 9);
            newState.commits.push({
                hash: newHash,
                message: 'Update from remote',
                parents: newState.HEAD ? [newState.HEAD] : [],
                branch: newState.currentBranch,
                timestamp: Date.now()
            });
            newState.HEAD = newHash;
            newState.branches[newState.currentBranch] = newHash;
            output = 'Updating a1b2c3d..e5f6g7h\nFast-forward\n README.md | 2 ++\n 1 file changed, 2 insertions(+)';
            success = true;

        } else if (subCmd === 'push') {
            if (Object.keys(newState.remotes).length === 0) {
                output = 'fatal: No configured push destination.';
                isError = true;
            } else {
                newState.remoteBranches[`origin/${newState.currentBranch}`] = newState.HEAD || '';
                output = 'Enumerating objects: 5, done.\nTo https://github.com/user/repo.git\n   a1b2c3d..e5f6g7h  main -> main';
                success = true;
            }

        } else if (subCmd === 'remote') {
            if (args[2] === 'add') {
                const name = args[3];
                const url = args[4];
                newState.remotes[name] = url;
                output = '';
                success = true;
            } else if (args[2] === '-v') {
                output = Object.entries(newState.remotes).map(([name, url]) => `${name}\t${url} (fetch)\n${name}\t${url} (push)`).join('\n');
                success = true;
            } else {
                output = Object.keys(newState.remotes).join('\n');
                success = true;
            }

        } else if (subCmd === 'fetch') {
            output = 'From https://github.com/user/repo\n * [new branch]      main       -> origin/main';
            success = true;

        } else if (subCmd === 'reset') {
            // In a real simulator we'd resolve HEAD~1 etc.
            // For now, just simulate success message
            output = `HEAD is now at ${newState.HEAD} (simulated reset)`;
            success = true;

        } else if (subCmd === 'revert') {
            const newHash = Math.random().toString(36).substring(2, 9);
            const parent = newState.HEAD ? [newState.HEAD] : [];
            newState.commits.push({
                hash: newHash,
                message: `Revert "Previous commit"`,
                parents: parent,
                branch: newState.currentBranch,
                timestamp: Date.now()
            });
            newState.HEAD = newHash;
            newState.branches[newState.currentBranch] = newHash;
            output = `[${newState.currentBranch} ${newHash}] Revert "Previous commit"`;
            success = true;

        } else if (subCmd === 'stash') {
            if (args[2] === 'pop') {
                if (newState.stash.length > 0) {
                    const popped = newState.stash.pop();
                    output = `Dropped refs/stash@{0} (${popped?.hash})`;
                    success = true;
                } else {
                    output = 'No stash entries found.';
                    isError = true;
                }
            } else {
                const newHash = Math.random().toString(36).substring(2, 9);
                newState.stash.push({
                    hash: newHash,
                    message: `WIP on ${newState.currentBranch}: ${newState.HEAD} ...`,
                    branch: newState.currentBranch
                });
                output = `Saved working directory and index state WIP on ${newState.currentBranch}: ${newState.HEAD}`;
                success = true;
            }

        } else if (subCmd === 'rebase') {
            output = `Successfully rebased and updated refs/heads/${newState.currentBranch}.`;
            success = true;

        } else if (subCmd === 'diff') {
            output = 'diff --git a/file.txt b/file.txt\nindex 83db48f..f0168e8 100644\n--- a/file.txt\n+++ b/file.txt\n@@ -1 +1 @@\n-Old content\n+New content';
            success = true;

        } else if (subCmd === 'show') {
            const commit = newState.commits.find((c: any) => c.hash === (args[2] || newState.HEAD));
            if (commit) {
                output = `commit ${commit.hash}\nAuthor: User <user@example.com>\nDate: ${new Date(commit.timestamp).toDateString()}\n\n    ${commit.message}\n\ndiff --git a/file b/file...`;
                success = true;
            } else {
                output = `fatal: bad object ${args[2]}`;
                isError = true;
            }

        } else if (subCmd === 'tag') {
            if (args[2]) {
                const tagName = args[2];
                newState.tags[tagName] = newState.HEAD || '';
                output = '';
                success = true;
            } else {
                output = Object.keys(newState.tags).join('\n');
                success = true;
            }

        } else if (subCmd === 'cherry-pick') {
            const newHash = Math.random().toString(36).substring(2, 9);
            const parent = newState.HEAD ? [newState.HEAD] : [];
            newState.commits.push({
                hash: newHash,
                message: `Cherry-pick ${args[2]}`,
                parents: parent,
                branch: newState.currentBranch,
                timestamp: Date.now()
            });
            newState.HEAD = newHash;
            newState.branches[newState.currentBranch] = newHash;
            output = `[${newState.currentBranch} ${newHash}] Cherry-pick ${args[2]}`;
            success = true;

        } else if (subCmd === 'config') {
            if (args[2] === '--global' && args[3] === 'user.name') {
                newState.config.userName = args[4].replace(/['"]/g, '');
                output = '';
                success = true;
            } else if (args[2] === '--global' && args[3] === 'user.email') {
                newState.config.userEmail = args[4].replace(/['"]/g, '');
                output = '';
                success = true;
            } else if (args[2] === '--list') {
                output = `user.name=${newState.config.userName}\nuser.email=${newState.config.userEmail}`;
                success = true;
            }
        } else {
            // Fallback
            if (isExpected) {
                output = getSuccessMessage(normalizedInput);
                success = true;
            } else {
                output = `git: '${subCmd}' is not a git command.`;
                isError = true;
            }
        }
    }

    // Force success if input matches expected, even if logic above didn't perfectly handle it
    if (isExpected && !success) {
        success = true;
        if (!output) output = getSuccessMessage(normalizedInput);
    }

    return {
        success,
        output,
        isError,
        newState
    };
}

function getSuccessMessage(command: string): string {
    // Fallback success messages
    return 'Command executed successfully.';
}
