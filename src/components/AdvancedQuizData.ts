import { RepositoryState, initialRepositoryState } from '../utils/gitSimulator';
import { additionalScenarios } from '../data/advancedScenarios';

export type AdvancedScenario = {
  id: string;
  title: string;
  difficulty: 'intermediate' | 'advanced' | 'expert';
  description: string;
  situation: string;
  goal: string;
  initialState: RepositoryState;
  tasks: {
    id: string;
    instruction: string;
    expectedCommand: string;
    hint: string;
  }[];
  requiredCommands?: string[]; // Optional for now, can be derived or added
};

// Helper to create a base state with some commits
const createBaseState = (): RepositoryState => {
  const state = JSON.parse(JSON.stringify(initialRepositoryState));
  state.commits.push({
    hash: 'a1b2c3d',
    message: 'Initial commit',
    parents: [],
    branch: 'main',
    timestamp: Date.now() - 100000
  });
  state.HEAD = 'a1b2c3d';
  state.branches['main'] = 'a1b2c3d';
  return state;
};

// Scenario 1: Merge Conflict
const conflictState = createBaseState();
conflictState.branches['feature'] = 'f1e2d3c';
conflictState.commits.push({
  hash: 'm1a2i3n',
  message: 'Update index.html in main',
  parents: ['a1b2c3d'],
  branch: 'main',
  timestamp: Date.now() - 50000
});
conflictState.branches['main'] = 'm1a2i3n';
conflictState.HEAD = 'm1a2i3n';

conflictState.commits.push({
  hash: 'f1e2d3c',
  message: 'Update index.html in feature',
  parents: ['a1b2c3d'],
  branch: 'feature',
  timestamp: Date.now() - 40000
});

// Scenario 2: Interactive Rebase
const rebaseState = createBaseState();
rebaseState.commits.push({ hash: 'c1o2m3m', message: 'WIP: Feature part 1', parents: ['a1b2c3d'], branch: 'main', timestamp: Date.now() - 30000 });
rebaseState.commits.push({ hash: 'd4o5n6e', message: 'WIP: Feature part 2', parents: ['c1o2m3m'], branch: 'main', timestamp: Date.now() - 20000 });
rebaseState.commits.push({ hash: 'f7i8x9x', message: 'Fix typo', parents: ['d4o5n6e'], branch: 'main', timestamp: Date.now() - 10000 });
rebaseState.HEAD = 'f7i8x9x';
rebaseState.branches['main'] = 'f7i8x9x';

// Scenario 3: Cherry Pick
const cherryState = createBaseState();
cherryState.branches['hotfix'] = 'h0t1f2x';
cherryState.commits.push({
  hash: 'h0t1f2x',
  message: 'Critical bug fix',
  parents: ['a1b2c3d'],
  branch: 'hotfix',
  timestamp: Date.now() - 5000
});


export const advancedScenarios: AdvancedScenario[] = [
  {
    id: 'merge-conflict',
    title: 'マージコンフリクトの解決',
    difficulty: 'intermediate',
    description: '競合する変更を含むブランチをマージし、コンフリクトを解決します。',
    situation: 'mainブランチとfeatureブランチで、同じファイル（index.html）の同じ行を別々に変更してしまいました。featureブランチをmainに取り込む必要があります。',
    goal: 'featureブランチをマージし、コンフリクトを解決してコミットする',
    initialState: conflictState,
    tasks: [
      {
        id: 'task-1',
        instruction: 'featureブランチを現在のmainブランチにマージしてください',
        expectedCommand: 'git merge feature',
        hint: 'git merge <ブランチ名> を使います'
      },
      {
        id: 'task-2',
        instruction: 'コンフリクトが発生しました。エディタで修正したと仮定して、修正済みファイルをステージングしてください',
        expectedCommand: 'git add .',
        hint: 'コンフリクト解消後は git add で解決をマークします'
      },
      {
        id: 'task-3',
        instruction: 'マージを完了するためにコミットしてください',
        expectedCommand: 'git commit -m "Resolve merge conflict"',
        hint: '通常のコミットと同じです'
      }
    ],
    requiredCommands: ['merge', 'add', 'commit']
  },
  {
    id: 'interactive-rebase',
    title: 'コミット履歴の整理',
    difficulty: 'advanced',
    description: 'Interactive Rebaseを使って、細かいコミットを1つにまとめます。',
    situation: '機能開発中に "WIP" や "Fix typo" といった細かいコミットが続いてしまいました。これらをまとめてきれいな履歴にしたいです。',
    goal: '直近の3つのコミットを対話的リベースで整理する',
    initialState: rebaseState,
    tasks: [
      {
        id: 'task-1',
        instruction: '直近の3つのコミットを対話的リベースで編集してください',
        expectedCommand: 'git rebase -i HEAD~3',
        hint: 'HEAD~3 で3つ前まで指定します'
      }
    ],
    requiredCommands: ['rebase']
  },
  {
    id: 'cherry-pick',
    title: '特定のコミットだけ取り込む',
    difficulty: 'advanced',
    description: '別のブランチから、必要な修正コミットだけを現在のブランチに適用します。',
    situation: 'hotfixブランチで重要なバグ修正（コミットID: h0t1f2x）が行われました。この修正だけをmainブランチにも適用したいです。',
    goal: 'hotfixブランチの特定のコミットをmainに適用する',
    initialState: cherryState,
    tasks: [
      {
        id: 'task-1',
        instruction: 'hotfixブランチにある "Critical bug fix" (ID: h0t1f2x) を現在のブランチに適用してください',
        expectedCommand: 'git cherry-pick h0t1f2x',
        hint: 'コミットハッシュを指定して cherry-pick します'
      }
    ],
    requiredCommands: ['cherry-pick']
  },
  ...additionalScenarios.map(s => ({
    ...s,
    requiredCommands: s.tasks.map(t => t.expectedCommand.split(' ')[1])
  }))
];
