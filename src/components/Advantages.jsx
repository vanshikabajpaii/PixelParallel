import './Advantages.css';

const ADVANTAGES = [
  {
    icon: '🚀',
    title: 'Faster Processing',
    body: 'For suitable workloads, SIMD processes multiple data elements per instruction, reducing the total number of instructions required and improving throughput.',
    accent: 'blue',
  },
  {
    icon: '📦',
    title: 'Efficient Large Datasets',
    body: 'SIMD excels when the same operation must be applied to large arrays of data — exactly the case in image and video processing with millions of pixels.',
    accent: 'cyan',
  },
  {
    icon: '📉',
    title: 'Reduced Instruction Overhead',
    body: 'Fewer instructions mean fewer fetch-decode-execute cycles, lower instruction cache pressure, and reduced CPU pipeline stalls for data-parallel workloads.',
    accent: 'purple',
  },
  {
    icon: '⚙️',
    title: 'Better Hardware Utilisation',
    body: 'Modern CPUs include dedicated vector processing units (SSE, AVX, NEON). SIMD instructions make full use of these wide execution units.',
    accent: 'blue',
  },
  {
    icon: '🖼️',
    title: 'Image & Video Processing',
    body: 'Brightness, contrast, filters, color conversion, resizing — all benefit from SIMD because every pixel in a region often receives the identical operation.',
    accent: 'cyan',
  },
  {
    icon: '🤖',
    title: 'ML & Scientific Computing',
    body: 'Matrix multiplications, dot products, and activation functions in neural networks are also data-parallel and heavily optimised with SIMD in frameworks like TensorFlow and PyTorch.',
    accent: 'purple',
  },
];

const LIMITATIONS = [
  {
    icon: '🔀',
    title: 'Requires Uniform Operations',
    body: 'SIMD is most effective when the same instruction applies to every element. Conditional branches per element (data-dependent control flow) break vectorisation.',
  },
  {
    icon: '🔁',
    title: 'Conditional Complexity',
    body: 'If different data elements need different operations (branches), masks or predication must be used, adding overhead and reducing the vectorisation benefit.',
  },
  {
    icon: '💾',
    title: 'Memory Bandwidth Bottleneck',
    body: 'Wide vector units can process data faster than memory can supply it. If the dataset does not fit in cache, memory bandwidth becomes the limiting factor.',
  },
  {
    icon: '🧩',
    title: 'Not All Algorithms Vectorise',
    body: 'Recursive algorithms, irregular data structures (linked lists, trees), and operations with loop-carried dependencies are difficult or impossible to vectorise efficiently.',
  },
];

function AdvCard({ icon, title, body, accent }) {
  return (
    <div className={`adv-card card accent-${accent}`}>
      <div className="adv-icon">{icon}</div>
      <h4>{title}</h4>
      <p>{body}</p>
    </div>
  );
}

function LimCard({ icon, title, body }) {
  return (
    <div className="lim-card card">
      <div className="lim-icon">{icon}</div>
      <div>
        <h4>{title}</h4>
        <p>{body}</p>
      </div>
    </div>
  );
}

export default function Advantages() {
  return (
    <section id="advantages" className="section section-alt">
      <div className="container">
        {/* Advantages */}
        <div className="section-header">
          <div className="section-tag">Why SIMD?</div>
          <h2>Advantages of SIMD</h2>
          <p>
            SIMD instruction sets are fundamental to high-performance computing for
            data-intensive workloads in image processing, video codecs, ML inference, and beyond.
          </p>
        </div>

        <div className="grid-3 adv-grid">
          {ADVANTAGES.map(a => <AdvCard key={a.title} {...a} />)}
        </div>

        {/* Limitations */}
        <div className="section-header" style={{ marginTop: '4rem', marginBottom: '1.75rem' }}>
          <div className="section-tag">Trade-offs</div>
          <h2>Limitations of SIMD</h2>
          <p>
            Like all architectural techniques, SIMD has scenarios where it is less
            effective or not applicable.
          </p>
        </div>

        <div className="lim-grid">
          {LIMITATIONS.map(l => <LimCard key={l.title} {...l} />)}
        </div>

        {/* Real-world examples */}
        <div className="adv-examples card" style={{ marginTop: '2.5rem' }}>
          <h3>Real-World SIMD Instruction Sets</h3>
          <div className="examples-row">
            <ExampleChip label="Intel SSE" desc="Streaming SIMD Extensions – 128-bit vectors (4× float)" color="blue" />
            <ExampleChip label="Intel AVX" desc="Advanced Vector Extensions – 256-bit vectors (8× float)" color="cyan" />
            <ExampleChip label="Intel AVX-512" desc="512-bit vectors – 16× float, used in AI workloads" color="purple" />
            <ExampleChip label="ARM NEON" desc="128-bit vectors for mobile/embedded processors" color="blue" />
            <ExampleChip label="ARM SVE" desc="Scalable Vector Extension – variable-length vectors" color="cyan" />
            <ExampleChip label="RISC-V V" desc="RISC-V Vector Extension – open ISA vector support" color="purple" />
          </div>
        </div>
      </div>
    </section>
  );
}

function ExampleChip({ label, desc, color }) {
  return (
    <div className={`example-chip accent-${color}`}>
      <div className="chip-label">{label}</div>
      <div className="chip-desc">{desc}</div>
    </div>
  );
}
