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
    stash: { hash: string; message: string; branch: string; files?: string[] }[];
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

            if (newState.staging.length === 0 && !args.includes('--amend') && !args.includes('-a') && !args.includes('-am')) {
                output = 'nothing to commit, working tree clean';
                isError = true;
            } else {
                if (args.includes('--amend')) {
                    const lastCommit = newState.commits[newState.commits.length - 1];
                    if (lastCommit) {
                        lastCommit.message = message;
                        output = `[${newState.currentBranch} ${lastCommit.hash}] ${message}`;
                        success = true;
                    } else {
                        output = 'fatal: You have nothing to amend.';
                        isError = true;
                    }
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
            }

        } else if (subCmd === 'status') {
            const isShort = args.includes('-s');
            if (isShort) {
                output = '';
                newState.staging.forEach((f: string) => output += `A  ${f}\n`);
                newState.workingDirectory.forEach((f: string) => output += `?? ${f}\n`);
                success = true;
            } else {
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
            }

        } else if (subCmd === 'log') {
            const logCommits = [...newState.commits].reverse();

            if (args.includes('--oneline')) {
                output = logCommits.map((c: any) => `${c.hash} ${c.message}`).join('\n');
            } else if (args.includes('--graph')) {
                output = logCommits.map((c: any) => `* ${c.hash} ${c.message}`).join('\n');
            } else {
                output = logCommits.map((c: any) => `commit ${c.hash}\nAuthor: ${newState.config.userName || 'User'} <${newState.config.userEmail || 'user@example.com'}>\nDate:   ${new Date(c.timestamp).toDateString()}\n\n    ${c.message}`).join('\n\n');
            }
            success = true;

        } else if (subCmd === 'clean') {
            if (args.includes('-f')) {
                const removed = newState.workingDirectory;
                newState.workingDirectory = [];
                output = removed.length > 0 ? removed.map((f: string) => `Removing ${f}`).join('\n') : 'Nothing to clean';
                success = true;
            } else {
                output = 'fatal: clean.requireForce defaults to true and neither -i, -n, nor -f given; refusing to clean';
                isError = true;
            }

        } else if (subCmd === 'archive') {
            output = 'pax_global_header\narchive.zip';
            success = true;

        } else if (subCmd === 'describe') {
            output = 'v1.0.0-3-g' + (newState.HEAD ? newState.HEAD.substring(0, 7) : 'a1b2c3d');
            success = true;

        } else if (subCmd === 'shortlog') {
            output = `${newState.config.userName || 'User'} (5):\n      Initial commit\n      Update file\n      Fix bug\n      Add feature\n      Merge branch 'feature'`;
            success = true;

        } else if (subCmd === 'blame') {
            const file = args[args.length - 1];
            output = `^a1b2c3d (${newState.config.userName || 'User'} 2023-01-01 10:00:00 +0900 1) First line of ${file}\ne5f6g7h (${newState.config.userName || 'User'} 2023-01-02 11:00:00 +0900 2) Second line of ${file}`;
            success = true;

        } else if (subCmd === 'reflog') {
            output = `${newState.HEAD?.substring(0, 7)} HEAD@{0}: commit: ${newState.commits[newState.commits.length - 1]?.message}\n` +
                `${newState.commits[newState.commits.length - 2]?.hash.substring(0, 7) || 'a1b2c3d'} HEAD@{1}: checkout: moving from main to feature`;
            success = true;

        } else if (subCmd === 'rev-parse') {
            if (args.includes('--git-dir')) {
                output = '/project/.git';
                success = true;
            } else {
                output = newState.HEAD || 'a1b2c3d';
                success = true;
            }

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
            } else if (args[2] === '-m') {
                const newName = args[3];
                const oldName = newState.currentBranch;
                if (newState.branches[oldName]) {
                    newState.branches[newName] = newState.branches[oldName];
                    delete newState.branches[oldName];
                    newState.currentBranch = newName;
                    output = '';
                    success = true;
                } else {
                    output = `error: branch '${oldName}' not found.`;
                    isError = true;
                }
            } else if (args[2] === '-a') {
                const local = Object.keys(newState.branches).map(b => b === newState.currentBranch ? `* ${b}` : `  ${b}`).join('\n');
                const remote = Object.keys(newState.remoteBranches).map(b => `  remotes/${b}`).join('\n');
                output = local + '\n' + remote;
                success = true;
            } else if (args[2] === '-f') {
                const branchName = args[3];
                const target = args[4] === 'HEAD' ? newState.HEAD : args[4];
                newState.branches[branchName] = target || '';
                output = '';
                success = true;
            } else if (args[2] && args[2].startsWith('--set-upstream-to')) {
                output = `Branch '${newState.currentBranch}' set up to track remote branch 'main' from 'origin'.`;
                success = true;
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
                const startPoint = args[4]; // Optional start point
                if (!newState.branches[branchName]) {
                    newState.branches[branchName] = startPoint ? (newState.remoteBranches[startPoint] || newState.branches[startPoint] || newState.HEAD || '') : (newState.HEAD || '');
                    newState.currentBranch = branchName;
                    output = `Switched to a new branch '${branchName}'`;
                    success = true;
                } else {
                    output = `fatal: A branch named '${branchName}' already exists.`;
                    isError = true;
                }
            } else {
                let target = args[2];
                // Handle relative refs (HEAD~1, HEAD^, etc) - Very basic simulation
                if (target.startsWith('HEAD~') || target.startsWith('HEAD^')) {
                    // Just simulate moving back in commits array
                    const count = parseInt(target.replace('HEAD~', '')) || 1;
                    if (newState.commits.length > count) {
                        newState.HEAD = newState.commits[newState.commits.length - 1 - count].hash;
                        output = `HEAD is now at ${newState.HEAD} ...`;
                        success = true;
                        return { success, output, isError, newState };
                    }
                }

                if (newState.branches[target]) {
                    newState.currentBranch = target;
                    newState.HEAD = newState.branches[target];
                    output = `Switched to branch '${target}'`;
                    success = true;
                } else if (newState.tags[target]) {
                    newState.HEAD = newState.tags[target];
                    output = `Note: switching to '${target}'.\n\nYou are in 'detached HEAD' state...`;
                    success = true;
                } else if (newState.remoteBranches[target]) {
                    newState.HEAD = newState.remoteBranches[target];
                    output = `Note: switching to '${target}'.\n\nYou are in 'detached HEAD' state...`;
                    success = true;
                } else if (newState.workingDirectory.includes(target)) { // Checkout file
                    // partial simulation: just say updated
                    output = `Updated 1 path from the index`;
                    success = true;
                } else {
                    // Try to find commit hash
                    const commit = newState.commits.find((c: any) => c.hash === target);
                    if (commit) {
                        newState.HEAD = commit.hash;
                        output = `Note: switching to '${target}'.\n\nYou are in 'detached HEAD' state...`;
                        success = true;
                    } else {
                        output = `error: pathspec '${target}' did not match any file(s) known to git`;
                        isError = true;
                    }
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
            const remote = args[2] || 'origin';
            const refspec = args[3];

            if (refspec && refspec.includes(':')) {
                const [src, dst] = refspec.split(':');
                // Fetch src to dst, then merge dst into current
                const fetchedHash = 'fetched_hash_' + Math.random().toString(36).substring(7);
                newState.branches[dst] = fetchedHash;

                // Merge
                const newHash = Math.random().toString(36).substring(2, 9);
                newState.commits.push({
                    hash: newHash,
                    message: `Merge branch '${dst}' of ${newState.remotes[remote]}`,
                    parents: newState.HEAD ? [newState.HEAD, fetchedHash] : [fetchedHash],
                    branch: newState.currentBranch,
                    timestamp: Date.now()
                });
                newState.HEAD = newHash;
                newState.branches[newState.currentBranch] = newHash;

                output = `From ${newState.remotes[remote]}
 * [new branch]      ${src}     -> ${dst}
   ${newState.HEAD?.substring(0, 7)}..${newHash}  ${src} -> ${dst}
Merge made by the 'ort' strategy.`;
            } else {
                // Normal pull
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
            }
            success = true;

        } else if (subCmd === 'push') {
            const remote = args[2] || 'origin';
            const refspec = args[3];

            if (Object.keys(newState.remotes).length === 0 && !args.includes('origin')) {
                output = 'fatal: No configured push destination.';
                isError = true;
            } else {
                if (refspec) {
                    if (refspec.includes(':')) {
                        const [src, dst] = refspec.split(':');
                        if (src === '') {
                            // Delete remote branch
                            const remoteBranchName = `${remote}/${dst}`;
                            if (newState.remoteBranches[remoteBranchName]) {
                                delete newState.remoteBranches[remoteBranchName];
                                output = `To ${newState.remotes[remote]}
 - [deleted]         ${dst}`;
                            } else {
                                output = `error: unable to delete '${dst}': remote ref does not exist`;
                                isError = true;
                            }
                        } else {
                            // Push src to dst
                            const srcHash = newState.branches[src] || newState.HEAD;
                            if (srcHash) {
                                newState.remoteBranches[`${remote}/${dst}`] = srcHash;
                                output = `To ${newState.remotes[remote]}
   ${srcHash.substring(0, 7)}..${srcHash.substring(0, 7)}  ${src} -> ${dst}`;
                            } else {
                                output = `error: src refspec ${src} does not match any`;
                                isError = true;
                            }
                        }
                    } else {
                        // Normal push
                        newState.remoteBranches[`${remote}/${refspec}`] = newState.branches[refspec] || newState.HEAD || '';
                        output = `To ${newState.remotes[remote]}
   ${newState.HEAD?.substring(0, 7)}..${newState.HEAD?.substring(0, 7)}  ${refspec} -> ${refspec}`;
                    }
                } else {
                    // Default push
                    newState.remoteBranches[`${remote}/${newState.currentBranch}`] = newState.HEAD || '';
                    output = `To ${newState.remotes[remote]}
   ${newState.HEAD?.substring(0, 7)}..${newState.HEAD?.substring(0, 7)}  ${newState.currentBranch} -> ${newState.currentBranch}`;
                }
                success = true;
            }

        } else if (subCmd === 'remote') {
            if (args[2] === 'add') {
                const name = args[3];
                const url = args[4];
                newState.remotes[name] = url;
                output = '';
                success = true;
            } else if (args[2] === 'remove') {
                const name = args[3];
                delete newState.remotes[name];
                output = '';
                success = true;
            } else if (args[2] === 'rename') {
                const oldName = args[3];
                const newName = args[4];
                newState.remotes[newName] = newState.remotes[oldName];
                delete newState.remotes[oldName];
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
            const remote = args[2] || 'origin';
            const refspec = args[3];

            if (refspec && refspec.includes(':')) {
                const [src, dst] = refspec.split(':');
                // Simulate fetching src from remote and updating local dst
                const fetchedHash = 'fetched_hash_' + Math.random().toString(36).substring(7);
                newState.branches[dst] = fetchedHash;
                output = `From ${newState.remotes[remote]}
 * [new branch]      ${src}     -> ${dst}`;
            } else {
                output = `From ${newState.remotes[remote]}
 * [new branch]      main       -> ${remote}/main`;
            }
            success = true;

        } else if (subCmd === 'reset') {
            const mode = args.includes('--hard') ? 'hard' : args.includes('--soft') ? 'soft' : 'mixed';
            const target = args[args.length - 1] === 'reset' ? 'HEAD' : args[args.length - 1]; // if no arg, default HEAD

            if (mode === 'hard') {
                newState.workingDirectory = [];
                newState.staging = [];
                output = `HEAD is now at ${newState.HEAD?.substring(0, 7)} (Hard reset)`;
            } else if (mode === 'soft') {
                output = `HEAD is now at ${newState.HEAD?.substring(0, 7)} (Soft reset)`;
            } else {
                newState.staging = [];
                output = `Unstaged changes after reset:\nM\tfile.txt`;
            }
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
            } else if (args[2] === 'list') {
                output = newState.stash.map((s: any, i: number) => `stash@{${i}}: ${s.message}`).join('\n');
                success = true;
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
                output = `commit ${newState.HEAD || 'a1b2c3d'}\nAuthor: User <user@example.com>\nDate: ${new Date().toDateString()}\n\n    Initial commit\n\ndiff --git a/file b/file...`;
                success = true;
            }

        } else if (subCmd === 'tag') {
            if (args[2]) {
                const tagName = args.includes('-a') ? args[args.indexOf('-a') + 1] : args[2];
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
            } else if (args[2] === '--global' && args[3].startsWith('alias.')) {
                output = '';
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
