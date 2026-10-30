#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, basename } from 'node:path';
import { execSync } from 'node:child_process';

const args = new Set(process.argv.slice(2));
const ROOT = process.cwd();
const WEB = join(ROOT, 'apps', 'web');
const results = [];
let currentGroup = '';

const toPosix = (p) => p.split('\\').join('/');
const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '');
const sizeOf = (p) => (existsSync(p) ? statSync(p).size : 0);

function group(name) {
  currentGroup = name;
  console.log(`\n=== ${name} ===`);
}

function report(status, message, hint) {
  results.push({ status, group: currentGroup, message });
  const tag = { pass: '[PASS]', fail: '[FAIL]', warn: '[WARN]' }[status];
  console.log(`${tag} ${message}`);
  if (hint && status !== 'pass') console.log(`       -> ${hint}`);
}

function ok(condition, message, hint, level = 'fail') {
  report(condition ? 'pass' : level, message, hint);
}

function sh(cmd, timeout = 120000) {
  try {
    const out = execSync(cmd, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout,
      maxBuffer: 50 * 1024 * 1024,
    });
    return { ok: true, out: out.trim() };
  } catch (e) {
    return { ok: false, out: String(e.stderr || e.stdout || e.message).trim() };
  }
}

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (['node_modules', '.next', '.git', 'dist', '.turbo'].includes(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function readJson(p) {
  try {
    return JSON.parse(read(p));
  } catch {
    return {};
  }
}

const pkg = readJson(join(WEB, 'package.json'));
const deps = { ...pkg.dependencies, ...pkg.devDependencies };
const hasDep = (name) => Boolean(deps[name]);

const sourceFiles = walk(WEB).filter((f) => /\.(tsx?|jsx?|mjs)$/.test(f));
const texts = new Map(sourceFiles.map((f) => [f, read(f)]));
const grep = (re) => sourceFiles.filter((f) => re.test(texts.get(f)));
const rel = (f) => toPosix(relative(ROOT, f));

const appDir = [join(WEB, 'src', 'app'), join(WEB, 'app')].find(existsSync);
const routes = appDir
  ? walk(appDir).map((raw) => ({
      raw,
      norm: toPosix(relative(appDir, raw))
        .split('/')
        .filter((s) => !/^\(.*\)$/.test(s))
        .join('/'),
    }))
  : [];
const findRoute = (re) => routes.find((r) => re.test(r.norm));

const VN_CHARS = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

group('Buổi 1 - Môi trường');
{
  const node = sh('node -v');
  const major = Number((node.out.match(/v(\d+)/) || [])[1] || 0);
  ok(node.ok && major >= 20, `Node.js đã cài (${node.out || 'không có'})`, 'Cài Node.js bản LTS (từ 20 trở lên)');
  const pnpm = sh('pnpm -v');
  ok(pnpm.ok, `pnpm đã cài (${pnpm.out.split('\n')[0] || 'không có'})`, 'Cài pnpm: npm i -g pnpm');
  const git = sh('git --version');
  ok(git.ok, `Git đã cài (${git.out || 'không có'})`, 'Cài Git');
  const docker = sh('docker -v');
  ok(docker.ok, `Docker đã cài (${docker.out || 'không có'})`, 'Cài Docker Desktop', 'warn');
}

group('Buổi 1 - Repo & Git');
{
  ok(existsSync(WEB), 'Có thư mục apps/web', 'Frontend phải nằm ở apps/web (monorepo)');
  ok(existsSync(join(ROOT, 'apps')) && existsSync(join(ROOT, 'apps', 'web', 'package.json')), 'apps/web có package.json', 'Khởi tạo Next.js ngay trong apps/web');

  const readme = join(ROOT, 'README.md');
  ok(sizeOf(readme) > 0, 'Có README.md và không để trống', 'Tạo README.md giới thiệu dự án, cách chạy, ảnh chụp màn hình');
  ok(sizeOf(join(ROOT, 'AGENTS.md')) > 0, 'Có AGENTS.md và không để trống', 'Tạo AGENTS.md cho OpenCode');

  const gitignoreText = read(join(ROOT, '.gitignore')) + '\n' + read(join(WEB, '.gitignore'));
  ok(gitignoreText.trim().length > 0, 'Có .gitignore và không để trống', 'Tạo .gitignore chuẩn');
  ok(/node_modules/.test(gitignoreText), '.gitignore đã bỏ qua node_modules', 'Thêm node_modules vào .gitignore');
  ok(/(^|\n)\s*\/?\.env/.test(gitignoreText), '.gitignore đã bỏ qua file .env', 'Thêm .env* vào .gitignore');

  const docsFiles = walk(join(ROOT, 'docs'));
  ok(docsFiles.length >= 2, `Thư mục /docs có ${docsFiles.length} file`, 'Lưu PRD và Architecture diagram vào /docs');
  ok(docsFiles.some((f) => /prd/i.test(basename(f))), 'Trong /docs có file tên chứa "prd"', 'Đặt tên file PRD dễ nhận ra, ví dụ docs/PRD.md', 'warn');
  ok(
    docsFiles.some((f) => /(arch|diagram|erd|kien)/i.test(basename(f))),
    'Trong /docs có file tên chứa "architecture" hoặc "diagram"',
    'Đặt tên file diagram dễ nhận ra, ví dụ docs/architecture.png',
    'warn',
  );

  const inGit = sh('git rev-parse --is-inside-work-tree');
  ok(inGit.ok, 'Thư mục này là một git repo', 'Chạy git init rồi push lên GitHub');
  if (inGit.ok) {
    const remote = sh('git remote -v');
    ok(/github\.com/.test(remote.out), 'Repo đã có remote trên GitHub', 'Thêm remote origin và push code lên GitHub');

    const tracked = sh('git ls-files').out.split('\n').filter(Boolean);
    const badTracked = tracked.filter(
      (f) => /(^|\/)node_modules\//.test(f) || /(^|\/)\.env(\.(?!example).+)?$/.test(f),
    );
    ok(badTracked.length === 0, 'Không commit node_modules hay .env', `Đang bị commit: ${badTracked.slice(0, 3).join(', ')}. Dùng git rm --cached để gỡ ra`);

    const CC = /^(feat|fix|docs|chore|refactor|style|test|build|ci|perf|revert)(\([^)]+\))?!?: .+/;
    const subjects = sh('git log --format=%s').out.split('\n').filter(Boolean).filter((s) => !/^Merge /.test(s));
    const badCommits = subjects.filter((s) => !CC.test(s));
    ok(subjects.length > 0, `Repo có ${subjects.length} commit`, 'Commit code của bạn lên');
    ok(
      badCommits.length === 0,
      'Tất cả commit theo Conventional Commits',
      `Có ${badCommits.length} commit chưa đúng chuẩn, ví dụ: "${badCommits[0]}"`,
    );

    const allSubjects = sh('git log --format=%s').out;
    ok(
      /Merge pull request|\(#\d+\)/.test(allSubjects),
      'Có dấu vết gộp nhánh bằng Pull Request',
      'Không thấy commit merge từ PR. Hãy làm trên nhánh feat/... rồi mở Pull Request vào main (TA sẽ xem lại trên GitHub)',
      'warn',
    );
  }

  const composeFile = ['docker-compose.yml', 'docker-compose.yaml', 'compose.yml', 'compose.yaml'].find((f) => existsSync(join(ROOT, f)));
  ok(Boolean(composeFile), `Có file docker compose (${composeFile || 'không thấy'})`, 'Viết docker-compose.yml cơ bản ở thư mục gốc');
  if (composeFile) {
    const cfg = sh('docker compose config -q');
    ok(cfg.ok, 'File docker compose hợp lệ (docker compose config)', cfg.out.split('\n')[0], 'warn');
    if (args.has('--docker')) {
      const up = sh('docker compose up -d', 300000);
      ok(up.ok, 'docker compose up -d chạy thành công', up.out.split('\n').slice(-3).join(' | '));
      sh('docker compose down', 120000);
    }
  }
}

group('Buổi 1 - Khung giao diện');
{
  const nextVer = deps.next || '';
  ok(/^[\^~]?16\./.test(nextVer), `Dùng Next.js 16 (đang là "${nextVer || 'chưa cài'}")`, 'Khởi tạo project bằng Next.js 16');
  ok(hasDep('tailwindcss'), 'Đã cài Tailwind CSS', 'Cài tailwindcss trong apps/web');
  ok(existsSync(join(WEB, 'components.json')), 'Đã cấu hình shadcn/ui (có components.json)', 'Chạy pnpm dlx shadcn@latest init trong apps/web');
  const has = (re) => walk(WEB).some((f) => re.test(toPosix(f)));
  ok(has(/components\/ui\/button\.(tsx|jsx)$/), 'Có component Button của shadcn/ui', 'Chạy pnpm dlx shadcn@latest add button');
  ok(has(/components\/ui\/card\.(tsx|jsx)$/), 'Có component Card của shadcn/ui', 'Chạy pnpm dlx shadcn@latest add card');
  ok(has(/header\.(tsx|jsx)$/i) || grep(/function\s+Header|const\s+Header/).length > 0, 'Có component Header', 'Tạo component Header cho layout khung', 'warn');
  ok(has(/footer\.(tsx|jsx)$/i) || grep(/function\s+Footer|const\s+Footer/).length > 0, 'Có component Footer', 'Tạo component Footer cho layout khung', 'warn');
  ok(Boolean(appDir) && Boolean(findRoute(/^layout\.(tsx|jsx|js)$/)), 'Có layout.tsx trong app/', 'Dựng layout khung trong app/layout.tsx');
  ok(Boolean(findRoute(/^page\.(tsx|jsx|js)$/)), 'Có trang Home (app/page.tsx)', 'Tạo app/page.tsx');
}

group('Buổi 2 - App Router & Giỏ hàng');
{
  const home = findRoute(/^page\.(tsx|jsx|js)$/);
  if (home) {
    const head = read(home.raw).slice(0, 400);
    const isClient = /^\s*(\/\/.*\n|\/\*[\s\S]*?\*\/\s*)*['"]use client['"]/.test(head);
    ok(!isClient, 'Trang chủ là Server Component (không có "use client")', 'Bỏ "use client" ở app/page.tsx, chỉ dùng ở component cần tương tác');
  }
  ok(Boolean(findRoute(/^restaurant\/\[[^\]]+\]\/page\.(tsx|jsx|js)$/)), 'Có route /restaurant/[id]', 'Tạo app/restaurant/[id]/page.tsx');
  ok(Boolean(findRoute(/(^|\/)loading\.(tsx|jsx|js)$/)), 'Có loading.tsx', 'Thêm loading.tsx');
  ok(Boolean(findRoute(/(^|\/)error\.(tsx|jsx|js)$/)), 'Có error.tsx', 'Thêm error.tsx');
  ok(Boolean(findRoute(/(^|\/)not-found\.(tsx|jsx|js)$/)), 'Có not-found (cho id không tồn tại)', 'Thêm not-found.tsx và gọi notFound() khi không có id');
  ok(grep(/notFound\s*\(/).length > 0, 'Có gọi notFound() khi id không tồn tại', 'Trang /restaurant/[id] cần gọi notFound() khi không tìm thấy nhà hàng', 'warn');
  ok(grep(/^\s*['"]use client['"]/m).length > 0, 'Có dùng "use client" ở component tương tác', 'Các component giỏ hàng, nút thêm món cần "use client"');

  const mock = sourceFiles.filter((f) => /\/(data|lib|mock)/.test(toPosix(f)) && /restaurantId/.test(texts.get(f)));
  const refs = mock.reduce((n, f) => n + (texts.get(f).match(/restaurantId/g) || []).length, 0);
  ok(mock.length > 0, 'Có mock data trong /data hoặc /lib', 'Tạo mock data có field restaurantId, imageUrl, price');
  ok(refs >= 15, `Mock data có khoảng ${refs} món (cần tối thiểu 3 nhà hàng x 5 món = 15)`, 'Bổ sung thêm món vào mock data', 'warn');

  ok(hasDep('zustand'), 'Đã cài Zustand', 'pnpm add zustand');
  ok(grep(/zustand\/middleware/).length > 0 && grep(/persist\s*\(/).length > 0, 'Cart Store dùng Zustand Persist', 'Bọc store bằng persist() từ zustand/middleware');
  const storeFiles = grep(/persist\s*\(/);
  const storeText = storeFiles.map((f) => texts.get(f)).join('\n');
  ok(
    /add/i.test(storeText) && /remove|delete/i.test(storeText) && /increase|decrease|increment|decrement|quantity/i.test(storeText),
    'Cart Store có các action thêm, xóa, tăng giảm số lượng',
    'Viết đủ action cho giỏ hàng',
    'warn',
  );
  ok(grep(/Drawer|Sheet/).length > 0, 'Có Cart Drawer (dùng Drawer hoặc Sheet)', 'Làm Cart Drawer để xem trước đơn', 'warn');
  ok(grep(/badge/i).length > 0, 'Có Floating cart badge', 'Làm badge hiển thị tổng số lượng', 'warn');
  ok(hasDep('sonner'), 'Đã cài Sonner', 'pnpm add sonner');
  ok(grep(/<Toaster/).length > 0, 'Đã gắn <Toaster /> của Sonner', 'Thêm <Toaster /> vào layout');
  ok(grep(/toast(\.\w+)?\s*\(/).length > 0, 'Có gọi toast() khi thêm/bớt món', 'Gọi toast() trong action thêm/bớt món', 'warn');
}

group('Buổi 3 - Checkout');
{
  ok(Boolean(findRoute(/^checkout\/page\.(tsx|jsx|js)$/)), 'Có trang /checkout', 'Tạo app/checkout/page.tsx');
  ok(hasDep('react-hook-form'), 'Đã cài React Hook Form', 'pnpm add react-hook-form');
  ok(hasDep('zod'), 'Đã cài Zod', 'pnpm add zod');
  ok(hasDep('@hookform/resolvers'), 'Đã cài @hookform/resolvers', 'pnpm add @hookform/resolvers');
  ok(grep(/useForm\s*[(<]/).length > 0 && grep(/zodResolver/).length > 0, 'Form dùng useForm kết hợp zodResolver', 'Gắn resolver: zodResolver(schema) vào useForm');

  const schemaFiles = grep(/z\.object\s*\(/);
  ok(schemaFiles.length > 0, 'Có Zod schema (z.object)', 'Viết schema cho form checkout');
  const phoneLike = schemaFiles.some((f) => /(phone|sdt|soDienThoai|so_dien_thoai)/i.test(texts.get(f)) && /\.regex\s*\(/.test(texts.get(f)));
  ok(phoneLike, 'Schema có kiểm tra số điện thoại bằng regex', 'Dùng z.string().regex(...) cho SĐT Việt Nam', 'warn');
  ok(schemaFiles.some((f) => VN_CHARS.test(texts.get(f))), 'Thông báo lỗi trong schema bằng tiếng Việt', 'Viết message tiếng Việt cho từng rule', 'warn');

  const hasMsw = hasDep('msw');
  const hasRoutes = routes.some((r) => /(^|\/)api\/.+\/route\.(ts|js)$/.test(r.norm));
  ok(hasMsw || hasRoutes, hasMsw ? 'Dùng MSW làm mock API' : 'Dùng Route Handler làm mock API', 'Dựng mock API bằng MSW hoặc Route Handler (app/api/.../route.ts)');
  ok(grep(/isSubmitting|isPending|loading/i).length > 0, 'Có xử lý trạng thái submit (spinner / disable nút)', 'Dùng formState.isSubmitting để hiện spinner và khóa nút', 'warn');
  ok(grep(/order.?(code|id)|ma.?don|mã đơn/i).length > 0, 'Có hiển thị mã đơn giả lập', 'Hiện mã đơn trên màn hình xác nhận', 'warn');
  ok(grep(/clear(Cart)?\s*\(|reset(Cart)?\s*\(|empty(Cart)?\s*\(/i).length > 0, 'Có xóa giỏ hàng sau khi đặt', 'Gọi action clearCart() sau khi submit thành công', 'warn');
}

group('Nộp bài');
{
  const readmeText = read(join(ROOT, 'README.md'));
  ok(/pnpm\s+(i|install)/.test(readmeText) && /pnpm\s+dev/.test(readmeText), 'README có cách chạy (pnpm i && pnpm dev)', 'Ghi rõ cách chạy trong README');
  ok(/!\[.*\]\(.+\)|<img /i.test(readmeText), 'README có ảnh chụp màn hình', 'Chèn ảnh chụp màn hình vào README', 'warn');
  ok(/server/i.test(readmeText) && /client/i.test(readmeText), 'README có giải thích Server / Client Component', 'Viết 2-3 dòng giải thích vì sao component nào là Server hay Client', 'warn');
}

if (args.has('--build')) {
  group('Build');
  const build = sh('pnpm -C apps/web build', 600000);
  ok(build.ok, 'pnpm build chạy thành công', build.out.split('\n').slice(-4).join(' | '));
}

const count = (s) => results.filter((r) => r.status === s).length;
const failed = count('fail');
console.log('\n=== Tổng kết ===');
console.log(`Đạt: ${count('pass')}   Cần sửa: ${failed}   Nên xem lại: ${count('warn')}`);
if (failed > 0) {
  console.log('\nCác mục cần sửa:');
  results.filter((r) => r.status === 'fail').forEach((r) => console.log(` - [${r.group}] ${r.message}`));
}

console.log(`
Cần tự kiểm tra bằng tay:
[ ] Mở trang chủ, bấm vào một nhà hàng thì sang đúng /restaurant/[id], có món kèm ảnh và giá
[ ] Gõ /restaurant/abc-khong-ton-tai thì hiện trang not-found, không bị crash
[ ] Thêm món thì badge đổi số ngay và có Toast, reload trang thì giỏ vẫn còn
[ ] Mở DevTools, kéo từ 375px lên Desktop thì layout không bị tràn ngang
[ ] Lighthouse Performance trên 85 (hoặc xem kết quả Lighthouse CI trên GitHub Actions)
[ ] Checkout: nhập sai họ tên, SĐT, địa chỉ thì có lỗi tiếng Việt dưới từng trường
[ ] SĐT 0901234567 hợp lệ, 12345 báo lỗi
[ ] Đặt hàng thấy spinner, rồi màn hình xác nhận có mã đơn, giỏ hàng được xóa
`);

process.exit(failed > 0 ? 1 : 0);
