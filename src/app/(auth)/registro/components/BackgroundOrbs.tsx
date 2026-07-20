export function BackgroundOrbs() {
  return (
    <>
      <div
        className="absolute w-[350px] h-[350px] rounded-full filter blur-[100px] opacity-[0.25] pointer-events-none"
        style={{
          background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
          top: "10%",
          left: "15%",
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full filter blur-[120px] opacity-[0.2] pointer-events-none"
        style={{
          background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)",
          bottom: "10%",
          right: "15%",
        }}
      />
    </>
  );
}
