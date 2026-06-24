
fn sdSphere(
    p: vec3<f32>,
    s: vec3<f32>,
    r: f32
    ) -> f32
{
    var d : f32 = length(p - s) - r;
    return d;
}

fn map(p: vec3<f32>) -> vec4<f32>
{
    let t : f32 = uniforms.time; 
    let s : f32 = sdSphere(p, vec3(cos(t),sin(t),0), 1.0);
    return vec4(s,0,0,0);
}

@vertex
fn vs_main(@builtin(vertex_index) idx: u32) -> @builtin(position) vec4<f32> {

    var pos = array<vec2<f32>, 3>(
        vec2<f32>(-1.0, -1.0),
        vec2<f32>( 3.0, -1.0),
        vec2<f32>(-1.0,  3.0),
    );

    return vec4<f32>(pos[idx], 0.0, 1.0);
}

struct Uniforms {
    resolution: vec2<f32>,
    time: f32,
    _padding: f32,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

@fragment
fn fs_main(@builtin(position) fragCoord: vec4<f32>) -> @location(0) vec4<f32> {

    // Initialization
    let uv : vec2<f32> = (fragCoord.xy * 2.0 - uniforms.resolution) / uniforms.resolution.y;
    let ro : vec3<f32> = vec3(0,0,-4); // ray origin
    let rd : vec3<f32> = normalize(vec3(uv, 1));  // ray direction
    var col : vec3<f32>; // final pixel color

    var t : f32 = 0; // total distance travelled

    // Raymarching
    for(var i = 0; i < 80; i++) {

        let p : vec3<f32> = ro + rd * t; // position along ray

        let d : vec4<f32> = map(p); // current distance to the scene

        if (d[0] < 0.001 || t > 100) { break; }

        t += d[0]; // "march" along the ray

    }

    col = vec3(t * 0.15);

    return vec4(col,1.0);
}