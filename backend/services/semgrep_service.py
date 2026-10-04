import os
import sys
import json
import shutil
import tempfile
import subprocess
from typing import Dict, Any, List, Optional

# Supported file extension mapping
EXT_MAP = {
    "python": ".py",
    "py": ".py",
    "javascript": ".js",
    "js": ".js",
    "jsx": ".jsx",
    "typescript": ".ts",
    "ts": ".ts",
    "tsx": ".tsx",
    "json": ".json",
    "html": ".html",
    "css": ".css",
    "c": ".c",
    "cpp": ".cpp",
    "go": ".go",
    "java": ".java",
    "ruby": ".rb",
    "php": ".php",
    "rust": ".rs"
}

# Path to local bundled rules
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOCAL_RULES_PATH = os.path.join(BASE_DIR, "rules", "local_rules.yaml")

class SemgrepService:
    def __init__(self):
        self._cached_status = None

    def _find_semgrep_binary(self) -> Optional[str]:
        """Locate semgrep executable across PATH, virtualenv, and conda Scripts."""
        # 1. Environment variable override
        env_override = os.getenv("SEMGREP_PATH")
        if env_override and os.path.exists(env_override):
            return env_override

        # 2. In current Python environment's Scripts or bin directory
        python_dir = os.path.dirname(sys.executable)
        candidates = [
            os.path.join(python_dir, "Scripts", "semgrep.exe"),
            os.path.join(python_dir, "Scripts", "semgrep"),
            os.path.join(python_dir, "bin", "semgrep"),
            os.path.join(python_dir, "semgrep.exe"),
            os.path.join(python_dir, "semgrep")
        ]
        for candidate in candidates:
            if os.path.exists(candidate):
                return candidate

        # 3. In PATH
        which_path = shutil.which("semgrep") or shutil.which("semgrep.exe")
        if which_path and os.path.exists(which_path):
            return which_path

        return None

    def get_status(self) -> Dict[str, Any]:
        """Check if Semgrep is installed and available."""
        semgrep_bin = self._find_semgrep_binary()
        if not semgrep_bin:
            return {
                "installed": False,
                "version": None,
                "path": None,
                "message": "Semgrep is not installed or not found in PATH. Install with: pip install semgrep"
            }

        try:
            res = subprocess.run(
                [semgrep_bin, "--version"],
                capture_output=True,
                text=True,
                timeout=15
            )
            version = res.stdout.strip() or res.stderr.strip()
            return {
                "installed": True,
                "version": version,
                "path": semgrep_bin,
                "message": f"Semgrep {version} ready for local static analysis"
            }
        except Exception as e:
            return {
                "installed": False,
                "version": None,
                "path": semgrep_bin,
                "message": f"Error testing Semgrep executable: {str(e)}"
            }

    def scan_code(self, code: str, language: str = "python", filename: str = "main.py") -> Dict[str, Any]:
        """
        Safely scans source code using Semgrep without executing the code.
        Returns parsed JSON findings.
        """
        if not code or not code.strip():
            return {
                "tool": "semgrep",
                "status": "success",
                "findings": [],
                "total_findings": 0,
                "message": "No code provided to scan."
            }

        semgrep_bin = self._find_semgrep_binary()
        if not semgrep_bin:
            return {
                "tool": "semgrep",
                "status": "unavailable",
                "findings": [],
                "total_findings": 0,
                "message": "Semgrep is not installed. Run 'pip install semgrep' to enable static analysis.",
                "setup_instructions": "pip install semgrep"
            }

        # Determine appropriate file extension
        ext = EXT_MAP.get(language.lower(), "")
        if not ext and "." in filename:
            ext = "." + filename.rsplit(".", 1)[-1]
        if not ext:
            ext = ".py"

        display_path = filename if filename else f"temp_snippet{ext}"

        temp_file_path = None
        try:
            with tempfile.NamedTemporaryFile(suffix=ext, mode="w", delete=False, encoding="utf-8") as temp_file:
                temp_file.write(code)
                temp_file_path = temp_file.name

            # Configure rules: First use local bundled rules for instantaneous offline execution
            config_args = []
            if os.path.exists(LOCAL_RULES_PATH):
                config_args.extend(["--config", LOCAL_RULES_PATH])
            else:
                config_args.extend(["--config", "auto"])

            cmd = [
                semgrep_bin,
                "scan",
                "--json",
                "--quiet",
                "--metrics=off",
                "--disable-version-check",
                *config_args,
                temp_file_path
            ]

            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=20
            )

            stdout = result.stdout.strip()
            findings: List[Dict[str, Any]] = []
            code_lines = code.split("\n")

            if stdout:
                try:
                    data = json.loads(stdout)
                    raw_results = data.get("results", [])
                    for match in raw_results:
                        extra = match.get("extra", {})
                        start = match.get("start", {})
                        end = match.get("end", {})
                        start_line = start.get("line", 1)
                        end_line = end.get("line", start_line)

                        raw_sev = extra.get("severity", "WARNING").upper()
                        if raw_sev not in ["ERROR", "WARNING", "INFO"]:
                            raw_sev = "WARNING"

                        # Extract exact code slice safely
                        snippet = ""
                        if 1 <= start_line <= len(code_lines):
                            slice_lines = code_lines[start_line - 1 : min(end_line, len(code_lines))]
                            snippet = "\n".join(slice_lines).strip()
                        if not snippet:
                            snippet = extra.get("lines", "").strip()

                        # Clean rule id
                        rule_id = match.get("check_id", "security-issue")
                        if rule_id.startswith("rules."):
                            rule_id = rule_id.replace("rules.", "")

                        findings.append({
                            "severity": raw_sev,
                            "rule_id": rule_id,
                            "message": extra.get("message", "Static analysis issue detected").strip(),
                            "line": start_line,
                            "end_line": end_line,
                            "column": start.get("col", 1),
                            "code": snippet,
                            "path": display_path
                        })
                except json.JSONDecodeError:
                    pass

            return {
                "tool": "semgrep",
                "status": "success",
                "findings": findings,
                "total_findings": len(findings),
                "message": f"Semgrep scan complete. Found {len(findings)} potential issue(s)."
            }

        except subprocess.TimeoutExpired:
            return {
                "tool": "semgrep",
                "status": "timeout",
                "findings": [],
                "total_findings": 0,
                "message": "Semgrep static analysis scan timed out after 20 seconds."
            }
        except Exception as e:
            return {
                "tool": "semgrep",
                "status": "error",
                "findings": [],
                "total_findings": 0,
                "message": f"Static analysis failed: {str(e)}"
            }
        finally:
            if temp_file_path and os.path.exists(temp_file_path):
                try:
                    os.remove(temp_file_path)
                except Exception:
                    pass

semgrep_service = SemgrepService()
