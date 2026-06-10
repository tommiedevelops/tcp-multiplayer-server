export class Renderer {

    /* PROPERTIES */
    private clearColor: GPUColor = { r: 0.3, g: 0.3, b: 0.3, a: 1.0};

    /* CONSTRUCTOR */
    private constructor(
        private device: GPUDevice,
        private context: GPUCanvasContext,
        private format: GPUTextureFormat,
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

    createBuffer(data: Float32Array | Uint16Array, usage: GPUBufferUsageFlags) : GPUBuffer
    {
        const buffer = this.device.createBuffer({
            size: data.byteLength,
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

    createPipeline() : void /* Returns RenderPipeline */
    {}


    /* GETTERS AND SETTERS */
    getDevice(): GPUDevice { return this.device; }
    getFormat(): GPUTextureFormat { return this.format; }
    setClearColor(r: number, g: number, b: number, a: number = 1.0) : void 
    {
        this.clearColor = { r, g, b, a};
    }

}