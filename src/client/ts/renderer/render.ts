async function start() {

    if(!navigator.gpu) {
        console.error("This browser does not support WebGPU");
        return;
    }

    const adapter: GPUAdapter | null = await navigator.gpu.requestAdapter();

    if(!adapter) {
        console.error("This browser supports WebGPU but it appears to be disabled");
        return;
    }

    const device = await adapter.requestDevice();

    device.lost.then( (info) => {
        console.error(`WebGPU device was lost: ${info.message}`);

        // destroyed => we intentionally destroyed the device
        if (info.reason !== 'destroyed') {
            start();
        }
    });

    main(device);
}

start();

function main(device: GPUDevice) {

    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    const context = canvas.getContext("webgpu") as GPUCanvasContext;

    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
    context.configure({
        device,
        format: presentationFormat,
    });
    
    const shaderModule = device.createShaderModule({
        label: 'triangle',
        code: /* wgsl */`

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

                var color = array<vec4f,3>(
                    vec4f(1,0,0,1),
                    vec4f(0,1,0,1),
                    vec4f(0,0,1,1),
                );

                var vsOut : VSout;
                vsOut.position = vec4f(pos[vertexIndex], 0.0, 1.0);
                vsOut.color = color[vertexIndex];

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
            targets: [{format: presentationFormat}],
        },
    }) as GPURenderPipeline;

    const renderPassDescriptor: GPURenderPassDescriptor = {
        label: 'triangle render pass',
        colorAttachments: [
            {
                view: null as unknown as GPUTextureView,
                clearValue: [0.3, 0.3, 0.3, 1],
                loadOp: 'clear',
                storeOp: 'store',
            },
        ],
    };

    function render() : void {
      
        if (!device) {
            console.error("WebGPU is not supported on this browser.");
            return;
        }

        let colorAttachment = renderPassDescriptor.colorAttachments[0];
        if (!colorAttachment) return;

        colorAttachment.view = context.getCurrentTexture().createView();

        const encoder: GPUCommandEncoder =
          device.createCommandEncoder({ label: "encoder" });

        const pass: GPURenderPassEncoder =
          encoder.beginRenderPass(renderPassDescriptor);

        pass.setPipeline(pipeline);
        pass.draw(3); // call vertex shader 3 times
        pass.end();

        const commandBuffer: GPUCommandBuffer = encoder.finish();

        device.queue.submit([commandBuffer]);

    }

    const observer = new ResizeObserver(entries => {
        for(const entry of entries) {
            const canvas = entry.target as HTMLCanvasElement;
            const width  = entry.contentBoxSize[0].inlineSize;
            const height = entry.contentBoxSize[0].blockSize;

            canvas.width  = Math.max(1, Math.min(width,  device.limits.maxTextureDimension2D));
            canvas.height = Math.max(1, Math.min(height, device.limits.maxTextureDimension2D));
        }
        render();
    });

    observer.observe(canvas);
}
