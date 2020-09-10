UltraVanilla dynmap proxy
===

A simple webserver to proxy connections to a Minecraft dynmap page, inject a header and implement various tools.

Features:

- Go to coordinates, paste in output of F3+C
- Copy coordinates in different formats
- Header with server-related links, server address, version
- Jump to spawn
- Shorter URL format that doesn't conflict with formatting codes when pasted into chat
- Go through nether portal (divides coordinates by 8 and vice versa)
- Crosshair showing coordinates at center of screen
- Distance measurement tool
- Configurable UI, hide things you don'tneed

Live demo: https://ultravanilla.world/

Building
---

`npm install` - **Install dependencies and compile everything**

`npm run build` - Compile typescript

`npm run build-ts` - Compile typescript

`npm run bundle` - Compile clientside javascript (must do `build-ts` first)

`npm run grab-vendor-assets` - Download fonts

---

`npm run watch-ts` - Automatically compile typescript as you edit

`npm run watch-bundle` - Automatically bundle every time you compile typescript

---

`npm run start` - **Run webserver on $PORT**

License
---

This source code is dual-licensed under choice of CC0 or MIT. See `LICENSE` and `LICENSE-MIT`

Includes modified source code from dynmap released under Apache v2 license - Copyright (c) 2020 Mikeprimm

**Contributing**

By making a contribution to this repository, I certify that:

- (a) The contribution was created in whole or in part by me and I have the right to submit it under the open source license indicated in the file; or

- (b) The contribution is based upon previous work that, to the best of my knowledge, is covered under an appropriate open source license and I have the right under that license to submit that work with modifications, whether created in whole or in part by me, under the same open source license (unless I am permitted to submit under a different license), as indicated in the file; or

- (c) The contribution was provided directly to me by some other person who certified (a), (b) or (c) and I have not modified it.

- I understand and agree that this project and the contribution are public and that a record of the contribution (including all personal information I submit with it, including my sign-off) is maintained indefinitely and may be redistributed consistent with this project or the open source license(s) involved.
