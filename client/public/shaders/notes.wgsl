
// ==== FUNCTIONS ====
// functions look like this

fn negate(v: vec3f) -> vec3f 
{
    return -v;
}

// function entry points are functions followed by:
/*
    @vertex   (vertex shader)
    @fragment (fragment shader)
    @compute  (compute shader)

    The name of the entry point function MUST MATCH the name of variable entryPoint
    belonging to the pipeline object which this shader module is attached to
*/

// @must-use
// A function with a return typed may be marked with @must-use
// The return value of the function must be used for some purposes
// - larger expression, - assignment / declaration, - manage control flow
// when would this be useful?



// ==== TYPES ====
i32 xi; // signed, two's complement 32 bit int
// u32, f32 (iEEE-754 binary32 floating point num)
// bool


// abstract numerics???
// they allow for high-precision values to be computed for constant-expressions.
// These computations occur at compile time on the CPU
// Advanced topic. cover later.

// Vectors declared as follows:
// vec2<f32> vec3<u16> etc.

// Vector constructors:
// same as glsl

// MATRICES
// wgsl supports 2x2, 3x3 and 4x4
// WGSL matrices are column major 
// SYNTAX: mat2x2<f32>
// CTORS: mat2x2<u16>() inits a zero matrix of that size
//  column wise: matCxR<f32>(col0, col1, col2 ..);
// scalar wise: matCxR<f32>(c0r0, c0r1, etc.)


// Matrix multiplication
// * overloaded for matrices, vectors and scalars. 
// mat mul rules apply

// ARRAYS
// SYNTAX: array<T,N> (T = type, N = size) for fixed-size array
//         array<T> (T = type) for runtime sized array

// FIXED-SIZE:
// in most cases, N is a constant expression (exception is advanced)

// RUNTIME SIZED (Confusing)
// - Can only be used with STORAGE BUFFER resources
@group(0) @binding(0) var<storage> weights: array<f32>;

// Runtime Sized Array either covers the whole buffer or is the last member of a struct that
// describes whole buffer

// The element count is determined at runtime, it's as large as it can be while still fitting within the size of the buffer binding associated with the variable

// built in fucntion arrayLength can be used to get elem count

// Runtime sized arrays can be indexed but cant be passed around like ordinary values

// Where would I use a runtime sized array vs a fixed-size
// Who decides what the size of th earray is?

// STRUCTS
// just like C structures
// ctors in order of decalration and must match type
// no params => zero init


// ATOMICS (Advanced topics)
// helps you syncronise between different invocations executing a shader?
// What is an invocation?
// A: AN invocation is a single execution instance of a shader stage
// Each parallel thread executing your shader code is a seaprate 'invocation'

// Invocations share variables in workgroup, storage and uniform address sspaces. 
// Uniform buffers are read-only but storage buffers with read_write accesa nd workgroup variables can be read and written

// When invocations access shared vars, theyw ill race. 
// Accesses CONFLICT if at least one of them is a write

// Data race is when conflicting concurrent accesses to the same memory word
// Can avoid data races using atomics

// Using atomics, the system can guarantee, from the perspective of invocations, atomic accesses to a single memory word will occur as if they happened in SOME order (one after the other)

// Ordering is only consistnet with respect to a single word. When comparing the orderings for differnet words, it may appear that causality is violated.

/*

ATOMIC TYPES
- Atomic operations onl work on 32bit ints
- atomic<T> is an atomic type whee T is i32 or u32
- can only appear in the store type of a variable in workgroup or storage addres sspace
- not constructivle
*/

var<workgroup> item_sum: atomic<i32>;


// POINTERS
// Why would pointers be needed in a shader?
// only ofr passing a variable by reference into a function
// use when you want a function to operate on a variable that lives in a particular address space (var<workgroup> or var<storage>)

// SYNTAX:
// ptr<AS,T,AM>
// where AS == address space (storage, uniform, workgroup)
// T == type
// AM == access mode
// STORGE AS can be READ or READ_WRITE
// in other cases, dont write access modes


// same as C
// can use let a_particle = &particles[i] as a shorthand

// ==== EXPRESIONS ====

// three key phases in a shader's lifetime:
// 1. Shader Creation
// 2. Pipeline Creation
// 3. Shader Execution

// Each phase finalizaes the value of expression in certain categories 
