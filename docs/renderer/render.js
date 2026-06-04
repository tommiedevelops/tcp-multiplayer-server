"use strict";
const rand = (min = 0, max = 1) => {
    if (min === undefined) {
        min = 0;
        max = 1;
    }
    else if (max === undefined) {
        max = min;
        min = 0;
    }
    return min + Math.random() * (max - min);
};
async function start() {
    if (!navigator.gpu) {
        console.error("This browser does not support WebGPU");
        return;
    }
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        console.error("This browser supports WebGPU but it appears to be disabled");
        return;
    }
    const device = await adapter.requestDevice();
    device.lost.then((info) => {
        console.error(`WebGPU device was lost: ${info.message}`);
        // destroyed => we intentionally destroyed the device
        if (info.reason !== 'destroyed') {
            start();
        }
    });
    main(device);
}
start();
function main(device) {
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

            struct Uniform {
                color: vec4f,
                scale: vec2f,
                offset: vec2f,                
            };

            @group(0) @binding(0) var<uniform> uni : Uniform;

            struct VSout {
                @builtin(position) position: vec4f,
                @location(0) color: vec4f,
            };

            @vertex fn vs(
                @builtin(vertex_index) vertexIndex : u32
            ) -> VSout {

                let pos = array(
                    vec2f( 0.0, 0.5 ), // top center
                    vec2f(-0.5, -0.5), // bottom left
                    vec2f( 0.5, -0.5)  // bottom right
                );

                var vsOut : VSout;

                vsOut.position = vec4f(
                    pos[vertexIndex] * uni.scale + uni.offset, 0.0, 1.0
                );

                vsOut.color = uni.color;

                return vsOut;
            }
        

        @fragment fn fs(fsIn: VSout) -> @location(0) vec4f {
            let grid = vec2u(fsIn.position.xy) / 8;
            let checker = (grid.x + grid.y) % 2 == 1;

            let black = vec4f(0,0,0,0);

            return select(fsIn.color, black, checker);
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
    const uniformBufferSize = 4 * 4 + // color is 4 32bit floats (4bytes each)
        2 * 4 + // scale is 2 32bit floats (4bytes each)
        2 * 4; // offset is 2 32bit floats (4bytes each)
    const kColorOffset = 0;
    const kScaleOffset = 4;
    const kOffsetOffset = 6;
    const kNumObjects = 100;
    const objectInfos = [];
    for (let i = 0; i < kNumObjects; ++i) {
        const uniformBuffer = device.createBuffer({
            label: `uniforms for obj: ${i}`,
            size: uniformBufferSize,
            // TS will error below if @webgpu/types not installed
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        const uniformValues = new Float32Array(uniformBufferSize / 4);
        uniformValues.set([rand(), rand(), rand(), 1], kColorOffset);
        uniformValues.set([rand(-0.9, 0.9), rand(-0.9, 0.9)], kOffsetOffset);
        const bindGroup = device.createBindGroup({
            label: `bind group for obj ${i}`,
            layout: pipeline.getBindGroupLayout(0),
            entries: [{ binding: 0, resource: uniformBuffer }],
        });
        objectInfos.push({
            scale: rand(0.2, 0.5),
            uniformBuffer,
            uniformValues,
            bindGroup,
        });
    }
    function render() {
        if (!device) {
            console.error("WebGPU is not supported on this browser.");
            return;
        }
        let colorAttachment = renderPassDescriptor.colorAttachments[0];
        if (!colorAttachment)
            return;
        colorAttachment.view = context.getCurrentTexture().createView();
        const encoder = device.createCommandEncoder({ label: "encoder" });
        const pass = encoder.beginRenderPass(renderPassDescriptor);
        pass.setPipeline(pipeline);
        const aspect = canvas.width / canvas.height;
        for (const { scale, bindGroup, uniformBuffer, uniformValues } of objectInfos) {
            uniformValues.set([scale / aspect, scale], kScaleOffset);
            device.queue.writeBuffer(uniformBuffer, 0, uniformValues);
            pass.setBindGroup(0, bindGroup);
            pass.draw(3);
        }
        pass.end();
        const commandBuffer = encoder.finish();
        device.queue.submit([commandBuffer]);
    }
    const observer = new ResizeObserver(entries => {
        for (const entry of entries) {
            const canvas = entry.target;
            if (!entry.contentBoxSize[0])
                continue;
            const width = entry.contentBoxSize[0].inlineSize;
            const height = entry.contentBoxSize[0].blockSize;
            canvas.width = Math.max(1, Math.min(width, device.limits.maxTextureDimension2D));
            canvas.height = Math.max(1, Math.min(height, device.limits.maxTextureDimension2D));
        }
        render();
    });
    observer.observe(canvas);
}
