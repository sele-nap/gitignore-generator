import readline from 'readline';

// ─── ANSI colors ──────────────────────────────────────────────────────────────

const c = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  cyan:   '\x1b[36m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  red:    '\x1b[31m',
  gray:   '\x1b[90m',
};

export const color = {
  boldCyan:  (s) => `${c.bold}${c.cyan}${s}${c.reset}`,
  boldGreen: (s) => `${c.bold}${c.green}${s}${c.reset}`,
  green:     (s) => `${c.green}${s}${c.reset}`,
  yellow:    (s) => `${c.yellow}${s}${c.reset}`,
  red:       (s) => `${c.red}${s}${c.reset}`,
  gray:      (s) => `${c.gray}${s}${c.reset}`,
};

// ─── Internal helpers ─────────────────────────────────────────────────────────

function clearLines(n) {
  process.stdout.write('\r\x1b[2K');
  for (let i = 1; i < n; i++) process.stdout.write('\x1b[1A\r\x1b[2K');
}

function rawMode(enable) {
  if (enable) {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
  } else {
    process.stdin.setRawMode(false);
    process.stdin.pause();
  }
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

export function spinner(text) {
  let i = 0;
  process.stdout.write('\x1b[?25l');
  const timer = setInterval(
    () => process.stdout.write(`\r${FRAMES[i++ % FRAMES.length]} ${text}`),
    80,
  );
  return {
    succeed(msg) {
      clearInterval(timer);
      process.stdout.write(`\r\x1b[2K${color.green('✔')} ${msg}\n`);
      process.stdout.write('\x1b[?25h');
    },
    fail(msg) {
      clearInterval(timer);
      process.stdout.write(`\r\x1b[2K${color.red('✖')} ${msg}\n`);
      process.stdout.write('\x1b[?25h');
    },
  };
}

// ─── Input prompt ─────────────────────────────────────────────────────────────

export function promptInput(message, defaultValue) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const hint = defaultValue ? ` ${c.gray}(${defaultValue})${c.reset}` : '';
    rl.question(`${c.cyan}?${c.reset} ${message}${hint}: `, (answer) => {
      rl.close();
      resolve(answer.trim() || defaultValue || '');
    });
  });
}

// ─── List prompt (single select) ──────────────────────────────────────────────

export function promptList(message, choices) {
  return new Promise((resolve) => {
    let cursor = 0;
    let lineCount = 0;

    function render() {
      const lines = [`${c.cyan}?${c.reset} ${message}`];
      for (let i = 0; i < choices.length; i++) {
        const active = i === cursor;
        const pointer = active ? `${c.cyan}❯${c.reset}` : ' ';
        const label   = active ? `${c.cyan}${choices[i].name}${c.reset}` : choices[i].name;
        lines.push(`${pointer} ${label}`);
      }
      if (lineCount > 0) clearLines(lineCount);
      process.stdout.write(lines.join('\n'));
      lineCount = lines.length;
    }

    process.stdout.write('\x1b[?25l');
    render();
    rawMode(true);

    function onKey(key) {
      if (key === '\x03') { cleanup(); process.exit(); }
      if      (key === '\x1b[A') { cursor = Math.max(0, cursor - 1); render(); }
      else if (key === '\x1b[B') { cursor = Math.min(choices.length - 1, cursor + 1); render(); }
      else if (key === '\r')     { cleanup(); process.stdout.write('\n'); resolve(choices[cursor].value); }
    }

    function cleanup() {
      process.stdin.removeListener('data', onKey);
      rawMode(false);
      process.stdout.write('\x1b[?25h');
    }

    process.stdin.on('data', onKey);
  });
}

// ─── Checkbox prompt (multi select) ───────────────────────────────────────────

export function promptCheckbox(message, choices, pageSize = 20) {
  return new Promise((resolve) => {
    const checked = new Set(choices.filter(c => c.checked).map(c => c.value));
    let cursor    = 0;
    let lineCount = 0;

    function render() {
      const lines = [`${c.cyan}?${c.reset} ${message}`];

      // Scrolling window centered on cursor
      const half  = Math.floor(pageSize / 2);
      let start   = Math.max(0, cursor - half);
      let end     = Math.min(choices.length, start + pageSize);
      if (end - start < pageSize) start = Math.max(0, end - pageSize);

      for (let i = start; i < end; i++) {
        const active    = i === cursor;
        const isChecked = checked.has(choices[i].value);
        const pointer   = active    ? `${c.cyan}❯${c.reset}` : ' ';
        const box       = isChecked ? `${c.green}◉${c.reset}` : '◯';
        lines.push(`${pointer}${box} ${choices[i].name}`);
      }

      if (choices.length > pageSize) {
        lines.push(color.gray(`(showing ${start + 1}–${end} of ${choices.length})`));
      }

      if (lineCount > 0) clearLines(lineCount);
      process.stdout.write(lines.join('\n'));
      lineCount = lines.length;
    }

    process.stdout.write('\x1b[?25l');
    render();
    rawMode(true);

    function onKey(key) {
      if (key === '\x03') { cleanup(); process.exit(); }

      if      (key === '\x1b[A') { cursor = Math.max(0, cursor - 1); render(); }
      else if (key === '\x1b[B') { cursor = Math.min(choices.length - 1, cursor + 1); render(); }
      else if (key === ' ') {
        const val = choices[cursor].value;
        checked.has(val) ? checked.delete(val) : checked.add(val);
        render();
      }
      else if (key === '\r') {
        const selected = choices.filter(ch => checked.has(ch.value)).map(ch => ch.value);
        if (selected.length === 0) return; // require at least one
        cleanup();
        process.stdout.write('\n');
        resolve(selected);
      }
    }

    function cleanup() {
      process.stdin.removeListener('data', onKey);
      rawMode(false);
      process.stdout.write('\x1b[?25h');
    }

    process.stdin.on('data', onKey);
  });
}
