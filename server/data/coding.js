// Mock coding problems data — replace with PostgreSQL queries later

export const problems = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    topic: 'Arrays',
    companies: ['Google', 'Amazon'],
    acceptance: '72.5%',
    difficulty: 'Easy',
    solved: true,
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].' },
    ],
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9', 'Only one valid answer exists.'],
    starterCode: {
      javascript: `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    // Your code here\n};\n`,
      python: `class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        # Your code here\n        pass\n`,
      java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your code here\n    }\n}\n`,
    },
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    topic: 'Stacks',
    companies: ['Amazon', 'Bloomberg'],
    acceptance: '68%',
    difficulty: 'Easy',
    solved: false,
    description: `Given a string \`s\` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
- Open brackets must be closed by the same type of brackets.
- Open brackets must be closed in the correct order.
- Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      { input: 's = "()"', output: 'true', explanation: 'Valid parentheses' },
      { input: 's = "()[]{}"', output: 'true', explanation: 'Valid parentheses' },
      { input: 's = "(]"', output: 'false', explanation: 'Invalid parentheses' },
    ],
    constraints: ['1 <= s.length <= 10^4', 's consists of parentheses only'],
    starterCode: {
      javascript: `/**\n * @param {string} s\n * @return {boolean}\n */\nvar isValid = function(s) {\n    // Your code here\n};\n`,
      python: `class Solution:\n    def isValid(self, s: str) -> bool:\n        # Your code here\n        pass\n`,
      java: `class Solution {\n    public boolean isValid(String s) {\n        // Your code here\n    }\n}\n`,
    },
  },
  {
    id: 'longest-substring',
    title: 'Longest Substring Without Repeating Characters',
    topic: 'Strings',
    companies: ['Amazon', 'Google'],
    acceptance: '55%',
    difficulty: 'Medium',
    solved: false,
    description: `Given a string \`s\`, find the length of the longest substring without repeating characters.`,
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.' },
      { input: 's = "bbbbb"', output: '1', explanation: 'The answer is "b", with the length of 1.' },
    ],
    constraints: ['0 <= s.length <= 5 * 10^4', 's consists of English letters, digits, symbols and spaces.'],
    starterCode: {
      javascript: `/**\n * @param {string} s\n * @return {number}\n */\nvar lengthOfLongestSubstring = function(s) {\n    // Your code here\n};\n`,
      python: `class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        # Your code here\n        pass\n`,
      java: `class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Your code here\n    }\n}\n`,
    },
  },
  {
    id: 'maximum-subarray',
    title: 'Maximum Subarray',
    topic: 'Dynamic Programming',
    companies: ['Amazon', 'Microsoft'],
    acceptance: '62%',
    difficulty: 'Medium',
    solved: false,
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.`,
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6.' },
      { input: 'nums = [1]', output: '1', explanation: 'The subarray [1] has the largest sum 1.' },
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    starterCode: {
      javascript: `/**\n * @param {number[]} nums\n * @return {number}\n */\nvar maxSubArray = function(nums) {\n    // Your code here\n};\n`,
      python: `class Solution:\n    def maxSubArray(self, nums: List[int]) -> int:\n        # Your code here\n        pass\n`,
      java: `class Solution {\n    public int maxSubArray(int[] nums) {\n        // Your code here\n    }\n}\n`,
    },
  },
  {
    id: 'climbing-stairs',
    title: 'Climbing Stairs',
    topic: 'Dynamic Programming',
    companies: ['Amazon', 'Google'],
    acceptance: '78%',
    difficulty: 'Easy',
    solved: false,
    description: `You are climbing a staircase. It takes \`n\` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?`,
    examples: [
      { input: 'n = 2', output: '2', explanation: 'There are two ways to climb to the top: 1 step + 1 step, or 2 steps.' },
      { input: 'n = 3', output: '3', explanation: '1+1+1, 1+2, 2+1.' },
    ],
    constraints: ['1 <= n <= 45'],
    starterCode: {
      javascript: `/**\n * @param {number} n\n * @return {number}\n */\nvar climbStairs = function(n) {\n    // Your code here\n};\n`,
      python: `class Solution:\n    def climbStairs(self, n: int) -> int:\n        # Your code here\n        pass\n`,
      java: `class Solution {\n    public int climbStairs(int n) {\n        // Your code here\n    }\n}\n`,
    },
  },
  {
    id: 'number-of-islands',
    title: 'Number of Islands',
    topic: 'Graphs',
    companies: ['Amazon', 'Google'],
    acceptance: '58%',
    difficulty: 'Medium',
    solved: false,
    description: `Given an \`m x n\` 2D binary grid \`grid\` which represents a map of '1's (land) and '0's (water), return the number of islands.

An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.`,
    examples: [
      { input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', output: '1', explanation: 'One connected island.' },
    ],
    constraints: ['m == grid.length', 'n == grid[i].length', '1 <= m, n <= 300'],
    starterCode: {
      javascript: `/**\n * @param {character[][]} grid\n * @return {number}\n */\nvar numIslands = function(grid) {\n    // Your code here\n};\n`,
      python: `class Solution:\n    def numIslands(self, grid: List[List[str]]) -> int:\n        # Your code here\n        pass\n`,
      java: `class Solution {\n    public int numIslands(char[][] grid) {\n        // Your code here\n    }\n}\n`,
    },
  },
  {
    id: 'binary-tree-level-order',
    title: 'Binary Tree Level Order Traversal',
    topic: 'Trees',
    companies: ['Amazon', 'Facebook'],
    acceptance: '45%',
    difficulty: 'Medium',
    solved: false,
    description: `Given the \`root\` of a binary tree, return the level order traversal of its nodes' values (i.e., from left to right, level by level).`,
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]', explanation: 'Level by level traversal.' },
    ],
    constraints: ['The number of nodes in the tree is in the range [0, 2000].', '-1000 <= Node.val <= 1000'],
    starterCode: {
      javascript: `/**\n * @param {TreeNode} root\n * @return {number[][]}\n */\nvar levelOrder = function(root) {\n    // Your code here\n};\n`,
      python: `class Solution:\n    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:\n        # Your code here\n        pass\n`,
      java: `class Solution {\n    public List<List<Integer>> levelOrder(TreeNode root) {\n        // Your code here\n    }\n}\n`,
    },
  },
  {
    id: 'merge-k-sorted-lists',
    title: 'Merge K Sorted Lists',
    topic: 'Linked Lists',
    companies: ['Amazon', 'Microsoft'],
    acceptance: '38%',
    difficulty: 'Hard',
    solved: false,
    description: `You are given an array of \`k\` linked-lists \`lists\`, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.`,
    examples: [
      { input: 'lists = [[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]', explanation: 'Merged sorted list.' },
    ],
    constraints: ['k == lists.length', '0 <= k <= 10^4', '0 <= lists[i].length <= 500'],
    starterCode: {
      javascript: `/**\n * @param {ListNode[]} lists\n * @return {ListNode}\n */\nvar mergeKLists = function(lists) {\n    // Your code here\n};\n`,
      python: `class Solution:\n    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:\n        # Your code here\n        pass\n`,
      java: `class Solution {\n    public ListNode mergeKLists(ListNode[] lists) {\n        // Your code here\n    }\n}\n`,
    },
  },
  {
    id: 'lru-cache',
    title: 'LRU Cache',
    topic: 'Design',
    companies: ['Amazon', 'Google'],
    acceptance: '32%',
    difficulty: 'Hard',
    solved: false,
    description: `Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.

Implement the \`LRUCache\` class:
- \`LRUCache(int capacity)\` Initialize the LRU cache with positive size capacity.
- \`int get(int key)\` Return the value of the key if it exists, otherwise return -1.
- \`void put(int key, int value)\` Update or insert the value. If the number of keys exceeds capacity, evict the LRU key.`,
    examples: [
      { input: '["LRUCache","put","put","get","put","get","put","get","get","get"]\n[[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]', output: '[null,null,null,1,null,-1,null,-1,3,4]', explanation: 'LRU cache operations.' },
    ],
    constraints: ['1 <= capacity <= 3000', '0 <= key <= 10^4', '0 <= value <= 10^5'],
    starterCode: {
      javascript: `/**\n * @param {number} capacity\n */\nvar LRUCache = function(capacity) {\n    // Your code here\n};\n\nLRUCache.prototype.get = function(key) {\n    // Your code here\n};\n\nLRUCache.prototype.put = function(key, value) {\n    // Your code here\n};\n`,
      python: `class LRUCache:\n    def __init__(self, capacity: int):\n        pass\n\n    def get(self, key: int) -> int:\n        pass\n\n    def put(self, key: int, value: int) -> None:\n        pass\n`,
      java: `class LRUCache {\n    public LRUCache(int capacity) {\n    }\n\n    public int get(int key) {\n    }\n\n    public void put(int key, int value) {\n    }\n}\n`,
    },
  },
  {
    id: 'word-break',
    title: 'Word Break',
    topic: 'Dynamic Programming',
    companies: ['Google', 'Amazon'],
    acceptance: '48%',
    difficulty: 'Medium',
    solved: false,
    description: `Given a string \`s\` and a dictionary of strings \`wordDict\`, return \`true\` if \`s\` can be segmented into a space-separated sequence of one or more dictionary words.

Note that the same word in the dictionary may be reused multiple times in the segmentation.`,
    examples: [
      { input: 's = "leetcode", wordDict = ["leet","code"]', output: 'true', explanation: '"leetcode" can be segmented as "leet code".' },
      { input: 's = "applepenapple", wordDict = ["apple","pen"]', output: 'true', explanation: '"applepenapple" can be segmented as "apple pen apple".' },
    ],
    constraints: ['1 <= s.length <= 300', '1 <= wordDict.length <= 1000'],
    starterCode: {
      javascript: `/**\n * @param {string} s\n * @param {string[]} wordDict\n * @return {boolean}\n */\nvar wordBreak = function(s, wordDict) {\n    // Your code here\n};\n`,
      python: `class Solution:\n    def wordBreak(self, s: str, wordDict: List[str]) -> bool:\n        # Your code here\n        pass\n`,
      java: `class Solution {\n    public boolean wordBreak(String s, List<String> wordDict) {\n        // Your code here\n    }\n}\n`,
    },
  },
];

// In-memory submission store
const submissions = {};

export function getAllProblems() {
  return problems.map(({ starterCode, description, examples, constraints, ...p }) => p);
}

export function getProblemById(id) {
  return problems.find((p) => p.id === id) || null;
}

export function getSubmissionsForUser(userId) {
  return submissions[userId] || [];
}

export function saveSubmission(userId, sub) {
  if (!submissions[userId]) submissions[userId] = [];
  submissions[userId].unshift(sub);
  return sub;
}

export function markSolved(userId, problemId) {
  const prob = problems.find((p) => p.id === problemId);
  if (prob) prob.solved = true;
}
