# Battleships Web Game

A free, open-source 3D web game where you battle your friends in the ocean. [Demo here](https://tommiedevelops.github.io/battleships-web-game/)

## Demo
<div align="center">
<img src="docs/demo.png" width="800">
<p><em>
A render achieved through mouse movement and Microsoft Paint depicting how I would like the game
to eventually look. There will be an Fourier Transform ocean, destructible boats, realistic boat physics and,
importantly, the ability to play with your friends.
</em></p>
</div>

## Rough Milestones
**Client**    
[ ] Complete webgpufundamentals.org tutorial   
[ ] Load custom assets (mesh, textures)    
[ ] Add support for per-entity materials   
[ ] Render simple 3D scene    
[ ] Add toon shader   
[ ] Add more tasks here

[ ] (Later) FFT Ocean with TS and WGSL compute shaders

**Server**   
[ ] Simple TCP echo server (single client, get socket talking)   
[ ] Multi-client with poll()   
[ ] Simple chat server, handle disconnects cleanly    
[ ] Simple authoritative game server (reports Transform data)    
[ ] Add serialization for ECS    
[ ] Add more once done

**Shared**   
[ ] ECS Scene Manager   
[ ] Basic physics engine (Collision, Buoyancy, Movement)   
[ ] Procedural map generator (marching cube terrain)   
[ ] Core game logic (win/lose conditions, game loop, menus etc.)


## File Structure
- Code is broken up into Client, Server and Common (self explanatory)
- Client code contains CPP to be compiled to Web Assembly (thus no main.cpp) and typescript
- Server code is pure CPP
- Build will be through CMake, thus CMakeLists.txt present in CPP modules
- All build output will be in build/ which is .gitignored
- Anything in /docs is purely for demo purposes (github pages)
- Will add further details and build instructions soon
