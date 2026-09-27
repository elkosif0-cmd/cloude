#!/usr/bin/env python3
"""
ChatGPT Computer Control — التحكم بالكمبيوتر عن طريق ChatGPT

يأخذ لقطة شاشة، يرسلها إلى نموذج OpenAI مع وصف المهمة، والنموذج يرد بأوامر
(تحريك الماوس، نقر، كتابة، اختصارات لوحة المفاتيح، تمرير، ...) ينفذها هذا
البرنامج على جهازك، ثم يأخذ لقطة جديدة ويكرر حتى تنتهي المهمة.

الاستخدام:
    python agent.py "افتح المتصفح وابحث عن سعر الذهب اليوم"
    python agent.py                # وضع المحادثة: اكتب المهام واحدة تلو الأخرى

الأمان:
    - حرّك الماوس بسرعة إلى أي زاوية من زوايا الشاشة لإيقاف البرنامج فوراً.
    - Ctrl+C في الطرفية يوقف البرنامج.
    - الخيار --confirm يطلب موافقتك قبل تنفيذ كل أمر.
"""

import argparse
import base64
import io
import json
import os
import platform
import subprocess
import sys
import time

try:
    import pyautogui
    import pyperclip
    from openai import OpenAI
    from PIL import Image, ImageGrab
except ImportError as e:
    sys.exit(f"مكتبة ناقصة: {e.name}\nثبّت المتطلبات: pip install -r requirements.txt")

try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    pass

pyautogui.FAILSAFE = True  # الماوس في زاوية الشاشة = إيقاف فوري
pyautogui.PAUSE = 0.15

MAX_SCREENSHOT_WIDTH = 1280  # نصغّر اللقطة لتوفير التكلفة، ثم نعيد الإحداثيات للحجم الحقيقي
KEEP_SCREENSHOTS = 3  # عدد اللقطات الأخيرة التي تبقى في المحادثة

SYSTEM_PROMPT = """You are an agent that controls the user's computer ({os}) through tools.
After every action you receive a fresh screenshot of the screen ({w}x{h} pixels).
Coordinates you pass to tools are pixels in THAT screenshot (x from left, y from top).

Rules:
- Look at the screenshot carefully before each action; click the center of elements.
- Prefer keyboard shortcuts when they are reliable (e.g. open apps via the OS launcher).
- Do one or a few actions, then check the new screenshot to confirm the result.
- Never enter passwords, payment details, or delete files unless the user explicitly asked.
- When the task is complete (or impossible), call `done` with a short summary in the user's language.
- The user may write in Arabic; reply in Arabic when they do."""

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "mouse_move",
            "description": "Move the mouse pointer to (x, y).",
            "parameters": {
                "type": "object",
                "properties": {"x": {"type": "integer"}, "y": {"type": "integer"}},
                "required": ["x", "y"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "click",
            "description": "Click at (x, y).",
            "parameters": {
                "type": "object",
                "properties": {
                    "x": {"type": "integer"},
                    "y": {"type": "integer"},
                    "button": {"type": "string", "enum": ["left", "right", "middle"], "default": "left"},
                    "clicks": {"type": "integer", "description": "1 = single, 2 = double click", "default": 1},
                },
                "required": ["x", "y"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "drag",
            "description": "Press the left button at (x1, y1), drag to (x2, y2) and release.",
            "parameters": {
                "type": "object",
                "properties": {
                    "x1": {"type": "integer"},
                    "y1": {"type": "integer"},
                    "x2": {"type": "integer"},
                    "y2": {"type": "integer"},
                },
                "required": ["x1", "y1", "x2", "y2"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "scroll",
            "description": "Scroll the mouse wheel at (x, y). Positive amount = up, negative = down.",
            "parameters": {
                "type": "object",
                "properties": {
                    "x": {"type": "integer"},
                    "y": {"type": "integer"},
                    "amount": {"type": "integer", "description": "Wheel notches, e.g. -5 to scroll down"},
                },
                "required": ["x", "y", "amount"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "type_text",
            "description": "Type text at the current keyboard focus (supports Arabic and any Unicode).",
            "parameters": {
                "type": "object",
                "properties": {
                    "text": {"type": "string"},
                    "press_enter": {"type": "boolean", "default": False},
                },
                "required": ["text"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "press_keys",
            "description": (
                "Press a key or a key combination together, e.g. ['enter'], ['ctrl','c'], "
                "['alt','tab'], ['win'], ['command','space']. Key names follow pyautogui."
            ),
            "parameters": {
                "type": "object",
                "properties": {"keys": {"type": "array", "items": {"type": "string"}}},
                "required": ["keys"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "run_command",
            "description": "Run a shell command on the computer and return its output (only when --allow-shell is on).",
            "parameters": {
                "type": "object",
                "properties": {"command": {"type": "string"}},
                "required": ["command"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "wait",
            "description": "Wait for the screen to update (e.g. a page loading).",
            "parameters": {
                "type": "object",
                "properties": {"seconds": {"type": "number", "default": 1.5}},
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "done",
            "description": "Finish the task and report the result to the user.",
            "parameters": {
                "type": "object",
                "properties": {"summary": {"type": "string"}},
                "required": ["summary"],
            },
        },
    },
]


class Screen:
    """يلتقط الشاشة ويحوّل الإحداثيات بين حجم اللقطة المصغّرة والحجم الحقيقي."""

    def __init__(self):
        self.real_w, self.real_h = pyautogui.size()
        self.scale = min(1.0, MAX_SCREENSHOT_WIDTH / self.real_w)
        self.w = int(self.real_w * self.scale)
        self.h = int(self.real_h * self.scale)

    def capture_b64(self) -> str:
        try:
            img = ImageGrab.grab()  # يعمل على ويندوز وماك ولينكس (X11) بدون أدوات إضافية
        except Exception:
            img = pyautogui.screenshot()
        # على شاشات Retina/HiDPI تكون اللقطة أكبر من pyautogui.size()، فنوحّدها
        img = img.resize((self.w, self.h), Image.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, format="PNG", optimize=True)
        return base64.b64encode(buf.getvalue()).decode()

    def to_real(self, x, y):
        rx = int(round(x / self.scale))
        ry = int(round(y / self.scale))
        rx = max(0, min(self.real_w - 1, rx))
        ry = max(0, min(self.real_h - 1, ry))
        return rx, ry


def type_unicode(text: str):
    """pyautogui لا يكتب العربية، لذا نلصق عبر الحافظة عند وجود أحرف غير لاتينية."""
    if text.isascii():
        pyautogui.write(text, interval=0.01)
        return
    old = None
    try:
        old = pyperclip.paste()
    except Exception:
        pass
    pyperclip.copy(text)
    paste_mod = "command" if platform.system() == "Darwin" else "ctrl"
    pyautogui.hotkey(paste_mod, "v")
    time.sleep(0.2)
    if old is not None:
        try:
            pyperclip.copy(old)
        except Exception:
            pass


def execute(name: str, args: dict, screen: Screen, allow_shell: bool) -> str:
    if name == "mouse_move":
        x, y = screen.to_real(args["x"], args["y"])
        pyautogui.moveTo(x, y, duration=0.25)
        return f"moved to ({args['x']},{args['y']})"

    if name == "click":
        x, y = screen.to_real(args["x"], args["y"])
        pyautogui.click(x, y, clicks=int(args.get("clicks", 1)), interval=0.1, button=args.get("button", "left"))
        return f"clicked ({args['x']},{args['y']})"

    if name == "drag":
        x1, y1 = screen.to_real(args["x1"], args["y1"])
        x2, y2 = screen.to_real(args["x2"], args["y2"])
        pyautogui.moveTo(x1, y1, duration=0.2)
        pyautogui.dragTo(x2, y2, duration=0.6, button="left")
        return "dragged"

    if name == "scroll":
        x, y = screen.to_real(args["x"], args["y"])
        pyautogui.moveTo(x, y, duration=0.15)
        # ويندوز يحسب النقرة الواحدة للعجلة 120 وحدة، ولينكس وماك نقرة = وحدة
        notch = 120 if platform.system() == "Windows" else 1
        pyautogui.scroll(int(args["amount"]) * notch)
        return f"scrolled {args['amount']}"

    if name == "type_text":
        type_unicode(args["text"])
        if args.get("press_enter"):
            pyautogui.press("enter")
        return "typed"

    if name == "press_keys":
        keys = [k.lower() for k in args["keys"]]
        if len(keys) == 1:
            pyautogui.press(keys[0])
        else:
            pyautogui.hotkey(*keys)
        return f"pressed {'+'.join(keys)}"

    if name == "run_command":
        if not allow_shell:
            return "ERROR: shell commands are disabled. Use the mouse and keyboard instead."
        try:
            out = subprocess.run(args["command"], shell=True, capture_output=True, text=True, timeout=60)
            return (f"exit={out.returncode}\n{out.stdout}\n{out.stderr}")[-4000:]
        except subprocess.TimeoutExpired:
            return "ERROR: command timed out after 60s"

    if name == "wait":
        time.sleep(min(float(args.get("seconds", 1.5)), 10))
        return "waited"

    return f"ERROR: unknown tool {name}"


def screenshot_message(screen: Screen, note: str = "Current screen:") -> dict:
    return {
        "role": "user",
        "content": [
            {"type": "text", "text": note},
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{screen.capture_b64()}", "detail": "high"}},
        ],
    }


def prune_old_screenshots(messages: list):
    """نحذف اللقطات القديمة من المحادثة لتقليل التكلفة ونُبقي آخر KEEP_SCREENSHOTS فقط."""
    seen = 0
    for msg in reversed(messages):
        if msg.get("role") != "user" or not isinstance(msg.get("content"), list):
            continue
        has_image = any(p.get("type") == "image_url" for p in msg["content"])
        if not has_image:
            continue
        seen += 1
        if seen > KEEP_SCREENSHOTS:
            msg["content"] = [p for p in msg["content"] if p.get("type") != "image_url"] + [
                {"type": "text", "text": "[older screenshot removed]"}
            ]


def ask_confirm(name: str, args: dict) -> bool:
    ans = input(f"   ⟵ تنفيذ {name} {json.dumps(args, ensure_ascii=False)}؟ [Enter=نعم / n=لا] ").strip().lower()
    return ans not in ("n", "no", "لا")


def run_task(client: OpenAI, model: str, task: str, messages: list, screen: Screen, opts) -> None:
    messages.append({"role": "user", "content": f"Task: {task}"})
    messages.append(screenshot_message(screen))

    for step in range(1, opts.max_steps + 1):
        prune_old_screenshots(messages)
        resp = client.chat.completions.create(model=model, messages=messages, tools=TOOLS)
        msg = resp.choices[0].message
        messages.append(msg.model_dump(exclude_none=True))

        if msg.content:
            print(f"🤖 {msg.content}")

        if not msg.tool_calls:
            # النموذج رد بنص فقط (سؤال أو توضيح) — نعيد المبادرة للمستخدم
            return

        finished = False
        for call in msg.tool_calls:
            name = call.function.name
            try:
                args = json.loads(call.function.arguments or "{}")
            except json.JSONDecodeError:
                args = {}

            if name == "done":
                print(f"✅ {args.get('summary', 'تمت المهمة')}")
                result = "ok"
                finished = True
            else:
                print(f"[{step}] {name} {json.dumps(args, ensure_ascii=False)}")
                if opts.confirm and not ask_confirm(name, args):
                    result = "User rejected this action. Choose a different approach or ask the user."
                else:
                    try:
                        result = execute(name, args, screen, opts.allow_shell)
                    except pyautogui.FailSafeException:
                        raise
                    except Exception as e:  # نعيد الخطأ للنموذج ليصحح نفسه
                        result = f"ERROR: {e}"

            messages.append({"role": "tool", "tool_call_id": call.id, "content": result})

        if finished:
            return

        time.sleep(opts.delay)
        messages.append(screenshot_message(screen, "Screen after your actions:"))

    print(f"⚠️ توقفت بعد {opts.max_steps} خطوة. زد العدد بـ --max-steps إن لزم.")


def main():
    parser = argparse.ArgumentParser(description="التحكم بالكمبيوتر عن طريق ChatGPT")
    parser.add_argument("task", nargs="*", help="المهمة المطلوبة (اتركها فارغة لوضع المحادثة)")
    parser.add_argument("--model", default=os.getenv("OPENAI_MODEL", "gpt-4o"), help="نموذج OpenAI يدعم الصور والأدوات")
    parser.add_argument("--max-steps", type=int, default=40)
    parser.add_argument("--delay", type=float, default=0.8, help="ثوانٍ قبل أخذ اللقطة بعد كل أمر")
    parser.add_argument("--confirm", action="store_true", help="اطلب موافقتي قبل كل أمر")
    parser.add_argument("--allow-shell", action="store_true", help="اسمح لـ ChatGPT بتشغيل أوامر الطرفية")
    opts = parser.parse_args()

    if not os.getenv("OPENAI_API_KEY"):
        sys.exit("ضع مفتاح OpenAI في المتغير OPENAI_API_KEY أو في ملف .env")

    client = OpenAI()
    screen = Screen()
    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT.format(os=platform.system(), w=screen.w, h=screen.h),
        }
    ]

    print(f"🖥️  الشاشة {screen.real_w}x{screen.real_h} — النموذج {opts.model}")
    print("🛑 للإيقاف الطارئ: حرّك الماوس بسرعة إلى زاوية الشاشة، أو Ctrl+C\n")

    try:
        if opts.task:
            run_task(client, opts.model, " ".join(opts.task), messages, screen, opts)
            return
        while True:
            task = input("\n📝 ماذا تريد أن أفعل؟ (exit للخروج): ").strip()
            if task.lower() in ("exit", "quit", "خروج"):
                break
            if task:
                run_task(client, opts.model, task, messages, screen, opts)
    except pyautogui.FailSafeException:
        print("\n🛑 إيقاف طارئ: الماوس وصل إلى زاوية الشاشة.")
    except KeyboardInterrupt:
        print("\n🛑 تم الإيقاف.")


if __name__ == "__main__":
    main()
