export class Renderer {

    /* PROPERTIES */
    private clearColor: GPUColor = { r: 0.3, g: 0.3, b: 0.3, a: 1.0};

    /* CONSTRUCTOR */
    private constructor(
        private device: GPUDevice,
        private context: GPUCanvasContext,
        private presentationFormat: GPUTextureFormat,
        private depthTexture: GPUTexture,
    ) {}

    /* Static factory method */
    static async create(canvas: HTMLCanvasElement) : Promise<Renderer>
    {
        if(!navigator.gpu) 
            throw new Error("This browser does not support WebGPU");

        const adapter = await navigator.gpu.requestAdapter();

        if(!adapter) 
            throw new Error("This browser may support WebGPU but it appears to be disabled");

        const device = await adapter.requestDevice();

        device.lost.then( (info) => {
            throw new Error(`WebGPU device was lost ${info.message}`)
            // May need better handling in the future
        });

        const context = canvas.getContext("webgpu") as GPUCanvasContext;

        const presentationFormat = navigator.gpu.getPreferredCanvasFormat();

        context.configure({
            device,
            format: presentationFormat,
        });

        const depthTexture = device.createTexture({
            size: [canvas.width, canvas.height],
            format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });

        return new Renderer(device, context, presentationFormat, depthTexture);
    }

    /* METHODS */
    beginFrame(): { encoder: GPUCommandEncoder, pass: GPURenderPassEncoder}
    {
        const encoder = this.device.createCommandEncoder();

        const pass = encoder.beginRenderPass({
            label: 'Generic Render Pass',
            colorAttachments: [{
                view: this.context.getCurrentTexture().createView(),
                clearValue: this.clearColor,
                loadOp: 'clear',
                storeOp: 'store',
            }],

            depthStencilAttachment: {
                view: this.depthTexture,
                depthLoadOp: 'clear',
                depthStoreOp: 'store',
                depthClearValue: 1.0,
            },

        });

        return { encoder, pass };
    }

    endFrame(encoder: GPUCommandEncoder, pass: GPURenderPassEncoder): void
    {
        pass.end();
        this.device.queue.submit([encoder.finish()]);
    }

    createBuffer(size : number, usage: GPUBufferUsageFlags) : GPUBuffer
    {
        const buffer = this.device.createBuffer({
            size:  size,
            usage: usage | GPUBufferUsage.COPY_DST,
        });

        if(!buffer) throw new Error("Buffer error"); // handle gracefully

        return buffer;
    }

    writeBuffer(buffer: GPUBuffer, data: Float32Array | Uint16Array, offset = 0): void
    {
        if(!buffer) throw new Error("Buffer error");
        if(!data) throw new Error("Provided array was null");
        if(offset < 0 || offset + data.length > buffer.size) 
            throw new Error(`tried to write ${data.length} bytes at offset ${offset}`);

        this.device.queue.writeBuffer(buffer, offset, data);
    }

    createShader(shaderSourceText: string, label: string): GPUShaderModule
    // Assumes you have already extracted the shader source text
    {
        return this.device.createShaderModule({
            label: label,
            code: shaderSourceText,
        });
    }

    createPipeline(vs: GPUShaderModule, fs: GPUShaderModule, label: string) : GPURenderPipeline
    {
        const pipeline : GPURenderPipeline = this.device.createRenderPipeline({
            label: label,
            layout: 'auto',
            vertex: {
                module: vs,
            },
            fragment: {
                module: fs,
                targets: [{ format: this.presentationFormat }]
            },
            depthStencil: {
                format: "depth24plus",
                depthWriteEnabled: true,
                depthCompare: "less",
            },
        });

        return pipeline;
    }

    createBindGroup(layout: GPUBindGroupLayout, entries: Array<GPUBindGroupEntry>)
    {
        return this.device.createBindGroup({
            layout: layout,
            entries: entries
        });
    }

    /* GETTERS AND SETTERS */
    getDevice(): GPUDevice { return this.device; }
    getFormat(): GPUTextureFormat { return this.presentationFormat; }
    setClearColor(r: number, g: number, b: number, a: number = 1.0) : void 
    {
        this.clearColor = { r, g, b, a};
    }

}