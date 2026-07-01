# XStreaming TV

这是基于 [Geocld/XStreaming](https://github.com/Geocld/XStreaming) 的 Android TV 版本，重点优化电视端遥控器体验，并修复无 XGPU 账号进入云游戏后界面卡死的问题。

> 本项目与 Microsoft、Xbox 没有关联。Xbox、Game Pass、xCloud 等商标归各自权利方所有。

## 主要功能

- 基于上游 XStreaming 2.9.0。
- 适配 Android TV 首页、云游戏、游戏详情、设置页的遥控器焦点体验。
- 新增液态玻璃风格焦点高亮。
- 进入云游戏前会先验证当前账号和地区是否拥有 xCloud / XGPU 权限。
- 如果账号没有 XGPU，或者当前地区没有 xCloud 权限，会弹出提示并停留在当前页面，不再进入卡死的云游戏界面。
- 修复 Gradle 依赖解析容易被 Sonatype snapshot 仓库 504 影响的问题。
- release 打包在没有本地正式签名文件时会自动使用 debug keystore 兜底，方便本地测试安装。

## 已验证

2026-07-01 使用 Android TV 模拟器 `Television_1080p` 验证：

- dev 构建可以安装并启动。
- prod release APK 可以安装并启动，不依赖 Metro。
- 没有出现 `Unable to load script` 红屏。
- 在设置里切换到韩国区后，点击云游戏入口。
- 当前账号没有 XGPU 时会弹出权限提示，不会卡死。

## 环境要求

- Node.js 20 或更新版本
- Yarn
- JDK 17
- Android SDK 34
- Android NDK 23.1.7779620

## 开发运行

安装依赖：

```sh
yarn
```

启动 Metro：

```sh
yarn start
```

安装 Android TV 开发包：

```sh
npx react-native run-android --variant devDebug --appId com.dev.xstreaming
```

## 打包 APK

打包生产 APK：

```sh
cd android
./gradlew assembleProdRelease
```

输出文件：

```text
android/app/build/outputs/apk/prod/release/app-prod-release.apk
```

如果没有配置本地正式签名，release APK 会使用 debug keystore 签名，方便测试安装。正式分发时请自己生成 keystore，并只在本地配置以下 Gradle 属性：

```properties
XSTREAMING_RELEASE_STORE_FILE=your-release-key.keystore
XSTREAMING_RELEASE_KEY_ALIAS=your-key-alias
XSTREAMING_RELEASE_STORE_PASSWORD=your-store-password
XSTREAMING_RELEASE_KEY_PASSWORD=your-key-password
```

不要把私钥文件或签名密码提交到 GitHub。

## 实现说明

云游戏入口会在跳转前使用当前 token 和默认云游戏地区发起一次轻量 session 探测。服务端拒绝账号或地区权限时，应用会取消 loading 并展示本地化提示，从而避免电视端停在无法恢复的云游戏加载页。

`@react-native/gradle-plugin` 的仓库过滤修复保存在 `patches/` 目录，安装依赖后会通过 `patch-package` 自动应用。

## 上游项目

本项目基于 [Geocld/XStreaming](https://github.com/Geocld/XStreaming)。原始移动端客户端、文档和许可证历史请参考上游仓库。

## License

MIT，见 [LICENSE](./LICENSE)。
