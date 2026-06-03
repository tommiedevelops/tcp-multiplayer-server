"use strict";
async function main() {
    const adapter = await navigator.gpu?.requestAdapter();
    const device = await adapter?.requestDevice();
    if (!device) {
        console.error("WebGPU is not supported on this browser.");
        return;
    }
    const canvas = document.querySelector("canvas");
    const context = canvas.getContext("webgpu");
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
    context.configure({
        device,
        format: presentationFormat,
    });
    const shaderModule = device.createShaderModule({
        label: 'triangle',
        code: /* wgsl */ `
            @vertex fn vs(
                @builtin(vertex_index) vertexIndex : u32
            ) -> @builtin(position) vec4f {
                let pos = array(
                    vec2f( 0.0, 0.5 ), // top center
                    vec2f(-0.5, -0.5), // bottom left
                    vec2f( 0.5, -0.5)  // bottom right
                );

                return vec4f(pos[vertexIndex], 0.0, 1.0);
            }
        

        @fragment fn fs() -> @location(0) vec4f {
            return vec4f(1.0, 0.0, 0.0, 1.0); 
        }
      `,
    });
    const pipeline = device.createRenderPipeline({
        label: 'triangle pipeline',
        layout: 'auto',
        vertex: {
            entryPoint: 'vs',
            module: shaderModule,
        },
        fragment: {
            entryPoint: 'fs',
            module: shaderModule,
            targets: [{ format: presentationFormat }],
        },
    });
    const renderPassDescriptor = {
        label: 'triangle render pass',
        colorAttachments: [
            {
                view: null,
                clearValue: [0.3, 0.3, 0.3, 1],
                loadOp: 'clear',
                storeOp: 'store',
            },
        ],
    };
    function render() {
        if (renderPassDescriptor.colorAttachments[0] !== null) {
            renderPassDescriptor
                .colorAttachments[0]
                .view = context.getCurrentTexture().createView();
            const encoder = device.createCommandEncoder({ label: 'encoder' });
            const pass = encoder.beginRenderPass(renderPassDescriptor);
            pass.setPipeline(pipeline);
            pass.draw(3); // call vertex shader 3 times
            pass.end();
            const commandBuffer = encoder.finish();
            device.queue.submit([commandBuffer]);
        }
    }
    render();
}
main();
