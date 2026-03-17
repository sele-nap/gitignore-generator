import readline from 'readline';

interface AnsiCodes {
  bold:   string;
  cyan:   string;
  gray:   string;
  green:  string;
  red:    string;
  reset:  string;
  yellow: string;
}

export interface Choice {
  checked?: boolean;
  name:     string;
  value:    string;
}

export interface Spinner {
  fail(msg: string):    void;
  succeed(msg: string): void;
}

const c: AnsiCodes = {
  bold:   '\x1b[1m',
  cyan:   '\x1b[36m',
  gray:   '\x1b[90m',
  green:  '\x1b[32m',
  red:    '\x1b[31m',
  reset:  '\x1b[0m',
  yellow: '\x1b[33m',
};

export const color = {
  boldCyan:  (s: string) => `${c.bold}${c.cyan}${s}${c.reset}`,
  boldGreen: (s: string) => `${c.bold}${c.green}${s}${c.reset}`,
  gray:      (s: string) => `${c.gray}${s}${c.reset}`,
  green:     (s: string) => `${c.green}${s}${c.reset}`,
  red:       (s: string) => `${c.red}${s}${c.reset}`,
  yellow:    (s: string) => `${c.yellow}${s}${c.reset}`,
};

const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

function clearLines(n: number): void {
  process.stdout.write('\r\x1b[2K');
  for (let i = 1; i < n; i++) process.stdout.write('\x1b[1A\r\x1b[2K');
}

function rawMode(enable: boolean): void {
  if (enable) {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
  } else {
    process.stdin.setRawMode(false);
    process.stdin.pause();
  }
}

export function spinner(text: string): Spinner {
  let i = 0;
  process.stdout.write('\x1b[?25l');
  const timer = setInterval(
    () => process.stdout.write(`\r${FRAMES[i++ % FRAMES.length]} ${text}`),
    80,
  );
  return {
    fail(msg: string): void {
      clearInterval(timer);
      process.stdout.write(`\r\x1b[2K${color.red('✖')} ${msg}\n`);
      process.stdout.write('\x1b[?25h');
    },
    succeed(msg: string): void {
      clearInterval(timer);
      process.stdout.write(`\r\x1b[2K${color.green('✔')} ${msg}\n`);
      process.stdout.write('\x1b[?25h');
    },
  };
}

export function promptInput(message: string, defaultValue?: string): Promise<string> {
  return new Promise((resolve) => {
    const rl   = readline.createInterface({ input: process.stdin, output: process.stdout });
    const hint = defaultValue ? ` ${c.gray}(${defaultValue})${c.reset}` : '';
    rl.question(`${c.cyan}?${c.reset} ${message}${hint}: `, (answer) => {
      rl.close();
      resolve(answer.trim() || defaultValue || '');
    });
  });
}

export function promptList(message: string, choices: Choice[]): Promise<string> {
  return new Promise((resolve) => {
    let cursor    = 0;
    let lineCount = 0;

    function render(): void {
      const lines = [`${c.cyan}?${c.reset} ${message}`];
      for (let i = 0; i < choices.length; i++) {
        const active  = i === cursor;
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

    function onKey(key: string): void {
      if (key === '\x03')        { cleanup(); process.exit(); }
      if (key === '\x1b[A')      { cursor = Math.max(0, cursor - 1); render(); }
      else if (key === '\x1b[B') { cursor = Math.min(choices.length - 1, cursor + 1); render(); }
      else if (key === '\r')     { cleanup(); process.stdout.write('\n'); resolve(choices[cursor].value); }
    }

    function cleanup(): void {
      process.stdin.removeListener('data', onKey);
      rawMode(false);
      process.stdout.write('\x1b[?25h');
    }

    process.stdin.on('data', onKey);
  });
}

export function promptCheckbox(message: string, choices: Choice[], pageSize = 20): Promise<string[]> {
  return new Promise((resolve) => {
    const checked = new Set<string>(choices.filter(ch => ch.checked).map(ch => ch.value));
    let cursor    = 0;
    let lineCount = 0;

    function render(): void {
      const lines = [`${c.cyan}?${c.reset} ${message}`];
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

    function onKey(key: string): void {
      if (key === '\x03')        { cleanup(); process.exit(); }
      if (key === '\x1b[A')      { cursor = Math.max(0, cursor - 1); render(); }
      else if (key === '\x1b[B') { cursor = Math.min(choices.length - 1, cursor + 1); render(); }
      else if (key === ' ') {
        const val = choices[cursor].value;
        checked.has(val) ? checked.delete(val) : checked.add(val);
        render();
      } else if (key === '\r') {
        const selected = choices.filter(ch => checked.has(ch.value)).map(ch => ch.value);
        if (selected.length === 0) return;
        cleanup();
        process.stdout.write('\n');
        resolve(selected);
      }
    }

    function cleanup(): void {
      process.stdin.removeListener('data', onKey);
      rawMode(false);
      process.stdout.write('\x1b[?25h');
    }

    process.stdin.on('data', onKey);
  });
}
