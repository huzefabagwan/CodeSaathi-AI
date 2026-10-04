export const DEFAULT_FILES = {
  "main.py": {
    name: "main.py",
    language: "python",
    content: `def calculate_average(numbers):
    # Potential Bug: Division by zero when list is empty
    total = sum(numbers)
    return total / len(numbers)

def find_max(numbers):
    if not numbers:
        return None
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

# Test zero division risk:
# print("Empty test:", calculate_average([]))
`,
    readOnly: false
  },
  "security_demo.py": {
    name: "security_demo.py",
    language: "python",
    content: `import os

def ping_host(host_address):
    # Security Risk: Direct system execution / command injection risk detected by Semgrep
    cmd = f"ping -c 1 {host_address}"
    return os.system(cmd)

def calculate_discount(price, discount_percent):
    try:
        return price - (price * (discount_percent / 100))
    except:
        # Code Smell: Bare except masks exceptions
        return None

if __name__ == "__main__":
    print("Testing Security Demo")
    ping_host("127.0.0.1")
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
    content: `# CodeSaathi AI 🚀
**Privacy-First, Local-First AI Pair Programming Assistant**

Powered by **Ollama + Qwen2.5-Coder:7b** and **Semgrep** static analysis.

## Key Capabilities
- 🟢 **100% Offline AI Inference**: All LLM processing runs strictly on your machine.
- 🛡️ **Semgrep Static Analysis**: Identifies security vulnerabilities and code smells locally.
- ⚡ **Combined AI Review**: Merges Semgrep AST findings with Qwen2.5-Coder reasoning.
- 💻 **Monaco Code Editor**: Professional IDE with syntax highlighting and diff inspection.
- ▶️ **Local Python Execution**: Run code locally in isolated execution with stdout/stderr capture.

## Demo Workflow
1. Select \`security_demo.py\` or \`main.py\`.
2. Click **"Debug"** or **"Security Review"** in the AI Assistant toolbar.
3. Open the **Code Review / Problems** tab to inspect Semgrep static findings.
4. Click **"Full AI Review"** for an end-to-end audit with explanations and corrected code!
`,
    readOnly: false
  }
};

export const AI_ACTIONS = [
  { id: "explain", label: "Explain", description: "Step-by-step logic breakdown", icon: "HelpCircle" },
  { id: "debug", label: "Debug", description: "Detect bugs and unhandled states", icon: "Bug" },
  { id: "find_bugs", label: "Find Bugs", description: "Deep audit for edge cases & pitfalls", icon: "Search" },
  { id: "fix_errors", label: "Fix Errors", description: "Provide verified corrected snippet", icon: "Wrench" },
  { id: "optimize", label: "Optimize", description: "Improve time & space complexity", icon: "Zap" },
  { id: "generate_tests", label: "Generate Tests", description: "Comprehensive unit test suite", icon: "CheckSquare" },
  { id: "security_review", label: "Security Review", description: "Check injection, secrets & vulnerabilities", icon: "ShieldAlert" },
  { id: "complexity_analysis", label: "Complexity", description: "Big-O runtime & space complexity", icon: "Activity" }
];
