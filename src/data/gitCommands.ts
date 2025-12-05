import { RepositoryState } from '../utils/gitSimulator';

export type GitCommand = {
    id: string;
    name: string;
    category: string;
    description: string;
    syntax: string;
    examples: { code: string; explanation: string }[];
    tips: string[];
    practice: {
        initialState?: RepositoryState;
        tasks: {
            id: string;
            instruction: string;
            expectedCommand: string;
        }[];
    };
};

export const gitCommands: GitCommand[] = [
    {
        id: 'init',
        name: 'git init',
        category: '基本',
        description: '新しいGitリポジトリを作成します。',
        syntax: 'git init [ディレクトリ名]',
        examples: [
            { code: 'git init', explanation: '現在のディレクトリを初期化' }
        ],
        tips: ['まずはここから始まります'],
        practice: {
            tasks: [
                {
                    id: 'init-1',
                    instruction: '現在のディレクトリをGitリポジトリとして初期化してください',
                    expectedCommand: 'git init'
                },
                {
                    id: 'init-2',
                    instruction: '正しく初期化されたか確認するためにステータスを見てみましょう',
                    expectedCommand: 'git status'
                }
            ]
        }
    },
    {
        id: 'add',
        name: 'git add',
        category: '基本',
        description: 'ファイルをステージングエリアに追加します。',
        syntax: 'git add <ファイル名>',
        examples: [
            { code: 'git add .', explanation: 'すべての変更を追加' }
        ],
        tips: ['コミットする前に必ず実行します'],
        practice: {
            tasks: [
                {
                    id: 'add-1',
                    instruction: 'まずは新しいファイルを作成しましょう (touch index.html)',
                    expectedCommand: 'touch index.html'
                },
                {
                    id: 'add-2',
                    instruction: '作成した index.html をステージングエリアに追加してください',
                    expectedCommand: 'git add index.html'
                },
                {
                    id: 'add-3',
                    instruction: 'ステータスを確認して、ステージングされたことを確認しましょう',
                    expectedCommand: 'git status'
                }
            ]
        }
    },
    {
        id: 'commit',
        name: 'git commit',
        category: '基本',
        description: 'ステージングエリアの変更をリポジトリに記録します。',
        syntax: 'git commit -m "<メッセージ>"',
        examples: [
            { code: 'git commit -m "Initial commit"', explanation: 'メッセージ付きでコミット' }
        ],
        tips: ['わかりやすいメッセージを心がけましょう'],
        practice: {
            tasks: [
                {
                    id: 'commit-1',
                    instruction: 'コミットするファイルを作成します (touch README.md)',
                    expectedCommand: 'touch README.md'
                },
                {
                    id: 'commit-2',
                    instruction: 'ファイルをステージングエリアに追加してください',
                    expectedCommand: 'git add README.md'
                },
                {
                    id: 'commit-3',
                    instruction: 'メッセージ "Add README" を付けてコミットしてください',
                    expectedCommand: 'git commit -m "Add README"'
                }
            ]
        }
    },
    {
        id: 'status',
        name: 'git status',
        category: '確認',
        description: 'リポジトリの状態を確認します。',
        syntax: 'git status',
        examples: [{ code: 'git status', explanation: '状態を表示' }],
        tips: ['迷ったらとりあえず実行しましょう'],
        practice: {
            tasks: [
                {
                    id: 'status-1',
                    instruction: 'ファイルを作成してみましょう (touch style.css)',
                    expectedCommand: 'touch style.css'
                },
                {
                    id: 'status-2',
                    instruction: '現在の状態を確認してください（Untracked filesに表示されるはずです）',
                    expectedCommand: 'git status'
                },
                {
                    id: 'status-3',
                    instruction: 'ファイルをステージングに追加してください',
                    expectedCommand: 'git add style.css'
                },
                {
                    id: 'status-4',
                    instruction: 'もう一度状態を確認してください（Changes to be committedになるはずです）',
                    expectedCommand: 'git status'
                }
            ]
        }
    },
    {
        id: 'branch',
        name: 'git branch',
        category: 'ブランチ',
        description: 'ブランチを操作します。',
        syntax: 'git branch [ブランチ名]',
        examples: [{ code: 'git branch feature', explanation: 'featureブランチ作成' }],
        tips: ['作業を分ける時に使います'],
        practice: {
            tasks: [
                {
                    id: 'branch-1',
                    instruction: '現在のブランチ一覧を確認してください',
                    expectedCommand: 'git branch'
                },
                {
                    id: 'branch-2',
                    instruction: 'new-feature という名前で新しいブランチを作成してください',
                    expectedCommand: 'git branch new-feature'
                },
                {
                    id: 'branch-3',
                    instruction: 'もう一度一覧を表示して、作成されたことを確認してください',
                    expectedCommand: 'git branch'
                }
            ]
        }
    },
    {
        id: 'checkout',
        name: 'git checkout',
        category: 'ブランチ',
        description: 'ブランチを切り替えます。',
        syntax: 'git checkout <ブランチ名>',
        examples: [{ code: 'git checkout main', explanation: 'mainに切り替え' }],
        tips: ['-bで作成と切り替えを同時に行えます'],
        practice: {
            tasks: [
                {
                    id: 'checkout-1',
                    instruction: 'develop ブランチを作成して切り替えてください (-bオプションを使用)',
                    expectedCommand: 'git checkout -b develop'
                },
                {
                    id: 'checkout-2',
                    instruction: 'main ブランチに戻ってください',
                    expectedCommand: 'git checkout main'
                }
            ]
        }
    },
    {
        id: 'merge',
        name: 'git merge',
        category: 'ブランチ',
        description: 'ブランチを統合します。',
        syntax: 'git merge <ブランチ名>',
        examples: [{ code: 'git merge feature', explanation: 'featureを統合' }],
        tips: ['マージされる側のブランチに移動してから実行します'],
        practice: {
            tasks: [
                {
                    id: 'merge-1',
                    instruction: 'feature ブランチを作成して切り替えてください',
                    expectedCommand: 'git checkout -b feature'
                },
                {
                    id: 'merge-2',
                    instruction: 'ファイルを作成してコミットしましょう (touch feature.txt)',
                    expectedCommand: 'touch feature.txt'
                },
                {
                    id: 'merge-3',
                    instruction: 'ステージングに追加',
                    expectedCommand: 'git add feature.txt'
                },
                {
                    id: 'merge-4',
                    instruction: 'コミットします',
                    expectedCommand: 'git commit -m "Add feature"'
                },
                {
                    id: 'merge-5',
                    instruction: 'main ブランチに戻ってください',
                    expectedCommand: 'git checkout main'
                },
                {
                    id: 'merge-6',
                    instruction: 'feature ブランチを main にマージしてください',
                    expectedCommand: 'git merge feature'
                }
            ]
        }
    },
    {
        id: 'clone',
        name: 'git clone',
        category: '基本',
        description: 'リポジトリを複製します。',
        syntax: 'git clone <URL>',
        examples: [],
        tips: [],
        practice: {
            tasks: [
                {
                    id: 'clone-1',
                    instruction: 'https://github.com/example/repo.git をクローンしてください',
                    expectedCommand: 'git clone https://github.com/example/repo.git'
                },
                {
                    id: 'clone-2',
                    instruction: 'クローンしたディレクトリの中身を確認しましょう (lsコマンドの代わりに git status で確認)',
                    expectedCommand: 'git status'
                }
            ]
        }
    },
    {
        id: 'log',
        name: 'git log',
        category: '確認',
        description: '履歴を表示します。',
        syntax: 'git log',
        examples: [],
        tips: [],
        practice: {
            tasks: [
                {
                    id: 'log-1',
                    instruction: 'まずはコミットをいくつか作りましょう。ファイル作成 (touch a.txt)',
                    expectedCommand: 'touch a.txt'
                },
                {
                    id: 'log-2',
                    instruction: 'ステージングとコミット (git add . && git commit -m "A")',
                    expectedCommand: 'git add .'
                },
                {
                    id: 'log-3',
                    instruction: 'コミットしてください',
                    expectedCommand: 'git commit -m "A"'
                },
                {
                    id: 'log-4',
                    instruction: 'もう一つ作成 (touch b.txt)',
                    expectedCommand: 'touch b.txt'
                },
                {
                    id: 'log-5',
                    instruction: 'ステージング',
                    expectedCommand: 'git add .'
                },
                {
                    id: 'log-6',
                    instruction: 'コミット',
                    expectedCommand: 'git commit -m "B"'
                },
                {
                    id: 'log-7',
                    instruction: 'これまでの履歴を1行形式で表示してください',
                    expectedCommand: 'git log --oneline'
                }
            ]
        }
    },
    {
        id: 'pull',
        name: 'git pull',
        category: 'リモート',
        description: 'リモートから取得してマージします。',
        syntax: 'git pull',
        examples: [],
        tips: [],
        practice: {
            tasks: [
                {
                    id: 'pull-1',
                    instruction: 'リモートリポジトリを設定します (git remote add origin https://repo.git)',
                    expectedCommand: 'git remote add origin https://repo.git'
                },
                {
                    id: 'pull-2',
                    instruction: 'リモートから最新の変更を取得してマージしてください',
                    expectedCommand: 'git pull origin main'
                }
            ]
        }
    },
    {
        id: 'push',
        name: 'git push',
        category: 'リモート',
        description: 'リモートに送信します。',
        syntax: 'git push',
        examples: [],
        tips: [],
        practice: {
            tasks: [
                {
                    id: 'push-1',
                    instruction: 'リモートリポジトリを設定します',
                    expectedCommand: 'git remote add origin https://repo.git'
                },
                {
                    id: 'push-2',
                    instruction: '変更をコミットしましょう (touch new.txt -> add -> commit)',
                    expectedCommand: 'touch new.txt'
                },
                {
                    id: 'push-3',
                    instruction: 'ステージング',
                    expectedCommand: 'git add new.txt'
                },
                {
                    id: 'push-4',
                    instruction: 'コミット',
                    expectedCommand: 'git commit -m "New file"'
                },
                {
                    id: 'push-5',
                    instruction: 'リモートのmainブランチにプッシュしてください',
                    expectedCommand: 'git push origin main'
                }
            ]
        }
    },
    {
        id: 'remote',
        name: 'git remote',
        category: 'リモート',
        description: 'リモートリポジトリを管理します。',
        syntax: 'git remote',
        examples: [],
        tips: [],
        practice: {
            tasks: [
                {
                    id: 'remote-1',
                    instruction: 'origin という名前で https://github.com/user/repo.git を追加してください',
                    expectedCommand: 'git remote add origin https://github.com/user/repo.git'
                },
                {
                    id: 'remote-2',
                    instruction: '登録されているリモートのURLを確認してください',
                    expectedCommand: 'git remote -v'
                }
            ]
        }
    },
    {
        id: 'fetch',
        name: 'git fetch',
        category: 'リモート',
        description: 'リモートから取得のみ行います。',
        syntax: 'git fetch',
        examples: [],
        tips: [],
        practice: {
            tasks: [
                {
                    id: 'fetch-1',
                    instruction: 'リモートを追加します',
                    expectedCommand: 'git remote add origin https://repo.git'
                },
                {
                    id: 'fetch-2',
                    instruction: 'リモートから最新情報を取得してください（マージはしない）',
                    expectedCommand: 'git fetch'
                }
            ]
        }
    },
    {
        id: 'reset',
        name: 'git reset',
        category: '取り消し',
        description: 'コミットを取り消します。',
        syntax: 'git reset',
        examples: [],
        tips: [],
        practice: {
            tasks: [
                {
                    id: 'reset-1',
                    instruction: 'コミットを作成します (touch bad.txt -> add -> commit)',
                    expectedCommand: 'touch bad.txt'
                },
                {
                    id: 'reset-2',
                    instruction: 'ステージング',
                    expectedCommand: 'git add bad.txt'
                },
                {
                    id: 'reset-3',
                    instruction: 'コミット',
                    expectedCommand: 'git commit -m "Bad commit"'
                },
                {
                    id: 'reset-4',
                    instruction: '直前のコミットを完全に取り消してください (Hard reset)',
                    expectedCommand: 'git reset --hard HEAD~1'
                }
            ]
        }
    },
    {
        id: 'revert',
        name: 'git revert',
        category: '取り消し',
        description: '打ち消しコミットを作成します。',
        syntax: 'git revert',
        examples: [],
        tips: [],
        practice: {
            tasks: [
                {
                    id: 'revert-1',
                    instruction: 'コミットを作成します (touch mistake.txt -> add -> commit)',
                    expectedCommand: 'touch mistake.txt'
                },
                {
                    id: 'revert-2',
                    instruction: 'ステージング',
                    expectedCommand: 'git add mistake.txt'
                },
                {
                    id: 'revert-3',
                    instruction: 'コミット',
                    expectedCommand: 'git commit -m "Mistake"'
                },
                {
                    id: 'revert-4',
                    instruction: '直前のコミットを打ち消すコミットを作成してください',
                    expectedCommand: 'git revert HEAD'
                }
            ]
        }
    },
    {
        id: 'stash',
        name: 'git stash',
        category: '一時保存',
        description: '変更を一時退避します。',
        syntax: 'git stash',
        examples: [],
        tips: [],
        practice: {
            tasks: [
                {
                    id: 'stash-1',
                    instruction: '作業中のファイルを作成 (touch work.txt)',
                    expectedCommand: 'touch work.txt'
                },
                {
                    id: 'stash-2',
                    instruction: 'ステージングに追加',
                    expectedCommand: 'git add work.txt'
                },
                {
                    id: 'stash-3',
                    instruction: '現在の変更を一時保存してください',
                    expectedCommand: 'git stash'
                },
                {
                    id: 'stash-4',
                    instruction: '保存した変更を復元して削除してください',
                    expectedCommand: 'git stash pop'
                }
            ]
        }
    },
    {
        id: 'rebase',
        name: 'git rebase',
        category: '上級',
        description: '履歴を整理します。',
        syntax: 'git rebase',
        examples: [],
        tips: [],
        practice: {
            tasks: [
                {
                    id: 'rebase-1',
                    instruction: 'featureブランチを作成して切り替え',
                    expectedCommand: 'git checkout -b feature'
                },
                {
                    id: 'rebase-2',
                    instruction: 'コミット作成 (touch f.txt -> add -> commit)',
                    expectedCommand: 'touch f.txt'
                },
                {
                    id: 'rebase-3',
                    instruction: 'ステージング',
                    expectedCommand: 'git add f.txt'
                },
                {
                    id: 'rebase-4',
                    instruction: 'コミット',
                    expectedCommand: 'git commit -m "Feature"'
                },
                {
                    id: 'rebase-5',
                    instruction: 'mainブランチに戻る',
                    expectedCommand: 'git checkout main'
                },
                {
                    id: 'rebase-6',
                    instruction: 'mainでもコミット作成 (touch m.txt -> add -> commit)',
                    expectedCommand: 'touch m.txt'
                },
                {
                    id: 'rebase-7',
                    instruction: 'ステージング',
                    expectedCommand: 'git add m.txt'
                },
                {
                    id: 'rebase-8',
                    instruction: 'コミット',
                    expectedCommand: 'git commit -m "Main update"'
                },
                {
                    id: 'rebase-9',
                    instruction: 'featureブランチに戻る',
                    expectedCommand: 'git checkout feature'
                },
                {
                    id: 'rebase-10',
                    instruction: 'featureブランチをmainの最新にリベースしてください',
                    expectedCommand: 'git rebase main'
                }
            ]
        }
    },
    {
        id: 'diff',
        name: 'git diff',
        category: '確認',
        description: '差分を表示します。',
        syntax: 'git diff',
        examples: [],
        tips: [],
        practice: {
            tasks: [
                {
                    id: 'diff-1',
                    instruction: 'ファイルを作成 (touch diff.txt)',
                    expectedCommand: 'touch diff.txt'
                },
                {
                    id: 'diff-2',
                    instruction: 'ステージングしていない変更の差分を表示してください',
                    expectedCommand: 'git diff'
                }
            ]
        }
    },
    {
        id: 'show',
        name: 'git show',
        category: '確認',
        description: 'コミット詳細を表示します。',
        syntax: 'git show',
        examples: [],
        tips: [],
        practice: {
            tasks: [
                {
                    id: 'show-1',
                    instruction: 'コミットを作成 (touch s.txt -> add -> commit)',
                    expectedCommand: 'touch s.txt'
                },
                {
                    id: 'show-2',
                    instruction: 'ステージング',
                    expectedCommand: 'git add s.txt'
                },
                {
                    id: 'show-3',
                    instruction: 'コミット',
                    expectedCommand: 'git commit -m "Show me"'
                },
                {
                    id: 'show-4',
                    instruction: '最新のコミットの詳細を表示してください',
                    expectedCommand: 'git show'
                }
            ]
        }
    },
    {
        id: 'tag',
        name: 'git tag',
        category: '上級',
        description: 'タグを付けます。',
        syntax: 'git tag',
        examples: [],
        tips: [],
        practice: {
            tasks: [
                {
                    id: 'tag-1',
                    instruction: 'コミットを作成 (touch t.txt -> add -> commit)',
                    expectedCommand: 'touch t.txt'
                },
                {
                    id: 'tag-2',
                    instruction: 'ステージング',
                    expectedCommand: 'git add t.txt'
                },
                {
                    id: 'tag-3',
                    instruction: 'コミット',
                    expectedCommand: 'git commit -m "Version 1"'
                },
                {
                    id: 'tag-4',
                    instruction: 'v1.0.0 というタグを作成してください',
                    expectedCommand: 'git tag v1.0.0'
                }
            ]
        }
    },
    {
        id: 'cherry-pick',
        name: 'git cherry-pick',
        category: '上級',
        description: '特定のコミットを取り込みます。',
        syntax: 'git cherry-pick',
        examples: [],
        tips: [],
        practice: {
            tasks: [
                {
                    id: 'cherry-pick-1',
                    instruction: 'featureブランチ作成',
                    expectedCommand: 'git checkout -b feature'
                },
                {
                    id: 'cherry-pick-2',
                    instruction: 'コミット作成 (touch c.txt -> add -> commit)',
                    expectedCommand: 'touch c.txt'
                },
                {
                    id: 'cherry-pick-3',
                    instruction: 'ステージング',
                    expectedCommand: 'git add c.txt'
                },
                {
                    id: 'cherry-pick-4',
                    instruction: 'コミット',
                    expectedCommand: 'git commit -m "Cherry"'
                },
                {
                    id: 'cherry-pick-5',
                    instruction: 'mainに戻る',
                    expectedCommand: 'git checkout main'
                },
                {
                    id: 'cherry-pick-6',
                    instruction: 'featureブランチの最新コミットを取り込んでください (IDはシミュレータ上では HEAD で代用可)',
                    expectedCommand: 'git cherry-pick feature'
                }
            ]
        }
    },
    {
        id: 'config',
        name: 'git config',
        category: '設定',
        description: '設定を変更します。',
        syntax: 'git config',
        examples: [],
        tips: [],
        practice: {
            tasks: [
                {
                    id: 'config-1',
                    instruction: 'ユーザー名を設定してください',
                    expectedCommand: 'git config --global user.name "Your Name"'
                }
            ]
        }
    }
];
