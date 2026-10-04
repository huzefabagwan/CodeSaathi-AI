export const DEFAULT_FILES = {
  "main.py": {
    name: "main.py",
    language: "python",
    content: `def calculate_average(numbers):
    # Bug: Division by zero when list is empty
    total = sum(numbers)
    return total / len(numbers)

def find_max(numbers):
    if not numbers:
        return None
    # Potential improvement: use builtin max()
    highest = numbers[0]
    for num in numbers:
        if num > highest:
            highest = num
    return highest

scores = [82, 91, 76, 88]
print("--- CodeSaathi AI Demo ---")
print("Scores:", scores)
print("Average Score:", calculate_average(scores))
print("Highest Score:", find_max(scores))

# Try running with empty list to see error handling!
# print("Empty test:", calculate_average([]))
`,
    readOnly: false
  },
  "utils.py": {
    name: "utils.py",
    language: "python",
    content: `import math

def is_prime(n):
    """Check if a number is prime."""
    if n <= 1:
        return False
    for i in range(2, int(math.sqrt(n)) + 1):
        if n % i == 0:
            return False
    return True

def format_currency(amount, currency_symbol="$"):
    """Format float as currency string."""
    return f"{currency_symbol}{amount:,.2f}"
`,
    readOnly: false
  },
  "README.md": {
    name: "README.md",
    language: "markdown",
    content: `# Welcome to CodeSaathi AI 🚀

CodeSaathi is your **beginner-friendly, local-first AI coding workspace**. 

## Features
- 🌲 **Interactive Workspace Explorer**: Manage your project files easily.
- ⚡ **Monaco Code Editor**: Professional editing experience with syntax highlighting.
- 🤖 **Local AI Assistant**: Connected to your local Ollama model (no API key needed).
- 🐛 **Bug Detection & Fix Preview**: Inspect issues and apply AI solutions directly.
- ▶️ **Live Python Runner**: Run code and view outputs directly in the built-in terminal.

## Getting Started
1. Click **"Run"** at the top right of the editor to test Python execution.
2. Select text or ask questions in the **AI Assistant** panel on the right.
3. Click any **"Try Asking"** action chips like **"Find bugs"** to analyze your code!
`,
    readOnly: false
  },
  "tests/test_main.py": {
    name: "tests/test_main.py",
    language: "python",
    content: `from main import calculate_average, find_max

def test_calculate_average():
    assert calculate_average([10, 20, 30]) == 20.0

def test_find_max():
    assert find_max([5, 12, 3]) == 12
`,
    readOnly: false
  }
};

export const QUICK_PROMPTS = [
  { label: "Explain Code", prompt: "Explain this code step-by-step in simple terms for a beginner.", icon: "Sparkles" },
  { label: "Find Bugs", prompt: "Inspect this code for potential bugs, edge cases (like empty inputs), or security flaws.", icon: "Bug" },
  { label: "Fix Errors", prompt: "Check if there are any syntax or runtime errors and suggest clean fixes.", icon: "WandSparkles" },
  { label: "Improve Code", prompt: "Suggest improvements for code readability, performance, and Python best practices.", icon: "Check" },
  { label: "Generate Tests", prompt: "Write comprehensive unit tests for this code using pytest or unittest.", icon: "ShieldCheck" }
];
