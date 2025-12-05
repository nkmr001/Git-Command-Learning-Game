import { RepositoryState, initialRepositoryState } from '../utils/gitSimulator';
import { AdvancedScenario } from '../components/AdvancedQuizData';

// Helper to create a base state with some commits
const createBaseState = (branchName: string = 'main', commitCount: number = 1): RepositoryState => {
    const state = JSON.parse(JSON.stringify(initialRepositoryState));
    let parent = null;
    for (let i = 0; i < commitCount; i++) {
        const hash = Math.random().toString(36).substring(7);
        state.commits.push({
            hash,
            message: `C${i + 1}`,
            parents: parent ? [parent] : [],
            branch: branchName,
            timestamp: Date.now() - 100000 + (i * 1000)
        });
        parent = hash;
    }
    if (parent) {
        state.HEAD = parent;
        state.branches[branchName] = parent;
    }
    return state;
};

// Generator for scenarios
const generateScenarios = (): AdvancedScenario[] => {
    const scenarios: AdvancedScenario[] = [];

    // --- Introduction Sequence ---

    // 1. Introduction to Git Commits
    scenarios.push({
        id: 'lgb-intro-1',
        title: 'Git Commits (Introduction)',
        difficulty: 'basic',
        description: 'Gitの基本であるコミットを理解します。',
        situation: 'リポジトリを作成しました。開発を進めるためにコミットを2回行いましょう。',
        goal: 'コミットを2回作成する',
        initialState: createBaseState('main', 1),
        tasks: [
            { id: 't1', instruction: '現在の状態を確認してください', expectedCommand: 'git status', hint: '' },
            { id: 't2', instruction: '1回目のコミットを行ってください', expectedCommand: 'git commit -m "First work"', hint: '' },
            { id: 't3', instruction: 'ログを確認してください', expectedCommand: 'git log --oneline', hint: '' },
            { id: 't4', instruction: '2回目のコミットを行ってください', expectedCommand: 'git commit -m "Second work"', hint: '' },
            { id: 't5', instruction: '最終的なログを確認してください', expectedCommand: 'git log --oneline', hint: '' }
        ]
    });

    // 2. Branching in Git
    scenarios.push({
        id: 'lgb-intro-2',
        title: 'Branching in Git',
        difficulty: 'basic',
        description: 'ブランチを作成して切り替えます。',
        situation: '新しい機能 "bugFix" を開発するためにブランチを切ります。',
        goal: 'bugFixブランチを作成し、切り替える',
        initialState: createBaseState('main', 2),
        tasks: [
            { id: 't1', instruction: '現在のブランチを確認してください', expectedCommand: 'git branch', hint: '' },
            { id: 't2', instruction: 'bugFixという名前の新しいブランチを作成してください', expectedCommand: 'git branch bugFix', hint: '' },
            { id: 't3', instruction: 'bugFixブランチに切り替えてください', expectedCommand: 'git checkout bugFix', hint: '' },
            { id: 't4', instruction: '切り替わったことを確認してください', expectedCommand: 'git branch', hint: '' }
        ]
    });

    // 3. Merging in Git
    scenarios.push({
        id: 'lgb-intro-3',
        title: 'Merging in Git',
        difficulty: 'intermediate',
        description: 'ブランチでの作業をマージします。',
        situation: 'bugFixブランチで作業を行い、それをmainにマージします。',
        goal: 'bugFixでの作業をmainに取り込む',
        initialState: (() => {
            const state = createBaseState('main', 2);
            state.branches['bugFix'] = state.HEAD;
            return state;
        })(),
        tasks: [
            { id: 't1', instruction: 'bugFixブランチに切り替えてください', expectedCommand: 'git checkout bugFix', hint: '' },
            { id: 't2', instruction: 'バグ修正のコミットを行ってください', expectedCommand: 'git commit -m "Fix bug"', hint: '' },
            { id: 't3', instruction: 'mainブランチに戻ってください', expectedCommand: 'git checkout main', hint: '' },
            { id: 't4', instruction: 'mainでも別の作業（コミット）を行ってください', expectedCommand: 'git commit -m "Main work"', hint: '' },
            { id: 't5', instruction: 'bugFixをmainにマージしてください', expectedCommand: 'git merge bugFix', hint: '' },
            { id: 't6', instruction: 'マージ結果をグラフで確認してください', expectedCommand: 'git log --graph --oneline', hint: '' }
        ]
    });

    // 4. Git Rebase
    scenarios.push({
        id: 'lgb-intro-4',
        title: 'Git Rebase',
        difficulty: 'intermediate',
        description: 'リベースを使って履歴をきれいに保ちます。',
        situation: 'bugFixブランチの作業を、mainの最新の後に移動させます。',
        goal: 'bugFixをmainにリベースする',
        initialState: (() => {
            const state = createBaseState('main', 2);
            const root = state.HEAD;
            // main work
            state.commits.push({ hash: 'C3', message: 'Main work', parents: [root], branch: 'main', timestamp: Date.now() });
            state.branches['main'] = 'C3';
            state.HEAD = 'C3';
            // bugFix work
            state.commits.push({ hash: 'C2', message: 'Bug fix', parents: [root], branch: 'bugFix', timestamp: Date.now() });
            state.branches['bugFix'] = 'C2';
            return state;
        })(),
        tasks: [
            { id: 't1', instruction: 'bugFixブランチに切り替えてください', expectedCommand: 'git checkout bugFix', hint: '' },
            { id: 't2', instruction: '現在のグラフを確認してください', expectedCommand: 'git log --graph --oneline --all', hint: '' },
            { id: 't3', instruction: 'bugFixをmainにリベースしてください', expectedCommand: 'git rebase main', hint: '' },
            { id: 't4', instruction: 'リベース後のグラフを確認してください（一直線になっているはずです）', expectedCommand: 'git log --graph --oneline --all', hint: '' },
            { id: 't5', instruction: 'mainブランチに切り替えてください', expectedCommand: 'git checkout main', hint: '' },
            { id: 't6', instruction: 'bugFixをマージしてください（Fast-forwardになります）', expectedCommand: 'git merge bugFix', hint: '' }
        ]
    });

    // --- Ramping Up ---

    // 5. Detached HEAD
    scenarios.push({
        id: 'lgb-ramp-1',
        title: 'Detached HEAD',
        difficulty: 'intermediate',
        description: 'HEADをブランチから切り離して、特定のコミットに移動します。',
        situation: '過去のコミットの状態を確認したいです。',
        goal: 'HEADをC1（最初のコミット）に移動する',
        initialState: createBaseState('main', 3), // C1, C2, C3
        tasks: [
            { id: 't1', instruction: 'ログを確認してC1のハッシュを探してください', expectedCommand: 'git log --oneline', hint: '' },
            { id: 't2', instruction: 'C1をチェックアウトしてください（ハッシュはログから推測、ここではHEAD~2とします）', expectedCommand: 'git checkout HEAD~2', hint: 'HEAD~2' },
            { id: 't3', instruction: '現在の状態を確認してください（Detached HEAD）', expectedCommand: 'git status', hint: '' },
            { id: 't4', instruction: '元のmainに戻ってください', expectedCommand: 'git checkout main', hint: '' }
        ]
    });

    // 6. Relative Refs (^)
    scenarios.push({
        id: 'lgb-ramp-2',
        title: 'Relative Refs (^)',
        difficulty: 'intermediate',
        description: 'キャレット(^)演算子を使って親コミットに移動します。',
        situation: 'ハッシュを使わずに、相対的な位置で移動したい。',
        goal: 'bugFixの親コミットに移動する',
        initialState: (() => {
            const state = createBaseState('main', 1);
            state.branches['bugFix'] = state.HEAD;
            state.commits.push({ hash: 'C2', message: 'Work', parents: [state.HEAD], branch: 'bugFix', timestamp: Date.now() });
            state.branches['bugFix'] = 'C2';
            return state;
        })(),
        tasks: [
            { id: 't1', instruction: 'bugFixブランチに切り替えてください', expectedCommand: 'git checkout bugFix', hint: '' },
            { id: 't2', instruction: 'bugFixの親コミットにチェックアウトしてください（^を使用）', expectedCommand: 'git checkout bugFix^', hint: '' },
            { id: 't3', instruction: '現在のHEADの位置を確認してください', expectedCommand: 'git log --oneline -n 1', hint: '' }
        ]
    });

    // 7. Relative Refs (~)
    scenarios.push({
        id: 'lgb-ramp-3',
        title: 'Relative Refs (~)',
        difficulty: 'intermediate',
        description: 'チルダ(~)演算子を使って数世代前の親コミットに移動します。',
        situation: '3つ前のコミットに戻りたい。',
        goal: 'HEAD~3の位置に移動する',
        initialState: createBaseState('main', 5),
        tasks: [
            { id: 't1', instruction: '現在のログを確認してください', expectedCommand: 'git log --oneline', hint: '' },
            { id: 't2', instruction: 'HEADから3つ前のコミットにチェックアウトしてください（~を使用）', expectedCommand: 'git checkout HEAD~3', hint: '' },
            { id: 't3', instruction: '移動後のコミットを確認してください', expectedCommand: 'git show --oneline --no-patch', hint: '' },
            { id: 't4', instruction: 'ブランチを強制的にこの位置に移動させてください（-fオプション）', expectedCommand: 'git branch -f main HEAD', hint: '' }
        ]
    });

    // 8. Reversing Changes in Git
    scenarios.push({
        id: 'lgb-ramp-4',
        title: 'Reversing Changes',
        difficulty: 'intermediate',
        description: '変更を取り消す方法（ResetとRevert）を学びます。',
        situation: 'localブランチの変更はResetで、pushedブランチの変更はRevertで取り消したい。',
        goal: 'localをResetし、pushedをRevertする',
        initialState: (() => {
            const state = createBaseState('main', 1);
            // local branch
            state.branches['local'] = state.HEAD;
            state.commits.push({ hash: 'L1', message: 'Local work', parents: [state.HEAD], branch: 'local', timestamp: Date.now() });
            state.branches['local'] = 'L1';
            // pushed branch
            state.branches['pushed'] = state.HEAD;
            state.commits.push({ hash: 'P1', message: 'Pushed work', parents: [state.HEAD], branch: 'pushed', timestamp: Date.now() });
            state.branches['pushed'] = 'P1';
            return state;
        })(),
        tasks: [
            { id: 't1', instruction: 'localブランチに切り替えてください', expectedCommand: 'git checkout local', hint: '' },
            { id: 't2', instruction: '直前のコミットをResetしてください（履歴から消す）', expectedCommand: 'git reset HEAD~1', hint: '' },
            { id: 't3', instruction: 'pushedブランチに切り替えてください', expectedCommand: 'git checkout pushed', hint: '' },
            { id: 't4', instruction: '直前のコミットをRevertしてください（打ち消しコミット作成）', expectedCommand: 'git revert HEAD', hint: '' },
            { id: 't5', instruction: '最終的なログを確認してください', expectedCommand: 'git log --oneline --all --graph', hint: '' }
        ]
    });

    // --- Moving Work Around ---

    // 9. Cherry-pick
    scenarios.push({
        id: 'lgb-move-1',
        title: 'Cherry-pick',
        difficulty: 'advanced',
        description: '必要なコミットだけを現在のブランチにコピーします。',
        situation: 'sideブランチにある3つのコミットのうち、2つだけをmainに取り込みたい。',
        goal: 'sideブランチのC2とC4をmainにチェリーピックする',
        initialState: (() => {
            const state = createBaseState('main', 1);
            const root = state.HEAD;
            // side branch with C2, C3, C4
            let parent = root;
            ['C2', 'C3', 'C4'].forEach(msg => {
                const hash = msg;
                state.commits.push({ hash, message: msg, parents: [parent!], branch: 'side', timestamp: Date.now() });
                parent = hash;
            });
            state.branches['side'] = parent!;
            return state;
        })(),
        tasks: [
            { id: 't1', instruction: 'sideブランチのログを確認してください', expectedCommand: 'git log side --oneline', hint: '' },
            { id: 't2', instruction: 'mainブランチにいることを確認してください', expectedCommand: 'git status', hint: '' },
            { id: 't3', instruction: 'C2をチェリーピックしてください', expectedCommand: 'git cherry-pick C2', hint: '' },
            { id: 't4', instruction: 'C4をチェリーピックしてください', expectedCommand: 'git cherry-pick C4', hint: '' },
            { id: 't5', instruction: 'mainのログを確認してください（C2とC4が含まれているはずです）', expectedCommand: 'git log --oneline', hint: '' }
        ]
    });

    // 10. Interactive Rebase
    scenarios.push({
        id: 'lgb-move-2',
        title: 'Interactive Rebase',
        difficulty: 'advanced',
        description: '対話的リベースを使ってコミットの順番を変えたり削除したりします。',
        situation: '直近の4つのコミットの順番を変えて、不要なものを削除したい。',
        goal: 'リベースで履歴を整理する',
        initialState: createBaseState('main', 5),
        tasks: [
            { id: 't1', instruction: '現在のログを確認してください', expectedCommand: 'git log --oneline', hint: '' },
            { id: 't2', instruction: '直近4つのコミットを対話的リベースで編集してください', expectedCommand: 'git rebase -i HEAD~4', hint: '' },
            { id: 't3', instruction: '（シミュレーション）エディタで順序を入れ替え、pickをdropに変更したと仮定して完了します', expectedCommand: 'git status', hint: 'シミュレータでは自動完了します' },
            { id: 't4', instruction: 'リベース後のログを確認してください', expectedCommand: 'git log --oneline', hint: '' }
        ]
    });

    // --- A Mixed Bag ---

    // 11. Grabbing Just 1 Commit
    scenarios.push({
        id: 'lgb-mixed-1',
        title: 'Grabbing Just 1 Commit',
        difficulty: 'intermediate',
        description: 'デバッグ用にログ出力したコミットとは別に、修正コミットだけを取り込みたい。',
        situation: 'debugブランチにはログ出力とバグ修正が混ざっています。バグ修正だけをmainに持ってきたい。',
        goal: 'バグ修正コミットだけをmainにチェリーピックする',
        initialState: (() => {
            const state = createBaseState('main', 1);
            const root = state.HEAD;
            // debug branch
            let parent = root;
            state.commits.push({ hash: 'C2', message: 'Log output', parents: [parent!], branch: 'debug', timestamp: Date.now() });
            parent = 'C2';
            state.commits.push({ hash: 'C3', message: 'Bug fix', parents: [parent!], branch: 'debug', timestamp: Date.now() });
            parent = 'C3';
            state.commits.push({ hash: 'C4', message: 'More logs', parents: [parent!], branch: 'debug', timestamp: Date.now() });
            state.branches['debug'] = 'C4';
            return state;
        })(),
        tasks: [
            { id: 't1', instruction: 'debugブランチのログを確認してください', expectedCommand: 'git log debug --oneline', hint: '' },
            { id: 't2', instruction: 'バグ修正コミット(C3)をチェリーピックしてください', expectedCommand: 'git cherry-pick C3', hint: '' },
            { id: 't3', instruction: 'mainのログを確認してください', expectedCommand: 'git log --oneline', hint: '' }
        ]
    });

    // 12. Juggling Commits
    scenarios.push({
        id: 'lgb-mixed-2',
        title: 'Juggling Commits',
        difficulty: 'expert',
        description: '過去のコミットを修正するために、履歴を並べ替えて修正し、元に戻します。',
        situation: '2つ前のコミット(C2)に修正を加えたい。',
        goal: 'C2を修正する',
        initialState: createBaseState('main', 3), // C1, C2, C3
        tasks: [
            { id: 't1', instruction: 'C2を最後に持ってくるようにリベースしてください（HEAD~2）', expectedCommand: 'git rebase -i HEAD~2', hint: '順序入れ替え' },
            { id: 't2', instruction: '直前のコミット（元C2）を修正してください', expectedCommand: 'git commit --amend -m "C2 Updated"', hint: '' },
            { id: 't3', instruction: '順序を元に戻すために再度リベースしてください', expectedCommand: 'git rebase -i HEAD~2', hint: '' },
            { id: 't4', instruction: '修正された履歴を確認してください', expectedCommand: 'git log --oneline', hint: '' }
        ]
    });

    // 13. Juggling Commits #2 (Cherry-pick method)
    scenarios.push({
        id: 'lgb-mixed-3',
        title: 'Juggling Commits #2',
        difficulty: 'expert',
        description: 'チェリーピックを使って同じことを実現します。',
        situation: 'newImageブランチの過去のコミットを修正してmainに取り込みたい。',
        goal: '修正したコミットをmainに追加する',
        initialState: (() => {
            const state = createBaseState('main', 1);
            state.branches['newImage'] = state.HEAD;
            state.commits.push({ hash: 'C2', message: 'Image 1', parents: [state.HEAD], branch: 'newImage', timestamp: Date.now() });
            state.branches['newImage'] = 'C2';
            return state;
        })(),
        tasks: [
            { id: 't1', instruction: 'newImageブランチの最新コミットをチェックアウトしてください', expectedCommand: 'git checkout newImage', hint: '' },
            { id: 't2', instruction: 'コミットを修正してください', expectedCommand: 'git commit --amend -m "Image 1 Fixed"', hint: '' },
            { id: 't3', instruction: 'mainブランチに戻ってください', expectedCommand: 'git checkout main', hint: '' },
            { id: 't4', instruction: '修正したコミット（newImage）をチェリーピックしてください', expectedCommand: 'git cherry-pick newImage', hint: '' }
        ]
    });

    // 14. Git Tags
    scenarios.push({
        id: 'lgb-mixed-4',
        title: 'Git Tags',
        difficulty: 'intermediate',
        description: '重要なポイントにタグを付けます。',
        situation: 'バージョン1.0と1.1をリリースしました。',
        goal: 'C1にv1、C2にv2のタグを付ける',
        initialState: createBaseState('main', 2), // C1, C2
        tasks: [
            { id: 't1', instruction: 'C1（HEAD~1）に v1 タグを付けてください', expectedCommand: 'git tag v1 HEAD~1', hint: '' },
            { id: 't2', instruction: 'C2（HEAD）に v2 タグを付けてください', expectedCommand: 'git tag v2', hint: '' },
            { id: 't3', instruction: 'タグ一覧を確認してください', expectedCommand: 'git tag', hint: '' },
            { id: 't4', instruction: 'v1タグの状態を確認してください', expectedCommand: 'git show v1', hint: '' }
        ]
    });

    // 15. Git Describe
    scenarios.push({
        id: 'lgb-mixed-5',
        title: 'Git Describe',
        difficulty: 'intermediate',
        description: '現在位置がタグからどれくらい離れているか確認します。',
        situation: 'デバッグ中、現在位置がどのバージョンに近いか知りたい。',
        goal: 'git describeを実行する',
        initialState: (() => {
            const state = createBaseState('main', 3);
            state.tags['v1'] = state.commits[0].hash; // C1
            return state;
        })(),
        tasks: [
            { id: 't1', instruction: 'タグの位置を確認してください', expectedCommand: 'git log --oneline --decorate', hint: '' },
            { id: 't2', instruction: '現在位置をdescribeしてください', expectedCommand: 'git describe', hint: '' },
            { id: 't3', instruction: '1つ前のコミットをdescribeしてください', expectedCommand: 'git describe HEAD~1', hint: '' }
        ]
    });

    // --- Advanced Topics ---

    // 16. Rebasing over 9000 times
    scenarios.push({
        id: 'lgb-adv-1',
        title: 'Rebasing Multiple Branches',
        difficulty: 'expert',
        description: '複数のブランチを順番にリベースして一直線にします。',
        situation: 'bugFix, side, another の3つのブランチがあり、全てmainに統合したい。',
        goal: '全てのブランチをmainにリベースする',
        initialState: (() => {
            const state = createBaseState('main', 1);
            const root = state.HEAD;
            ['bugFix', 'side', 'another'].forEach(branch => {
                state.branches[branch] = root;
                state.commits.push({ hash: branch[0].toUpperCase() + '1', message: branch, parents: [root!], branch: branch, timestamp: Date.now() });
                state.branches[branch] = branch[0].toUpperCase() + '1';
            });
            return state;
        })(),
        tasks: [
            { id: 't1', instruction: 'bugFixをmainにリベースしてください', expectedCommand: 'git rebase main bugFix', hint: 'git rebase <base> <target>' },
            { id: 't2', instruction: 'sideをbugFixにリベースしてください', expectedCommand: 'git rebase bugFix side', hint: '' },
            { id: 't3', instruction: 'anotherをsideにリベースしてください', expectedCommand: 'git rebase side another', hint: '' },
            { id: 't4', instruction: 'mainをanotherまでFast-forwardしてください', expectedCommand: 'git rebase another main', hint: '' },
            { id: 't5', instruction: '最終的なグラフを確認してください', expectedCommand: 'git log --graph --oneline --all', hint: '' }
        ]
    });

    // --- Remote ---

    // 17. Clone Intro
    scenarios.push({
        id: 'lgb-remote-1',
        title: 'Clone Intro',
        difficulty: 'basic',
        description: 'リモートリポジトリをクローンします。',
        situation: '開発に参加するためにリポジトリを手元にコピーします。',
        goal: 'リポジトリをクローンする',
        initialState: initialRepositoryState,
        tasks: [
            { id: 't1', instruction: 'https://github.com/user/repo.git をクローンしてください', expectedCommand: 'git clone https://github.com/user/repo.git', hint: '' },
            { id: 't2', instruction: 'クローンしたリポジトリの状態を確認してください', expectedCommand: 'git status', hint: '' },
            { id: 't3', instruction: 'リモート設定を確認してください', expectedCommand: 'git remote -v', hint: '' }
        ]
    });

    // 18. Remote Branches
    scenarios.push({
        id: 'lgb-remote-2',
        title: 'Remote Branches',
        difficulty: 'basic',
        description: 'リモートブランチの概念を理解します。',
        situation: 'origin/main とローカルの main の違いを確認します。',
        goal: 'リモートブランチを確認し、チェックアウトする',
        initialState: (() => {
            const state = createBaseState('main', 1);
            state.remotes['origin'] = 'url';
            state.remoteBranches['origin/main'] = state.HEAD;
            return state;
        })(),
        tasks: [
            { id: 't1', instruction: 'コミットを行ってください', expectedCommand: 'git commit -m "Local work"', hint: '' },
            { id: 't2', instruction: 'すべてのブランチを表示してください', expectedCommand: 'git branch -a', hint: '' },
            { id: 't3', instruction: 'origin/main をチェックアウトしてください（Detached HEAD）', expectedCommand: 'git checkout origin/main', hint: '' },
            { id: 't4', instruction: 'ログを確認して、mainが進んでいることを確認してください', expectedCommand: 'git log --oneline --all --graph', hint: '' }
        ]
    });

    // 19. Git Fetch
    scenarios.push({
        id: 'lgb-remote-3',
        title: 'Git Fetch',
        difficulty: 'intermediate',
        description: 'リモートからデータを取得しますが、マージはしません。',
        situation: 'リモートの変更を確認したいですが、まだ取り込みたくはありません。',
        goal: 'fetchを実行する',
        initialState: (() => {
            const state = createBaseState('main', 1);
            state.remotes['origin'] = 'url';
            state.remoteBranches['origin/main'] = state.HEAD;
            return state;
        })(),
        tasks: [
            { id: 't1', instruction: 'リモートからフェッチしてください', expectedCommand: 'git fetch', hint: '' },
            { id: 't2', instruction: 'すべてのブランチを表示してください', expectedCommand: 'git branch -a', hint: '' },
            { id: 't3', instruction: 'origin/main のログを確認してください', expectedCommand: 'git log origin/main --oneline', hint: '' }
        ]
    });

    // 20. Git Pull
    scenarios.push({
        id: 'lgb-remote-4',
        title: 'Git Pull',
        difficulty: 'intermediate',
        description: 'FetchとMergeを一度に行います。',
        situation: 'リモートの変更をすぐに取り込みたい。',
        goal: 'pullを実行する',
        initialState: (() => {
            const state = createBaseState('main', 1);
            state.remotes['origin'] = 'url';
            state.remoteBranches['origin/main'] = state.HEAD;
            return state;
        })(),
        tasks: [
            { id: 't1', instruction: 'リモートからプルしてください', expectedCommand: 'git pull', hint: '' },
            { id: 't2', instruction: 'ログを確認してください', expectedCommand: 'git log --oneline', hint: '' }
        ]
    });

    // 21. Push Arguments
    scenarios.push({
        id: 'lgb-remote-5',
        title: 'Push Arguments',
        difficulty: 'advanced',
        description: 'プッシュ先を詳細に指定します。',
        situation: 'ローカルの "foo" ブランチをリモートの "bar" ブランチにプッシュしたい。',
        goal: 'foo:bar でプッシュする',
        initialState: (() => {
            const state = createBaseState('main', 1);
            state.remotes['origin'] = 'url';
            state.branches['foo'] = state.HEAD;
            return state;
        })(),
        tasks: [
            { id: 't1', instruction: 'fooブランチに切り替えてください', expectedCommand: 'git checkout foo', hint: '' },
            { id: 't2', instruction: 'コミットを行ってください', expectedCommand: 'git commit -m "Foo work"', hint: '' },
            { id: 't3', instruction: 'fooをリモートのbarにプッシュしてください', expectedCommand: 'git push origin foo:bar', hint: 'src:dst' },
            { id: 't4', instruction: 'リモートブランチが作成されたか確認してください', expectedCommand: 'git branch -r', hint: '' }
        ]
    });

    // 22. Fetch Arguments
    scenarios.push({
        id: 'lgb-remote-6',
        title: 'Fetch Arguments',
        difficulty: 'advanced',
        description: 'フェッチ元と先を詳細に指定します。',
        situation: 'リモートの "foo" ブランチをローカルの "bar" ブランチにフェッチしたい。',
        goal: 'foo:bar でフェッチする',
        initialState: (() => {
            const state = createBaseState('main', 1);
            state.remotes['origin'] = 'url';
            return state;
        })(),
        tasks: [
            { id: 't1', instruction: 'リモートのfooをローカルのbarにフェッチしてください', expectedCommand: 'git fetch origin foo:bar', hint: 'src:dst' },
            { id: 't2', instruction: 'ローカルブランチを確認してください', expectedCommand: 'git branch', hint: '' },
            { id: 't3', instruction: 'barブランチをチェックアウトしてください', expectedCommand: 'git checkout bar', hint: '' }
        ]
    });

    // 23. Source Nothing (Delete Remote Branch)
    scenarios.push({
        id: 'lgb-remote-7',
        title: 'Source Nothing',
        difficulty: 'expert',
        description: '空のソースをプッシュすることでリモートブランチを削除します。',
        situation: 'リモートの "foo" ブランチを削除したい（:foo 構文を使用）。',
        goal: 'リモートブランチを削除する',
        initialState: (() => {
            const state = createBaseState('main', 1);
            state.remotes['origin'] = 'url';
            state.remoteBranches['origin/foo'] = state.HEAD;
            return state;
        })(),
        tasks: [
            { id: 't1', instruction: 'リモートブランチを確認してください', expectedCommand: 'git branch -r', hint: '' },
            { id: 't2', instruction: '空のソースをfooにプッシュして削除してください', expectedCommand: 'git push origin :foo', hint: ':branch' },
            { id: 't3', instruction: '削除されたか確認してください', expectedCommand: 'git branch -r', hint: '' }
        ]
    });

    // 24. Pull Arguments
    scenarios.push({
        id: 'lgb-remote-8',
        title: 'Pull Arguments',
        difficulty: 'expert',
        description: 'プル元と先を詳細に指定します。',
        situation: 'リモートの "bar" をローカルの "foo" にプルしたい。',
        goal: 'bar:foo でプルする',
        initialState: (() => {
            const state = createBaseState('main', 1);
            state.remotes['origin'] = 'url';
            state.branches['foo'] = state.HEAD;
            return state;
        })(),
        tasks: [
            { id: 't1', instruction: 'fooブランチに切り替えてください', expectedCommand: 'git checkout foo', hint: '' },
            { id: 't2', instruction: 'リモートのbarをローカルのfooにプルしてください', expectedCommand: 'git pull origin bar:foo', hint: 'src:dst' },
            { id: 't3', instruction: 'ログを確認してください', expectedCommand: 'git log --oneline', hint: '' }
        ]
    });

    return scenarios;
};

export const additionalScenarios = generateScenarios();
