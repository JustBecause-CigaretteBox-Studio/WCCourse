/*
  用 electron-packager 在 Windows 上交叉打包 macOS（x64 / arm64）。
  由于 electron-builder 不支持在 Windows 上构建 macOS，这里单独处理。

  注意：macOS .app 内部包含符号链接，Windows 上的普通 zip 工具无法正确处理。
  这里使用 tar.gz 作为 macOS 分发包；在 macOS 本机上运行可用 electron-builder 生成 zip。
*/
const packager = require('electron-packager');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const appName = '野鸡动画编程课';
const outDir = path.join(__dirname, 'dist');

function toUnixPath(p) {
  return p.replace(/\\/g, '/');
}

function tarGzip(sourceDir, outFile) {
  // 先切换到父目录，避免 Windows 长路径/特殊字符问题
  const parent = path.dirname(sourceDir);
  const name = path.basename(sourceDir);
  const outRel = toUnixPath(path.relative(parent, outFile));
  execSync('tar -czf "' + outRel + '" "' + name + '"', { cwd: parent, stdio: 'inherit' });
}

async function buildMac(arch) {
  const appPaths = await packager({
    dir: __dirname,
    name: appName,
    platform: 'darwin',
    arch: arch,
    out: outDir,
    overwrite: true,
    asar: true,
    ignore: [
      /^\/node_modules($|\/)/,
      /^\/dist($|\/)/,
      /^\/build-mac\.js$/,
      /^\/package-lock\.json$/
    ]
  });

  const builtDir = appPaths[0];
  const zipName = '野鸡动画编程课-macOS-' + arch + '.tar.gz';
  const zipPath = path.join(outDir, zipName);

  if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

  // 用 tar.gz 打包，Windows 上能保留 .app 包的可执行结构
  tarGzip(builtDir, zipPath);

  // 删除中间文件夹，只保留压缩包
  fs.rmSync(builtDir, { recursive: true, force: true });

  console.log('✓ 已生成：', zipPath);
}

(async function () {
  try {
    await buildMac('x64');
    await buildMac('arm64');
    console.log('macOS 打包完成');
  } catch (e) {
    console.error('macOS 打包失败：', e);
    process.exit(1);
  }
})();
