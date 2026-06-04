async function main() {
    const adapter = await navigator.gpu?.requestAdapter();
    const device = await adapter?.requestDevice();

    if (!device) {
        console.error("WebGPU is not supported on this browser.");
        return;
    }

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

main();