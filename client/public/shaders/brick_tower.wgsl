
fn map(p: vec3<f32>) -> vec4<f32>
{
    var r : f32 = 1.0;
    var d : f32 = length(p) - r;
    return vec4(d, 0.0, 0.0, 0.0);
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

    let uv : vec2<f32> = (fragCoord.xy * 2.0 - uniforms.resolution) / uniforms.resolution.y;

    return vec4(uv,0.0,1.0);
}